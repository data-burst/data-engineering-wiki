---
title: "Clock"
description: "Time in distributed systems: clock drift and NTP, why timestamps mis-order events, Lamport and vector clocks animated, hybrid clocks and TrueTime."
weight: 4
bookToC: false
---
<div class="lx-kicker-line">$ man clock   # there is no global now</div>

# Clocks and Ordering Events

In a distributed system **there is no single clock everyone can read**. Each machine has its own quartz clock that drifts, gets corrected by NTP, and can even jump backwards. So "which happened first?" is a hard question: comparing timestamps from two machines can give the wrong answer. Distributed systems use **physical clocks** when approximate real time is enough, and **logical clocks** when they need to get causality (what could have influenced what) exactly right.

## Why wall-clock timestamps lie

- **Drift**: a typical server clock drifts tens of parts per million, which adds up to seconds per day without correction.
- **Sync error**: NTP over the internet keeps clocks within a few to tens of milliseconds; inside a good datacenter, around a millisecond or better. PTP with hardware timestamping (for example AWS Time Sync's PTP hardware clock on supported instances) can reach microseconds.
- **Jumps**: when NTP corrects a clock, or a leap second is handled badly, time-of-day can move backwards.

If node A stamps an order update at `10:00:00.120` and node B, whose clock runs 100 ms slow, stamps a later update at `10:00:00.050`, a last-write-wins database keeps the **older** one. That is real, silent data loss.

## Logical clocks: count events, not seconds

{{< fig kicker="$ ./trace --nodes 3 --clock lamport,vector" title="Lamport timestamps and vector clocks on three nodes" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 300">
  <defs>
    <marker id="ck-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3D3A49"/></marker>
  </defs>
  <g font-size="12" font-weight="600" fill="#17151F">
    <text class="m" x="20" y="76">NODE A</text><text class="m" x="20" y="166">NODE B</text><text class="m" x="20" y="256">NODE C</text>
  </g>
  <g font-size="11" fill="#8C8899">
    <text class="m" x="20" y="94">10:00:00.120</text><text class="m" x="20" y="184">10:00:00.050</text><text class="m" x="20" y="274">09:59:59.990</text>
  </g>
  <g stroke="#B5B0C4" stroke-width="1.4">
    <line x1="112" y1="80" x2="740" y2="80"/><line x1="112" y1="170" x2="740" y2="170"/><line x1="112" y1="260" x2="740" y2="260"/>
  </g>
  <text x="740" y="296" text-anchor="end" class="m" font-size="11" fill="#8C8899">each node's own time →</text>
  <!-- step 1: a, b on A, send m1 -->
  <g class="f" data-step="1">
    <line x1="230" y1="80" x2="326" y2="166" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#ck-a)"/>
    <circle cx="150" cy="80" r="6" fill="#531A8A"/><circle cx="230" cy="80" r="6" fill="#531A8A"/>
    <text x="158" y="68" class="m" font-size="11" font-weight="700" fill="#17151F">a · 1</text>
    <text x="238" y="68" class="m" font-size="11" font-weight="700" fill="#17151F">b · 2</text>
    <text x="282" y="116" class="m" font-size="11" fill="#5C5869">msg(2)</text>
  </g>
  <!-- step 2: c on B -->
  <g class="f" data-step="2">
    <circle cx="330" cy="170" r="6" fill="#531A8A"/>
    <text x="338" y="158" class="m" font-size="11" font-weight="700" fill="#17151F">c · 3</text>
  </g>
  <!-- step 3: d on C, e on B, f on C -->
  <g class="f" data-step="3">
    <line x1="450" y1="170" x2="556" y2="256" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#ck-a)"/>
    <circle cx="200" cy="260" r="6" fill="#531A8A"/>
    <circle cx="450" cy="170" r="6" fill="#531A8A"/>
    <circle cx="560" cy="260" r="6" fill="#531A8A"/>
    <text x="208" y="248" class="m" font-size="11" font-weight="700" fill="#17151F">d · 1</text>
    <text x="458" y="158" class="m" font-size="11" font-weight="700" fill="#17151F">e · 4</text>
    <text x="568" y="248" class="m" font-size="11" font-weight="700" fill="#17151F">f · 5</text>
    <text x="510" y="204" class="m" font-size="11" fill="#5C5869">msg(4)</text>
  </g>
  <!-- step 4: vector clocks -->
  <g class="f" data-step="4">
    <g font-size="11" font-weight="700" fill="#531A8A">
      <text class="m" x="158" y="52">[1,0,0]</text><text class="m" x="238" y="52">[2,0,0]</text>
      <text class="m" x="338" y="142">[2,1,0]</text><text class="m" x="458" y="142">[2,2,0]</text>
      <text class="m" x="208" y="232">[0,0,1]</text><text class="m" x="568" y="232">[2,2,2]</text>
    </g>
    <circle cx="330" cy="170" r="12" fill="none" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="3 3"/>
    <circle cx="200" cy="260" r="12" fill="none" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="3 3"/>
    <text x="250" y="296" class="m" font-size="11" font-weight="700" fill="#531A8A">c ∥ d: concurrent</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Three nodes, three clocks that disagree by up to <b>130 ms</b>. Sorting events by these timestamps would be guesswork.</li>
  <li><b>Lamport clock</b>: every node keeps a counter and adds 1 per event. Node A has events <b>a = 1</b> and <b>b = 2</b>, and sends its counter with the message.</li>
  <li>Node B receives it and sets its counter to <b>max(own, received) + 1</b> = 3. A receive is always numbered after its send.</li>
  <li>Node C's first local event <b>d</b> gets 1. The same rule gives <b>e = 4</b> and <b>f = 5</b>. If x caused y, then L(x) &lt; L(y), so sorting by Lamport time never puts an effect before its cause.</li>
  <li>The reverse is not true: <b>d = 1</b> is smaller than <b>c = 3</b>, yet neither caused the other. <b>Vector clocks</b> keep one counter per node; [0,0,1] and [2,1,0] are not comparable, which proves d and c are <b>concurrent</b>.</li>
</ol>
{{< /fig >}}

## Clock types compared

| Clock | What it gives you | Size | Used in |
|---|---|---|---|
| **Wall clock + NTP** | Approximate real time, can jump | 8 bytes | Logs, TTLs, event time in payloads |
| **Monotonic clock** | Never goes backwards, only valid on one machine | 8 bytes | Timeouts, measuring durations |
| **Lamport timestamp** | A total order consistent with causality | 1 counter | Raft/Paxos terms and log indexes are close cousins |
| **Vector clock / version vector** | Detects whether two events are causal or concurrent | 1 counter per node | Dynamo, Riak, CRDTs, conflict detection |
| **Hybrid logical clock (HLC)** | Close to wall time, still respects causality | wall time + counter | CockroachDB, YugabyteDB, MongoDB cluster time |
| **TrueTime** | A time interval with a guaranteed error bound | interval | Google Spanner (commit wait); AWS ClockBound offers a similar API |

Spanner's trick: TrueTime says "now is between *t − ε* and *t + ε*" with ε of at most a few milliseconds, using GPS and atomic clocks. Before committing, Spanner **waits out** that uncertainty, so commit timestamps match real-time order across the planet. See [Distributed Transactions]({{< relref "/docs/roadmap/distributed-systems-concepts/transaction" >}}).

## Why data engineers care

- **Event time vs processing time**: streaming engines order and window events by the timestamp inside the event, not by arrival. See [Batch and Stream Processing]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}}).
- **CDC ordering**: order database changes by the log position (PostgreSQL LSN, MySQL binlog position) or Kafka offset, not by `updated_at`.
- **Deduplication and upserts**: "keep the latest row" logic based on timestamps from different services can keep the wrong row. Prefer versions or sequence numbers from the source.
- **Conflict resolution**: last-write-wins in Cassandra or DynamoDB global tables depends on clocks. See [Consistency vs Eventual Consistency]({{< relref "/docs/roadmap/distributed-systems-concepts/consistency-vs-eventual-consistency" >}}).

