---
weight: 21
title: "Messaging and Streaming Platform"
description: "Kafka-style logs animated: producers, partitions, offsets and consumer group rebalancing, plus queues vs logs and how Kafka, Pulsar, RabbitMQ and NATS compare."
bookToC: false
---
<div class="lx-kicker-line">$ kafka-console-consumer --topic orders --group billing</div>

# Messaging and Streaming Platforms

A **messaging or streaming platform** sits between the services that produce data and the services that use it. Producers write messages to the platform; consumers read them whenever they are ready. Neither side needs to know the other exists, be online at the same time, or run at the same speed. That decoupling is why almost every real-time data pipeline, from CDC to clickstream analytics, starts with one.

There are two families, and the difference matters:

- **Message queues** (RabbitMQ, Amazon SQS, ActiveMQ): a message is a **task**. It is delivered to one worker, acknowledged, and then deleted.
- **Event logs / streaming platforms** (Apache Kafka, Redpanda, Apache Pulsar, Amazon Kinesis): a message is a **fact**. It is appended to a durable, ordered log and kept for a retention period. Any number of consumers read it independently, and can re-read it later.

## How a Kafka-style log works

{{< fig kicker="$ kafka-topics --create --topic orders --partitions 3" title="Producers, partitions, offsets and consumer groups" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 410">
  <defs><marker id="kf-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g class="m">
    <rect x="20" y="150" width="130" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="36" y="175" font-size="12" font-weight="600" fill="#17151F">PRODUCER</text><text x="36" y="194" font-size="11" fill="#5C5869">orders-svc</text>
    <rect x="180" y="20" width="330" height="300" rx="8" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.4"/><text x="196" y="44" font-size="12" font-weight="600" fill="#17151F">TOPIC orders</text>
    <g font-size="12" font-weight="600" fill="#3D3A49"><text x="196" y="93">P0</text><text x="196" y="183">P1</text><text x="196" y="273">P2</text></g>
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4">
      <rect x="230" y="68" width="44" height="40" rx="4"/><rect x="278" y="68" width="44" height="40" rx="4"/><rect x="326" y="68" width="44" height="40" rx="4"/>
      <rect x="230" y="158" width="44" height="40" rx="4"/><rect x="278" y="158" width="44" height="40" rx="4"/><rect x="326" y="158" width="44" height="40" rx="4"/>
      <rect x="230" y="248" width="44" height="40" rx="4"/><rect x="278" y="248" width="44" height="40" rx="4"/><rect x="326" y="248" width="44" height="40" rx="4"/><rect x="374" y="248" width="44" height="40" rx="4"/>
    </g>
    <g font-size="11" text-anchor="middle" fill="#8C8899">
      <text x="252" y="83">0</text><text x="300" y="83">1</text><text x="348" y="83">2</text>
      <text x="252" y="173">0</text><text x="300" y="173">1</text><text x="348" y="173">2</text>
      <text x="252" y="263">0</text><text x="300" y="263">1</text><text x="348" y="263">2</text><text x="396" y="263">3</text>
    </g>
    <g font-size="11" text-anchor="middle" fill="#3D3A49">
      <text x="252" y="100">sam</text><text x="300" y="100">owen</text><text x="348" y="100">sam</text>
      <text x="252" y="190">alice</text><text x="300" y="190">ryan</text><text x="348" y="190">alice</text>
      <text x="252" y="280">maya</text><text x="300" y="280">nora</text><text x="348" y="280">maya</text><text x="396" y="280">nora</text>
    </g>
  </g>
  <g class="f m" data-step="1">
    <line x1="150" y1="168" x2="184" y2="92" stroke="#531A8A" stroke-width="1.4" marker-end="url(#kf-ar)"/>
    <line x1="150" y1="184" x2="184" y2="180" stroke="#531A8A" stroke-width="1.4" marker-end="url(#kf-ar)"/>
    <rect x="374" y="68" width="44" height="40" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="396" y="83" text-anchor="middle" font-size="11" fill="#531A8A">3</text><text x="396" y="100" text-anchor="middle" font-size="11" fill="#531A8A">sam</text>
    <rect x="374" y="158" width="44" height="40" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="396" y="173" text-anchor="middle" font-size="11" fill="#531A8A">3</text><text x="396" y="190" text-anchor="middle" font-size="11" fill="#531A8A">alice</text>
    <text x="20" y="232" font-size="11" fill="#531A8A">key alice → P1</text><text x="20" y="248" font-size="11" fill="#531A8A">key sam   → P0</text>
  </g>
  <g class="f m" data-step="2">
    <rect x="540" y="20" width="200" height="300" rx="8" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.4"/><text x="556" y="44" font-size="12" font-weight="600" fill="#17151F">GROUP billing</text>
    <rect x="556" y="60" width="168" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="572" y="84" font-size="12" font-weight="600" fill="#17151F">C1</text><text x="572" y="106" font-size="11" fill="#5C5869">reads P0, P1</text>
    <rect x="556" y="150" width="168" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="572" y="174" font-size="12" font-weight="600" fill="#17151F">C2</text><text x="572" y="196" font-size="11" fill="#5C5869">reads P2</text>
    <g font-size="11" fill="#531A8A"><text x="430" y="93">→ C1</text><text x="430" y="183">→ C1</text><text x="430" y="273">→ C2</text></g>
  </g>
  <g class="f m" data-step="3">
    <g fill="#531A8A"><path d="M396 112l-5 8h10z"/><path d="M348 202l-5 8h10z"/><path d="M444 292l-5 8h10z"/></g>
    <g font-size="11" fill="#531A8A"><text x="230" y="134">committed 3</text><text x="230" y="224">committed 2</text><text x="230" y="312">committed 4</text></g>
  </g>
  <g class="f m" data-step="4">
    <rect x="560" y="96" width="160" height="16" fill="#fff"/><text x="572" y="106" font-size="11" fill="#5C5869">reads P0</text>
    <rect x="426" y="170" width="44" height="18" fill="#F7F7FB"/><text x="430" y="183" font-size="11" fill="#531A8A">→ C3</text>
    <rect x="556" y="240" width="168" height="60" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="572" y="264" font-size="12" font-weight="600" fill="#17151F">C3 · joined</text><text x="572" y="286" font-size="11" fill="#531A8A">reads P1</text>
    <text x="640" y="232" text-anchor="middle" font-size="11" fill="#531A8A">REBALANCE</text>
  </g>
  <g class="f m" data-step="5">
    <rect x="180" y="340" width="560" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="196" y="362" font-size="12" font-weight="600" fill="#17151F">GROUP analytics</text>
    <text x="196" y="383" font-size="11" fill="#5C5869">own offsets: P0=1  P1=0  P2=2 · reads the same messages, independently</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>A <b>topic</b> is split into <b>partitions</b>. Each partition is an append-only log, and each message gets a position in it: the <b>offset</b>.</li>
  <li>The producer picks a partition by <b>hashing the key</b>. All orders for <b>alice</b> go to P1, so they stay in order. New messages are always appended at the end.</li>
  <li>A <b>consumer group</b> splits the partitions among its members. Each partition is read by <b>exactly one</b> consumer in the group.</li>
  <li>Consumers <b>commit offsets</b>: "next, read offset 3". After a crash, a consumer resumes from its last commit, so messages may be re-read but not skipped.</li>
  <li>A new consumer <b>C3</b> joins. The group <b>rebalances</b> and P1 moves from C1 to C3. More consumers than partitions? The extras sit idle.</li>
  <li>Reading doesn't delete anything. A second group keeps <b>its own offsets</b> over the same log, until retention (say 7 days) removes old segments.</li>
</ol>
{{< /fig >}}

## Key ideas

- **Partitions are the unit of parallelism and ordering.** Order is guaranteed only within a partition. Pick a key (order ID, user ID) so related events share a partition, and pick enough partitions for your peak consumer count.
- **Replication**: each partition has a leader broker and follower replicas. With `acks=all` and `min.insync.replicas=2`, a write is only confirmed once it is on at least two brokers.
- **Delivery semantics**: at-most-once, at-least-once or exactly-once, decided by *when* the consumer commits its offset relative to its work. See [the next section](#delivery-semantics).
- **Retention and compaction**: delete messages after a time or size limit, or **compact** the topic to keep only the latest value per key (useful for CDC and changelogs).
- **Schemas**: put a schema registry in front of producers so a breaking change can't reach consumers. See [Avro]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization/avro" >}}).

## Delivery semantics

A consumer does two things with every message: it **processes** it (writes a row, calls an API) and it **commits its offset** (records "I'm done up to here"). These are two separate actions, and a crash can land between them. The order you do them in decides what a crash costs you.

{{< fig kicker="$ consumer --group billing --kill-after-poll" title="Same crash, three outcomes" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 350">
  <defs><marker id="ds-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3D3A49"/></marker></defs>
  <g class="m">
    <text x="20" y="40" font-size="12" font-weight="700" fill="#17151F">orders · P0</text>
    <text x="20" y="57" font-size="11" fill="#5C5869">offset / message</text>
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4">
      <rect x="170" y="22" width="50" height="40" rx="4"/><rect x="226" y="22" width="50" height="40" rx="4"/>
      <rect x="338" y="22" width="50" height="40" rx="4"/><rect x="394" y="22" width="50" height="40" rx="4"/>
    </g>
    <rect class="pulse" x="282" y="22" width="50" height="40" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.6"/>
    <g font-size="11" text-anchor="middle" fill="#8C8899"><text x="195" y="37">40</text><text x="251" y="37">41</text><text x="307" y="37" fill="#531A8A">42</text><text x="363" y="37">43</text><text x="419" y="37">44</text></g>
    <g font-size="11" text-anchor="middle" fill="#3D3A49"><text x="195" y="54">#1040</text><text x="251" y="54">#1041</text><text x="307" y="54" fill="#531A8A" font-weight="700">#1042</text><text x="363" y="54">#1043</text><text x="419" y="54">#1044</text></g>
    <line class="flow" x1="444" y1="42" x2="470" y2="42" stroke="#531A8A" stroke-width="1.6"/>
    <rect x="470" y="22" width="120" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="530" y="38" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">consumer</text><text x="530" y="54" text-anchor="middle" font-size="11" fill="#5C5869">billing</text>
    <line class="flow" x1="590" y1="42" x2="620" y2="42" stroke="#531A8A" stroke-width="1.6"/>
    <rect x="620" y="22" width="120" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="680" y="38" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">payments</text><text x="680" y="54" text-anchor="middle" font-size="11" fill="#5C5869">sink table</text>
    <line x1="20" y1="80" x2="740" y2="80" stroke="#E7E7EF" stroke-width="1.4"/>
    <text x="20" y="114" font-size="12" font-weight="700" fill="#17151F">AT-MOST-ONCE</text><text x="20" y="131" font-size="11" fill="#5C5869">commit, then work</text>
    <text x="20" y="194" font-size="12" font-weight="700" fill="#17151F">AT-LEAST-ONCE</text><text x="20" y="211" font-size="11" fill="#5C5869">work, then commit</text>
    <text x="20" y="274" font-size="12" font-weight="700" fill="#17151F">EXACTLY-ONCE</text><text x="20" y="291" font-size="11" fill="#5C5869">atomic or idempotent</text>
    <line x1="20" y1="160" x2="740" y2="160" stroke="#E7E7EF" stroke-width="1"/><line x1="20" y1="240" x2="740" y2="240" stroke="#E7E7EF" stroke-width="1"/>
  </g>
  <g class="f slide-r m" data-step="1">
    <g stroke="#3D3A49" stroke-width="1.4" marker-end="url(#ds-ar)"><line x1="270" y1="118" x2="288" y2="118"/><line x1="395" y1="118" x2="413" y2="118"/></g>
    <rect x="165" y="96" width="105" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="217" y="115" text-anchor="middle" font-size="11.5" fill="#17151F">poll 42</text><text x="217" y="131" text-anchor="middle" font-size="11" fill="#5C5869">#1042</text>
    <rect x="290" y="96" width="105" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="342" y="115" text-anchor="middle" font-size="11.5" fill="#17151F">commit 43</text><text x="342" y="131" text-anchor="middle" font-size="11" fill="#5C5869">offset saved</text>
    <rect x="415" y="96" width="105" height="44" rx="6" fill="#FCEDEB" stroke="#C2382F" stroke-width="1.4"/>
    <text x="467" y="115" text-anchor="middle" font-size="11.5" font-weight="700" fill="#C2382F">✗ crash</text><text x="467" y="131" text-anchor="middle" font-size="11" fill="#C2382F">before write</text>
  </g>
  <g class="f pop m" data-step="2">
    <line x1="520" y1="118" x2="538" y2="118" stroke="#3D3A49" stroke-width="1.4" stroke-dasharray="3 3" marker-end="url(#ds-ar)"/>
    <rect x="540" y="96" width="200" height="44" rx="6" fill="#FCEDEB" stroke="#C2382F" stroke-width="1.4"/>
    <text x="640" y="115" text-anchor="middle" font-size="11.5" fill="#17151F">restart from 43</text><text x="640" y="131" text-anchor="middle" font-size="11" font-weight="700" fill="#C2382F">#1042 LOST</text>
  </g>
  <g class="f slide-r m" data-step="3">
    <g stroke="#3D3A49" stroke-width="1.4" marker-end="url(#ds-ar)"><line x1="270" y1="198" x2="288" y2="198"/><line x1="395" y1="198" x2="413" y2="198"/></g>
    <rect x="165" y="176" width="105" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="217" y="195" text-anchor="middle" font-size="11.5" fill="#17151F">poll 42</text><text x="217" y="211" text-anchor="middle" font-size="11" fill="#5C5869">#1042</text>
    <rect x="290" y="176" width="105" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="342" y="195" text-anchor="middle" font-size="11.5" fill="#17151F">write #1042</text><text x="342" y="211" text-anchor="middle" font-size="11" fill="#5C5869">row in sink</text>
    <rect x="415" y="176" width="105" height="44" rx="6" fill="#FCEDEB" stroke="#C2382F" stroke-width="1.4"/>
    <text x="467" y="195" text-anchor="middle" font-size="11.5" font-weight="700" fill="#C2382F">✗ crash</text><text x="467" y="211" text-anchor="middle" font-size="11" fill="#C2382F">before commit</text>
  </g>
  <g class="f pop m" data-step="4">
    <line x1="520" y1="198" x2="538" y2="198" stroke="#3D3A49" stroke-width="1.4" stroke-dasharray="3 3" marker-end="url(#ds-ar)"/>
    <rect x="540" y="176" width="200" height="44" rx="6" fill="#FCEDEB" stroke="#C2382F" stroke-width="1.4"/>
    <text x="640" y="195" text-anchor="middle" font-size="11.5" fill="#17151F">restart from 42</text><text x="640" y="211" text-anchor="middle" font-size="11" font-weight="700" fill="#C2382F">#1042 written twice</text>
  </g>
  <g class="f slide-r m" data-step="5">
    <g stroke="#3D3A49" stroke-width="1.4" marker-end="url(#ds-ar)"><line x1="270" y1="278" x2="288" y2="278"/><line x1="520" y1="278" x2="538" y2="278"/></g>
    <rect x="165" y="256" width="105" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="217" y="275" text-anchor="middle" font-size="11.5" fill="#17151F">poll 42</text><text x="217" y="291" text-anchor="middle" font-size="11" fill="#5C5869">#1042</text>
    <rect x="290" y="256" width="230" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="405" y="275" text-anchor="middle" font-size="11.5" font-weight="700" fill="#531A8A">one transaction</text><text x="405" y="291" text-anchor="middle" font-size="11" fill="#3D3A49">write #1042 + offset 43</text>
    <rect x="540" y="256" width="200" height="44" rx="6" fill="#fff" stroke="#1F8A55" stroke-width="1.4"/>
    <text x="640" y="275" text-anchor="middle" font-size="11.5" fill="#17151F">crash: both undone</text><text x="640" y="291" text-anchor="middle" font-size="11" font-weight="700" fill="#1F8A55">retry → #1042 once</text>
  </g>
  <g class="f pop m" data-step="6">
    <rect x="165" y="312" width="575" height="28" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="452" y="331" text-anchor="middle" font-size="11.5" fill="#531A8A">or an idempotent sink: MERGE ON event_id, a replay overwrites the same row</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The consumer reads offset 42 (order #1042) and must do two things: write a payment row and commit offset 43. A crash can hit between them.</li>
  <li><b>At-most-once</b>: commit first, then process. The crash comes after the commit but before the write.</li>
  <li>On restart the group resumes at 43. Order #1042 is <b>never processed</b>. No duplicates, but data loss.</li>
  <li><b>At-least-once</b>: process first, then commit. The write succeeds, then the crash hits before the commit.</li>
  <li>On restart the group resumes at the last commit, 42, and writes #1042 <b>again</b>. Nothing is lost, but you get a duplicate.</li>
  <li><b>Exactly-once</b>: the write and the offset commit happen in <b>one transaction</b>. A crash rolls back both, so the retry processes #1042 exactly once.</li>
  <li>When the sink can't join that transaction, make the write <b>idempotent</b>: upsert keyed by the event id, so a replay changes nothing.</li>
</ol>
{{< /fig >}}

| Semantics | Commit order | On crash | Use when |
|---|---|---|---|
| At-most-once | Commit, then process | Messages lost | Losing a few is fine: metrics sampling, some logs |
| At-least-once | Process, then commit | Messages repeated | The default; pair it with idempotent consumers |
| Exactly-once | Process and commit atomically, or dedupe by key | Neither | Money, inventory, counts that must match |

How exactly-once is done in practice:

- **Inside Kafka** (read from a topic, write to a topic): use the **idempotent producer** (`enable.idempotence=true`, the default since Kafka 3.0), which stops broker-side duplicates from producer retries, plus **transactions** (`transactional.id`). The producer writes the output and the consumer offsets (`sendOffsetsToTransaction`) in one transaction, and downstream consumers read with `isolation.level=read_committed`. Kafka Streams turns this on with `processing.guarantee=exactly_once_v2`.
- **Stream processors**: Flink and Spark Structured Streaming checkpoint offsets and state together, and use transactional or idempotent sinks so outputs line up with the checkpoint.
- **External systems** (a database, a warehouse, an API): Kafka's transaction can't reach them. Either store the offset in the same database transaction as the result, or make the write idempotent (`MERGE`/upsert on a unique event id, or a dedup table). In practice "exactly-once" here means **at-least-once delivery plus idempotent processing**: the message may arrive twice, but the effect happens once.

## Queue vs log

| | Message queue | Event log |
|---|---|---|
| After a consumer reads | Message is acked and removed | Message stays until retention |
| Multiple consumers | Compete for messages | Each group gets every message |
| Replay history | No | Yes, reset the offset |
| Ordering | Per queue, weak with many workers | Per partition, strong |
| Per-message features | Routing, priorities, delays, dead-letter queues | Few; it's a log |
| Good for | Background jobs, commands, RPC-style work | Event streams, CDC, analytics, event sourcing |

The line is blurring: Kafka added queue-style **share groups** (KIP-932, production-ready since Kafka 4.2), and RabbitMQ **Streams** and NATS **JetStream** add log-style retention and replay.

## Tools in 2026

| Platform | Model | Notes |
|---|---|---|
| [Apache Kafka](https://kafka.apache.org/) | Partitioned log | The standard. Kafka 4.0 (2025) removed ZooKeeper; clusters run on KRaft. Tiered storage moves old segments to object storage. |
| [Redpanda](https://www.redpanda.com/) | Kafka API-compatible log | Single C++ binary, no JVM. Drop-in for Kafka clients. |
| [Apache Pulsar](https://pulsar.apache.org/) | Log + queue | Brokers are stateless; storage lives in BookKeeper. Multi-tenancy and geo-replication built in. |
| [RabbitMQ](https://www.rabbitmq.com/) | Queue (plus Streams) | AMQP, flexible routing with exchanges. Quorum queues for durability. |
| [NATS](https://nats.io/) | Pub/sub + JetStream | Very light, low latency. JetStream adds persistence and replay. |
| Kinesis, Pub/Sub, Event Hubs | Managed services | Cloud-native, no brokers to run. Event Hubs exposes a Kafka-compatible endpoint. |

## Common mistakes

- **Too few partitions.** You can't have more active consumers in a group than partitions. Adding partitions later changes which partition a key maps to.
- **No key, then expecting order.** Without a key, messages are spread across partitions and per-entity order is lost.
- **Auto-committing offsets before work is done.** A crash then loses messages. Commit after processing.
- **Huge messages.** Kafka defaults to about 1 MB per message. Put large files in object storage and send a pointer.
- **Using Kafka as a database.** It's a log. Materialize state into a database or a stream processor's state store.

## Learning Resources

### Books
- [Kafka: The Definitive Guide, 2nd Edition](https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/): Shapira, Palino, Sivaram and Petty
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/), Chapter 11: Martin Kleppmann
- [Streaming Systems](https://www.oreilly.com/library/view/streaming-systems/9781491983867/): Akidau, Chernyak and Lax

### Articles and docs
- [The Log: What every software engineer should know about real-time data's unifying abstraction](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying): Jay Kreps
- [Apache Kafka documentation](https://kafka.apache.org/documentation/)
- [RabbitMQ tutorials](https://www.rabbitmq.com/tutorials)
- [NATS documentation](https://docs.nats.io/)
- [Apache Pulsar documentation](https://pulsar.apache.org/docs/)

### Videos
- [Kafka in 100 Seconds](https://www.youtube.com/watch?v=uvb00oaa3k8)
- [RabbitMQ in 100 Seconds](https://www.youtube.com/watch?v=NQ3fZtyXji0)

See also: [CDC]({{< relref "/docs/roadmap/data-integration/cdc" >}}), [Batch and Stream Processing]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}})
