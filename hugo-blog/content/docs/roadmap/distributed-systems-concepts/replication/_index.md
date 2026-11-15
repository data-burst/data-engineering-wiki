---
title: "Replication"
description: "How database replication works: leaders and followers, sync vs async copies, replication lag and stale reads, failover, and multi-leader vs leaderless designs."
weight: 5
bookToC: false
---
<div class="lx-kicker-line">$ man replication   # same data, many machines</div>

# Replication

**Replication** means keeping a copy of the same data on several machines (replicas), so the system survives a dead server, serves more reads, and sits closer to users. The hard part is not copying the data once: it is keeping the copies in step while writes keep arriving and machines keep failing.

Every replicated database answers two questions:

- **Who accepts writes?** One leader, several leaders, or any replica.
- **When is a write "done"?** As soon as one machine has it (asynchronous), or only after others confirm it (synchronous).

## Watch a write travel

The most common setup is **single-leader** (also called primary/replica): clients write to the leader, the leader ships its log to the followers, and reads can go to any of them.

{{< fig kicker="$ ./replicate --mode async --followers 2" title="An async write, a lagging follower and a stale read" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 300">
  <defs>
    <marker id="rp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
    <marker id="rp-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
  </defs>
  <line x1="420" y1="130" x2="590" y2="60" stroke="#B5B0C4" stroke-width="1.4" stroke-dasharray="5 5"/>
  <line x1="420" y1="170" x2="590" y2="240" stroke="#B5B0C4" stroke-width="1.4" stroke-dasharray="5 5"/>
  <g><rect x="20" y="120" width="110" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="75" y="153" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT</text></g>
  <g><rect x="270" y="110" width="150" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="345" y="134" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">LEADER</text>
    <text x="345" y="160" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#17151F">city = Tehran</text>
    <text x="345" y="180" text-anchor="middle" class="m" font-size="11" fill="#8C8899">log pos 41</text></g>
  <g><rect x="590" y="20" width="150" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="665" y="44" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">FOLLOWER 1</text>
    <text x="665" y="70" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#17151F">city = Tehran</text>
    <text x="665" y="90" text-anchor="middle" class="m" font-size="11" fill="#8C8899">applied 41</text></g>
  <g><rect x="590" y="200" width="150" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="665" y="224" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">FOLLOWER 2</text>
    <text x="665" y="250" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#17151F">city = Tehran</text>
    <text x="665" y="270" text-anchor="middle" class="m" font-size="11" fill="#8C8899">applied 41</text></g>
  <!-- step 1: write to leader -->
  <g class="f" data-step="1">
    <line x1="130" y1="148" x2="266" y2="148" stroke="#531A8A" stroke-width="2" marker-end="url(#rp-a)"/>
    <text x="200" y="138" text-anchor="middle" class="m" font-size="11" fill="#531A8A">WRITE city=Shiraz</text>
    <text x="200" y="168" text-anchor="middle" class="m" font-size="11" fill="#5C5869">ACK right away</text>
    <rect x="280" y="146" width="130" height="38" fill="#fff"/>
    <text x="345" y="160" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#531A8A">city = Shiraz</text>
    <text x="345" y="180" text-anchor="middle" class="m" font-size="11" fill="#8C8899">log pos 42</text>
  </g>
  <!-- step 2: ship log -->
  <g class="f" data-step="2">
    <line x1="420" y1="130" x2="586" y2="62" stroke="#531A8A" stroke-width="2" marker-end="url(#rp-a)"/>
    <rect x="600" y="56" width="130" height="38" fill="#fff"/>
    <text x="665" y="70" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#531A8A">city = Shiraz</text>
    <text x="665" y="90" text-anchor="middle" class="m" font-size="11" fill="#8C8899">applied 42</text>
    <rect x="600" y="258" width="130" height="18" fill="#fff"/>
    <text x="665" y="270" text-anchor="middle" class="m" font-size="11" fill="#5C5869">applied 41 · lag 2 s</text>
    <text x="466" y="232" text-anchor="middle" class="m" font-size="11" fill="#5C5869">still in flight</text>
  </g>
  <!-- step 3: stale read -->
  <g class="f" data-step="3">
    <rect x="588" y="198" width="154" height="84" rx="7" fill="none" stroke="#C2382F" stroke-width="2"/>
    <rect x="330" y="236" width="110" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="385" y="263" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT 2</text>
    <line x1="588" y1="262" x2="444" y2="262" stroke="#C2382F" stroke-width="2" marker-end="url(#rp-r)"/>
    <text x="516" y="254" text-anchor="middle" class="m" font-size="11" fill="#C2382F">Tehran (stale)</text>
  </g>
  <!-- step 4: catch up -->
  <g class="f" data-step="4">
    <line x1="420" y1="170" x2="586" y2="238" stroke="#531A8A" stroke-width="2" marker-end="url(#rp-a)"/>
    <rect x="588" y="198" width="154" height="84" rx="7" fill="none" stroke="#FBFBFE" stroke-width="2.6"/>
    <rect x="590" y="200" width="150" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="665" y="224" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">FOLLOWER 2</text>
    <text x="665" y="250" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#531A8A">city = Shiraz</text>
    <text x="665" y="270" text-anchor="middle" class="m" font-size="11" fill="#8C8899">applied 42</text>
  </g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>client</td><td>leader</td><td class="tag">WRITE</td><td>user 42 city = Shiraz → log pos 42, ack</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>leader</td><td>follower1</td><td class="tag">REPLICATE</td><td>pos 42 applied</td></tr>
<tr class="f" data-step="2"><td>3</td><td>02</td><td>leader</td><td>follower2</td><td class="tag">REPLICATE</td><td>pos 42 delayed (busy disk, slow link)</td></tr>
<tr class="f" data-step="3"><td>4</td><td>03</td><td>client2</td><td>follower2</td><td class="err">READ</td><td>city = Tehran · stale by 2 s</td></tr>
<tr class="f" data-step="4"><td>5</td><td>04</td><td>leader</td><td>follower2</td><td class="tag">REPLICATE</td><td>pos 42 applied · replicas agree</td></tr>
</table>
<ol class="lx-caps">
  <li>One leader and two followers all store <b>user 42: city = Tehran</b>. Only the leader accepts writes.</li>
  <li>The user moves to Shiraz. The leader appends the change to its <b>log</b> and, in <b>async</b> mode, confirms to the client immediately.</li>
  <li>The leader streams the log to its followers. Follower 1 applies it; follower 2 is busy and <b>lags</b> behind.</li>
  <li>Another client reads from follower 2 and gets <b>Tehran</b>: a <b>stale read</b> caused by replication lag.</li>
  <li>Follower 2 catches up and the replicas agree again. Async replicas are <b>eventually consistent</b>.</li>
</ol>
{{< /fig >}}

If the leader had crashed between step 1 and step 2, the client would have been told "saved" while no other machine had the write. Promoting a follower at that moment **loses the write**. That is the core trade-off of asynchronous replication.

## Synchronous vs asynchronous

| Mode | Write is acknowledged when | Upside | Downside |
|---|---|---|---|
| **Synchronous** | every (or a chosen) follower has it | No data loss on failover | One slow follower slows every write; one dead follower can block writes |
| **Semi-synchronous** | at least one follower has it | Survives a leader crash, bounded slowdown | Still pays one network round trip per write |
| **Asynchronous** | the leader has it | Fastest writes, followers can be far away | Recent writes are lost if the leader dies; followers serve stale data |

PostgreSQL controls this with `synchronous_commit` and `synchronous_standby_names`, MySQL with semi-sync plugins, and Kafka with `acks=all` plus `min.insync.replicas`. The latency cost of waiting is the "else" half of [PACELC]({{< relref "/docs/roadmap/distributed-systems-concepts/pacelc" >}}).

## Three replication topologies

| Topology | Who accepts writes | Examples | Watch out for |
|---|---|---|---|
| **Single-leader** | One leader per dataset (or per partition) | PostgreSQL, MySQL, MongoDB replica sets, Kafka partitions | Failover: detecting a dead leader, avoiding two leaders (split brain) |
| **Multi-leader** | One leader per region or device | Multi-region MySQL/Postgres setups, offline-first apps, CouchDB | Write conflicts: two leaders change the same row at once |
| **Leaderless** | Any replica; client writes to several | Cassandra, ScyllaDB, Riak, DynamoDB internally | Needs quorums, read repair and conflict resolution; see [Consistency vs Eventual Consistency]({{< relref "/docs/roadmap/distributed-systems-concepts/consistency-vs-eventual-consistency" >}}) |

Leader election and failover in modern systems usually rely on a consensus protocol (Raft in etcd, CockroachDB, Kafka KRaft; Paxos in Spanner) so that the cluster agrees on exactly one leader.

## Living with replication lag

Async followers are always a little behind, normally milliseconds, sometimes minutes under load. Three guarantees fix the most visible problems:

- **Read-your-writes**: after a user saves their profile, read it back from the leader (or from a replica that has caught up to that write's log position).
- **Monotonic reads**: pin a user to one replica so a refresh never shows *older* data than the previous page.
- **Consistent prefix**: readers see writes in the order they happened, so an answer never appears before its question.

## How replicas are fed

- **Statement-based**: ship the SQL text. Breaks on `NOW()`, `RANDOM()` and triggers. Mostly historical.
- **Physical log (WAL) shipping**: ship disk-level changes. Exact copies, but leader and follower must run the same version.
- **Logical (row-based) log**: ship "row X changed from A to B". Works across versions and is what [change data capture]({{< relref "/docs/roadmap/data-integration/cdc" >}}) tools like Debezium read.

## Replication vs sharding

Replication copies **the same data** to more machines (more availability, more read capacity). [Sharding]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}}) splits **different data** across machines (more storage and write capacity). Production systems combine them: each shard is replicated.

