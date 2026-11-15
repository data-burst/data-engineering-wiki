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

- **Message queues** (RabbitMQ, Amazon SQS, NATS core): a message is a **task**. It is delivered to one worker, acknowledged, and then deleted.
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
      <text x="252" y="100">sara</text><text x="300" y="100">omid</text><text x="348" y="100">sara</text>
      <text x="252" y="190">ali</text><text x="300" y="190">reza</text><text x="348" y="190">ali</text>
      <text x="252" y="280">mina</text><text x="300" y="280">nika</text><text x="348" y="280">mina</text><text x="396" y="280">nika</text>
    </g>
  </g>
  <g class="f m" data-step="1">
    <line x1="150" y1="168" x2="184" y2="92" stroke="#531A8A" stroke-width="1.4" marker-end="url(#kf-ar)"/>
    <line x1="150" y1="184" x2="184" y2="180" stroke="#531A8A" stroke-width="1.4" marker-end="url(#kf-ar)"/>
    <rect x="374" y="68" width="44" height="40" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="396" y="83" text-anchor="middle" font-size="11" fill="#531A8A">3</text><text x="396" y="100" text-anchor="middle" font-size="11" fill="#531A8A">sara</text>
    <rect x="374" y="158" width="44" height="40" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="396" y="173" text-anchor="middle" font-size="11" fill="#531A8A">3</text><text x="396" y="190" text-anchor="middle" font-size="11" fill="#531A8A">ali</text>
    <text x="20" y="232" font-size="11" fill="#531A8A">key ali  → P1</text><text x="20" y="248" font-size="11" fill="#531A8A">key sara → P0</text>
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
  <li>The producer picks a partition by <b>hashing the key</b>. All orders for <b>ali</b> go to P1, so they stay in order. New messages are always appended at the end.</li>
  <li>A <b>consumer group</b> splits the partitions among its members. Each partition is read by <b>exactly one</b> consumer in the group.</li>
  <li>Consumers <b>commit offsets</b>: "next, read offset 3". After a crash, a consumer resumes from its last commit, so messages may be re-read but not skipped.</li>
  <li>A new consumer <b>C3</b> joins. The group <b>rebalances</b> and P1 moves from C1 to C3. More consumers than partitions? The extras sit idle.</li>
  <li>Reading doesn't delete anything. A second group keeps <b>its own offsets</b> over the same log, until retention (say 7 days) removes old segments.</li>
</ol>
{{< /fig >}}

## Key ideas

- **Partitions are the unit of parallelism and ordering.** Order is guaranteed only within a partition. Pick a key (order ID, user ID) so related events share a partition, and pick enough partitions for your peak consumer count.
- **Replication**: each partition has a leader broker and follower replicas. With `acks=all` and `min.insync.replicas=2`, a write is only confirmed once it is on at least two brokers.
- **Delivery semantics**: *at-most-once* (commit before processing), *at-least-once* (commit after processing, the usual default), and *exactly-once* within Kafka using idempotent producers plus transactions. For external systems, exactly-once really means at-least-once plus idempotent writes.
- **Retention and compaction**: delete messages after a time or size limit, or **compact** the topic to keep only the latest value per key (useful for CDC and changelogs).
- **Schemas**: put a schema registry in front of producers so a breaking change can't reach consumers. See [Avro]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization/avro" >}}).

## Queue vs log

| | Message queue | Event log |
|---|---|---|
| After a consumer reads | Message is acked and removed | Message stays until retention |
| Multiple consumers | Compete for messages | Each group gets every message |
| Replay history | No | Yes, reset the offset |
| Ordering | Per queue, weak with many workers | Per partition, strong |
| Per-message features | Routing, priorities, delays, dead-letter queues | Few; it's a log |
| Good for | Background jobs, commands, RPC-style work | Event streams, CDC, analytics, event sourcing |

The line is blurring: Kafka is adding queue-style **share groups** (KIP-932), and RabbitMQ **Streams** and NATS **JetStream** add log-style retention and replay.

## Tools in 2026

| Platform | Model | Notes |
|---|---|---|
| [Apache Kafka](https://kafka.apache.org/) | Partitioned log | The standard. Kafka 4.0 (2025) removed ZooKeeper; clusters run on KRaft. Tiered storage moves old segments to object storage. |
| [Redpanda](https://www.redpanda.com/) | Kafka API-compatible log | Single C++ binary, no JVM. Drop-in for Kafka clients. |
| [Apache Pulsar](https://pulsar.apache.org/) | Log + queue | Brokers are stateless; storage lives in BookKeeper. Multi-tenancy and geo-replication built in. |
| [RabbitMQ](https://www.rabbitmq.com/) | Queue (plus Streams) | AMQP, flexible routing with exchanges. Quorum queues for durability. |
| [NATS](https://nats.io/) | Pub/sub + JetStream | Very light, low latency. JetStream adds persistence and replay. |
| Kinesis, Pub/Sub, Event Hubs | Managed logs | Cloud-native, no brokers to run. Event Hubs exposes a Kafka-compatible endpoint. |

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