## Common mistakes

- **Using `now()` from different machines to order events.** Use a single sequencer, a log offset, or a logical clock.
- **Measuring timeouts with wall-clock time.** Use the monotonic clock (`time.monotonic()`, `System.nanoTime()`).
- **Storing local time without a zone.** Store UTC (`timestamptz`), convert at the edge.
- **Assuming NTP means "in sync".** Monitor clock offset; some databases (CockroachDB) refuse to run when skew exceeds a limit, for good reason.

## Learning Resources

### Papers and articles

- [Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf): Leslie Lamport, 1978
- [Logical Physical Clocks (HLC)](https://cse.buffalo.edu/tech-reports/2014-04.pdf): Kulkarni et al., 2014
- [Spanner: Google's Globally-Distributed Database](https://research.google/pubs/spanner-googles-globally-distributed-database-2/): TrueTime and commit wait
- [There is No Now](https://queue.acm.org/detail.cfm?id=2745385): Justin Sheehy, ACM Queue

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: the chapter on the trouble with distributed systems

### Videos (Martin Kleppmann, Cambridge)

- [Distributed Systems 3.1: Physical time](https://www.youtube.com/watch?v=FQ_2N3AQu0M)
- [Distributed Systems 3.2: Clock synchronisation](https://www.youtube.com/watch?v=mAyW-4LeXZo)
- [Distributed Systems 4.1: Logical time](https://www.youtube.com/watch?v=x-D8iFU1d-o)