## Common mistakes

- **Treating a replica as a backup.** A `DROP TABLE` or a bad migration replicates in milliseconds. Keep point-in-time backups too.
- **Reading from a replica right after writing.** Classic bug: "I saved it and it disappeared." Route those reads to the leader.
- **Running analytics on the primary.** Point heavy BI or ELT extraction at a read replica or at CDC instead.
- **Ignoring lag metrics.** Alert on replica lag (seconds and bytes) the same way you alert on CPU.
- **Automatic failover without fencing.** If the old leader is only slow, not dead, you can end up with two leaders accepting writes.

## Learning Resources

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: the replication chapter
- [Database Internals](https://www.oreilly.com/library/view/database-internals/9781492040330/), Alex Petrov: part II on distributed systems

### Docs and articles

- [PostgreSQL: High Availability, Load Balancing, and Replication](https://www.postgresql.org/docs/current/high-availability.html)
- [In Search of an Understandable Consensus Algorithm (Raft)](https://raft.github.io/raft.pdf): how leaders are elected safely
- [Jepsen analyses](https://jepsen.io/analyses): what real databases lose during failover

### Videos

- [Distributed Systems 5.1: Replication](https://www.youtube.com/watch?v=mBUCF1WGI_I), Martin Kleppmann
- [Database Replication Explained (in 5 Minutes)](https://www.youtube.com/watch?v=bI8Ry6GhMSE)
