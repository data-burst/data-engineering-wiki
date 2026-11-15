---
title: "Consistency vs Eventual Consistency"
description: "Strong vs eventual consistency: consistency models from linearizable to eventual, quorums (R + W > N) animated, conflict resolution and real settings."
weight: 9
bookToC: false
---
<div class="lx-kicker-line">$ man consistency   # what can a read return?</div>

# Consistency vs Eventual Consistency

A **consistency model** is a promise about what a read can return when data is replicated. **Strong consistency** (linearizability) promises that once a write is confirmed, every later read, on any replica, sees it: the system behaves like a single copy. **Eventual consistency** only promises that if writes stop, all replicas will *eventually* agree; until then, a read may return an older value.

The trade is simple: strong consistency needs replicas to coordinate on every operation, which costs latency and availability. Eventual consistency lets each replica answer on its own, which is fast and survives partitions, but pushes stale reads and conflicts onto the application. See [CAP]({{< relref "/docs/roadmap/distributed-systems-concepts/cap" >}}) and [PACELC]({{< relref "/docs/roadmap/distributed-systems-concepts/pacelc" >}}) for the theory.

## Quorums: tuning between the two

Leaderless (Dynamo-style) databases such as Cassandra, ScyllaDB and Riak let you choose, per request, how many replicas must answer. With **N** replicas, a write waits for **W** acknowledgements and a read asks **R** replicas.

{{< fig kicker="$ cqlsh -e 'CONSISTENCY QUORUM'" title="N = 3 replicas: a stale read, a quorum read, and repair" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 300">
  <g><rect x="20" y="40" width="110" height="50" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="75" y="70" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">WRITER</text></g>
  <g><rect x="20" y="200" width="110" height="50" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="75" y="230" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">READER</text></g>
  <g text-anchor="middle">
    <rect x="400" y="20" width="160" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="480" y="44" font-size="12" font-weight="600" fill="#17151F">REPLICA A</text>
    <text class="m" x="480" y="72" font-size="13" font-weight="700" fill="#17151F">cart = v1</text>
    <rect x="400" y="115" width="160" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="480" y="139" font-size="12" font-weight="600" fill="#17151F">REPLICA B</text>
    <text class="m" x="480" y="167" font-size="13" font-weight="700" fill="#17151F">cart = v1</text>
    <rect x="400" y="210" width="160" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="480" y="234" font-size="12" font-weight="600" fill="#17151F">REPLICA C</text>
    <text class="m" x="480" y="262" font-size="13" font-weight="700" fill="#17151F">cart = v1</text>
  </g>
  <rect x="590" y="20" width="155" height="260" rx="6" fill="#fff" stroke="#E7E7EF" stroke-width="1.4"/>
  <text x="602" y="44" class="m" font-size="12" font-weight="700" fill="#17151F">N = 3</text>
  <!-- step 1: write with W=2 -->
  <g class="f" data-step="1">
    <line x1="130" y1="62" x2="400" y2="55" stroke="#531A8A" stroke-width="2"/>
    <line x1="130" y1="70" x2="400" y2="150" stroke="#531A8A" stroke-width="2"/>
    <line x1="130" y1="78" x2="400" y2="240" stroke="#C2382F" stroke-width="1.6" stroke-dasharray="4 5"/>
    <text x="250" y="52" class="m" font-size="11" fill="#531A8A">write v2</text>
    <rect x="420" y="58" width="120" height="20" fill="#fff"/>
    <text x="480" y="72" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#531A8A">cart = v2</text>
    <rect x="420" y="153" width="120" height="20" fill="#fff"/>
    <text x="480" y="167" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#531A8A">cart = v2</text>
    <text x="602" y="70" class="m" font-size="11" fill="#17151F">W = 2: wait for</text>
    <text x="602" y="86" class="m" font-size="11" fill="#17151F">A and B to ack</text>
  </g>
  <!-- step 2: R=1 stale -->
  <g class="f" data-step="2">
    <line x1="130" y1="232" x2="400" y2="248" stroke="#C2382F" stroke-width="2"/>
    <rect x="396" y="206" width="168" height="78" rx="8" fill="none" stroke="#C2382F" stroke-width="2"/>
    <text x="140" y="270" class="m" font-size="11" font-weight="700" fill="#C2382F">R = 1 → v1 (stale)</text>
    <text x="602" y="116" class="m" font-size="11" fill="#C2382F">R = 1: fast, but</text>
    <text x="602" y="132" class="m" font-size="11" fill="#C2382F">may miss the write</text>
  </g>
  <!-- step 3: R=2 overlaps -->
  <g class="f" data-step="3">
    <line x1="130" y1="218" x2="400" y2="158" stroke="#531A8A" stroke-width="2"/>
    <text x="140" y="290" class="m" font-size="11" font-weight="700" fill="#531A8A">R = 2 → {v2, v1} → newest: v2</text>
    <text x="602" y="164" class="m" font-size="12" font-weight="700" fill="#531A8A">R + W &gt; N</text>
    <text x="602" y="182" class="m" font-size="11" fill="#17151F">2 + 2 &gt; 3, so read</text>
    <text x="602" y="198" class="m" font-size="11" fill="#17151F">and write sets</text>
    <text x="602" y="214" class="m" font-size="11" fill="#17151F">always overlap</text>
  </g>
  <!-- step 4: repair -->
  <g class="f" data-step="4">
    <rect x="396" y="206" width="168" height="78" rx="8" fill="none" stroke="#FBFBFE" stroke-width="2.6"/>
    <rect x="400" y="210" width="160" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="480" y="234" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">REPLICA C</text>
    <text x="480" y="262" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#531A8A">cart = v2</text>
    <text x="602" y="246" class="m" font-size="11" font-weight="700" fill="#531A8A">read repair:</text>
    <text x="602" y="262" class="m" font-size="11" fill="#17151F">C gets v2, all agree</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Three replicas each hold version <b>v1</b> of a shopping cart.</li>
  <li>A write of <b>v2</b> with <b>W = 2</b> succeeds once A and B confirm. The copy to C is dropped.</li>
  <li>A read with <b>R = 1</b> happens to ask C and returns <b>v1</b>. Fast, available, and <b>stale</b>.</li>
  <li>A read with <b>R = 2</b> must ask two replicas. Any two overlap with the two that took the write, so it sees v2 and returns the newest. That is the <b>R + W &gt; N</b> rule.</li>
  <li>The coordinator notices C is behind and writes v2 back (<b>read repair</b>). Background <b>anti-entropy</b> does the same for data nobody reads. The replicas have <b>eventually</b> converged.</li>
</ol>
{{< /fig >}}

Quorums make stale reads much less likely, but on their own they are not full linearizability: sloppy quorums, concurrent writes and clock-based conflict resolution can still surprise you. Systems that need a hard guarantee use consensus (Raft, Paxos) instead.

## The spectrum of consistency models

| Model | Promise | Example |
|---|---|---|
| **Linearizable (strong)** | Behaves like one copy; reads see the latest confirmed write | etcd, ZooKeeper writes, Spanner, DynamoDB strongly consistent reads |
| **Sequential** | Everyone sees operations in the same order, not necessarily real-time order | ZooKeeper reads |
| **Causal** | If B depends on A (a reply to a comment), nobody sees B without A | MongoDB causal sessions, many CRDT systems |
| **Read-your-writes** | You always see your own updates | Session guarantees, sticky routing to the leader |
| **Monotonic reads** | You never see time go backwards | Pinning a user to one replica |
| **Eventual** | Replicas converge if writes stop; no promise about when | DNS, Cassandra at `ONE`, async read replicas |

Stronger models are easier to program against and slower to run. Many systems mix them: strong for money and inventory, eventual for likes, view counts and recommendations.

## When replicas disagree: resolving conflicts

Eventually consistent systems that accept writes on several replicas must merge concurrent updates:

- **Last-write-wins (LWW)**: keep the value with the highest timestamp. Simple, but silently drops writes, and clock skew can make the "last" write the older one. See [Clock]({{< relref "/docs/roadmap/distributed-systems-concepts/clock" >}}).
- **Version vectors**: detect that two writes were concurrent and keep both versions (siblings) for the application to merge.
- **CRDTs** (conflict-free replicated data types): counters, sets and maps designed so that any merge order gives the same result. Used in Riak, Redis Enterprise active-active, and collaborative editors.

## Real settings you will meet

- **Amazon S3**: strong read-after-write consistency for all objects since December 2020. Older "S3 is eventually consistent" advice is outdated.
- **DynamoDB**: eventually consistent reads by default; `ConsistentRead=true` for strong reads at twice the read cost (not available on global secondary indexes).
- **Cassandra**: consistency level per query (`ONE`, `QUORUM`, `LOCAL_QUORUM`, `ALL`).
- **PostgreSQL / MySQL read replicas**: the primary is strong; async replicas are eventually consistent. See [Replication]({{< relref "/docs/roadmap/distributed-systems-concepts/replication" >}}).
- **Data pipelines**: a CDC stream, a search index or a cache fed from a database is an eventually consistent copy of it.

## Common mistakes

- **"Eventually" with no bound.** Measure replication lag and set an alert; "eventually" in production should mean milliseconds or seconds.
- **Reading your own write from a replica.** Use leader reads or session tokens for read-after-write flows.
- **Relying on LWW for data you cannot lose**, such as counters or carts. Use CRDTs or conditional writes.
- **Choosing one model for the whole system.** Decide per entity and per query.

## Learning Resources

### Articles and papers

- [Eventually Consistent](https://www.allthingsdistributed.com/2008/12/eventually_consistent.html): Werner Vogels, the classic introduction
- [Consistency Models](https://jepsen.io/consistency): Jepsen's map of models and how they relate
- [Amazon S3 Update: Strong Read-After-Write Consistency](https://aws.amazon.com/blogs/aws/amazon-s3-update-strong-read-after-write-consistency/)
- [Eventual Consistency vs. Strong Eventual Consistency vs. Strong Consistency](https://www.baeldung.com/cs/eventual-consistency-vs-strong-eventual-consistency-vs-strong-consistency), Baeldung

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: chapters on replication and consistency

### Videos

- [Distributed Systems 7.3: Eventual consistency](https://www.youtube.com/watch?v=9uCP3qHNbWw), Martin Kleppmann
- [Data Consistency: Strong vs Eventual Consistency](https://www.youtube.com/watch?v=WZqGS-wczaY)
