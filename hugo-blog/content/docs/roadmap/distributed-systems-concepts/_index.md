---
bookCollapseSection: true
weight: 9
description: "Distributed systems for data engineers: replication, sharding, consistency, CAP and PACELC, clocks, transactions and indexing, with animated lessons."
---

# Distributed Systems

A **distributed system** is a group of computers that work together over a network and look like one system to their users. Almost every tool a data engineer touches is one: Kafka, Spark, Flink, Trino, Cassandra, Snowflake, BigQuery, and every lakehouse on object storage. You spread work over many machines to store more data, handle more traffic and survive failures, and in exchange you inherit problems a single machine never has: **networks drop messages, machines fail independently, and clocks disagree.**

This section explains the handful of ideas behind those trade-offs. Once they click, the documentation of most data tools reads very differently.

<div class="lx-cards">
  <div class="lx-card"><div class="lab">Partial failure</div><h4>Some parts break, others don't</h4><p>A node can be dead, slow or just unreachable, and from the outside these look the same.</p></div>
  <div class="lx-card"><div class="lab">No shared memory</div><h4>Nodes only exchange messages</h4><p>Every message can be delayed, duplicated or lost. Agreement has to be built on top.</p></div>
  <div class="lx-card"><div class="lab">No global clock</div><h4>"Now" depends on who you ask</h4><p>Ordering events across machines needs care, not just timestamps.</p></div>
</div>

## Why go distributed: scaling up vs scaling out

When one machine can't keep up, you have two options. **Scale up (vertical scaling)**: move to a bigger machine with more CPU, memory and disk. **Scale out (horizontal scaling)**: add more ordinary machines and split the data and work between them, so the group behaves as one **cluster**.

{{< fig kicker="$ add-capacity --strategy up|out" title="A bigger machine vs more machines" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <g class="m">
    <rect x="20" y="16" width="340" height="300" rx="8" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.4"/>
    <rect x="400" y="16" width="340" height="300" rx="8" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.4"/>
    <text x="36" y="40" font-size="12" font-weight="700" fill="#17151F">SCALE UP · vertical</text>
    <text x="416" y="40" font-size="12" font-weight="700" fill="#17151F">SCALE OUT · horizontal</text>
    <line x1="40" y1="76" x2="340" y2="76" stroke="#8C8899" stroke-width="1.4" stroke-dasharray="5 4"/>
    <text x="190" y="68" text-anchor="middle" font-size="11" fill="#5C5869">largest machine you can buy</text>
    <rect x="140" y="226" width="100" height="64" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="190" y="250" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">db-1</text>
    <text x="190" y="270" text-anchor="middle" font-size="11" fill="#5C5869">4 CPU · 16 GB</text>
    <rect x="412" y="210" width="74" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="449" y="236" text-anchor="middle" font-size="11.5" font-weight="700" fill="#17151F">node-1</text>
    <text x="449" y="256" text-anchor="middle" font-size="11" fill="#3D3A49">A–Z</text>
    <text x="449" y="274" text-anchor="middle" font-size="11" fill="#5C5869">all</text>
  </g>
  <g class="f pop m" data-step="1">
    <rect x="110" y="160" width="160" height="130" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="190" y="186" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">db-1</text>
    <text x="190" y="206" text-anchor="middle" font-size="11" fill="#5C5869">16 CPU · 64 GB</text>
  </g>
  <g class="f pop m" data-step="2">
    <rect x="70" y="82" width="240" height="208" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="190" y="108" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">db-1</text>
    <text x="190" y="128" text-anchor="middle" font-size="11" fill="#5C5869">192 CPU · 2 TB</text>
    <text x="190" y="148" text-anchor="middle" font-size="11" fill="#5C5869">price grows faster</text>
    <line class="pulse" x1="40" y1="76" x2="340" y2="76" stroke="#C2382F" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="190" y="68" text-anchor="middle" font-size="11" font-weight="700" fill="#C2382F">largest machine you can buy</text>
    <text x="190" y="256" text-anchor="middle" font-size="11" fill="#C2382F">one machine,</text>
    <text x="190" y="272" text-anchor="middle" font-size="11" fill="#C2382F">one failure takes all</text>
  </g>
  <g class="f slide-l m" data-step="3">
    <g class="flow" stroke="#531A8A" stroke-width="1.4"><line x1="550" y1="116" x2="449" y2="210"/><line x1="560" y1="116" x2="531" y2="210"/><line x1="580" y1="116" x2="613" y2="210"/></g>
    <rect x="500" y="66" width="140" height="50" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="570" y="87" text-anchor="middle" font-size="12" font-weight="700" fill="#531A8A">coordinator</text>
    <text x="570" y="105" text-anchor="middle" font-size="11" fill="#5C5869">routes · merges</text>
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4"><rect x="412" y="210" width="74" height="80" rx="6"/><rect x="494" y="210" width="74" height="80" rx="6"/><rect x="576" y="210" width="74" height="80" rx="6"/></g>
    <g text-anchor="middle">
      <g font-size="11.5" font-weight="700" fill="#17151F"><text x="449" y="236">node-1</text><text x="531" y="236">node-2</text><text x="613" y="236">node-3</text></g>
      <g font-size="11" fill="#3D3A49"><text x="449" y="256">A–H</text><text x="531" y="256">I–P</text><text x="613" y="256">Q–Z</text></g>
      <g font-size="11" fill="#5C5869"><text x="449" y="274">1/3</text><text x="531" y="274">1/3</text><text x="613" y="274">1/3</text></g>
    </g>
  </g>
  <g class="f slide-l m" data-step="4">
    <line class="flow" x1="600" y1="116" x2="695" y2="210" stroke="#531A8A" stroke-width="1.4"/>
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4"><rect x="412" y="210" width="74" height="80" rx="6"/><rect x="494" y="210" width="74" height="80" rx="6"/><rect x="576" y="210" width="74" height="80" rx="6"/></g>
    <rect x="658" y="210" width="74" height="80" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <g text-anchor="middle">
      <g font-size="11.5" font-weight="700" fill="#17151F"><text x="449" y="236">node-1</text><text x="531" y="236">node-2</text><text x="613" y="236">node-3</text><text x="695" y="236" fill="#531A8A">node-4</text></g>
      <g font-size="11" fill="#3D3A49"><text x="449" y="256">A–F</text><text x="531" y="256">G–L</text><text x="613" y="256">M–R</text><text x="695" y="256">S–Z</text></g>
      <g font-size="11" fill="#5C5869"><text x="449" y="274">1/4</text><text x="531" y="274">1/4</text><text x="613" y="274">1/4</text><text x="695" y="274">1/4</text></g>
    </g>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.8s" repeatCount="indefinite" path="M613 292 Q654 312 695 292"/></circle>
  </g>
  <g class="f pop m" data-step="5">
    <text x="570" y="58" text-anchor="middle" font-size="11" fill="#531A8A">SELECT count(*) FROM orders</text>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M550 116 L449 210"/></circle>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M560 116 L531 210"/></circle>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M580 116 L613 210"/></circle>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M600 116 L695 210"/></circle>
    <text x="520" y="308" text-anchor="middle" font-size="11" fill="#17151F">120 + 98 + 131 + 105 = <tspan font-weight="700" fill="#531A8A">454</tspan></text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Both sides start the same: one machine holds all the data and does all the work.</li>
  <li><b>Scale up</b>: move to a bigger machine. No code changes, no new failure modes. This is the right first move surprisingly often.</li>
  <li>But there is a <b>ceiling</b>: the biggest instance on the market. Price rises faster than capacity near the top, and it is still one machine that can fail.</li>
  <li><b>Scale out</b>: split the data across three nodes by key range. A <b>coordinator</b> (or a smart client) knows which node holds which keys.</li>
  <li>Need more? <b>Add a node</b> and rebalance: some keys move to node-4 and each node now holds a quarter. Capacity grows in small steps with no hard ceiling.</li>
  <li>A query fans out: every node counts its part <b>in parallel</b> and the coordinator merges the partial results. This is how Spark, Trino and most warehouses work.</li>
</ol>
{{< /fig >}}

| | Scale up (vertical) | Scale out (horizontal) |
|---|---|---|
| How | Bigger CPU, RAM, disk on one machine | More machines, data and work split between them |
| Limit | The largest machine available | Coordination and network costs, not hardware |
| Failure | One machine down means everything down | A node can fail; [replicas]({{< relref "/docs/roadmap/distributed-systems-concepts/replication" >}}) on other nodes take over |
| Complexity | Low: same software, same queries | High: [sharding]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}}), rebalancing, network partitions, [consistency]({{< relref "/docs/roadmap/distributed-systems-concepts/consistency-vs-eventual-consistency" >}}) trade-offs |
| Examples | A larger Postgres instance, a bigger single-node DuckDB box | Kafka brokers, Spark executors, Cassandra rings, Snowflake/BigQuery compute |

A practical rule: scale up while you can, because a single machine is simpler and today's large instances are very large. Scale out when the data or traffic outgrows the biggest sensible machine, or when you need the system to survive a machine failure.

## What's in this section

**Spreading the data**

- [Replication]({{< relref "/docs/roadmap/distributed-systems-concepts/replication" >}}): copies on several machines; leaders, followers, sync vs async and replication lag.
- [Sharding]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}}): splitting data across machines; range vs hash partitioning and choosing a shard key.
- [Indexing]({{< relref "/docs/roadmap/distributed-systems-concepts/indexing" >}}): finding rows without scanning everything; B-trees, index types and local vs global indexes.

**Keeping copies correct**

- [CAP]({{< relref "/docs/roadmap/distributed-systems-concepts/cap" >}}): what a replicated database must give up when the network splits.
- [PACELC]({{< relref "/docs/roadmap/distributed-systems-concepts/pacelc" >}}): the everyday trade-off between latency and consistency.
- [Consistency vs Eventual Consistency]({{< relref "/docs/roadmap/distributed-systems-concepts/consistency-vs-eventual-consistency" >}}): consistency models, quorums and conflict resolution.
- [Clock]({{< relref "/docs/roadmap/distributed-systems-concepts/clock" >}}): why timestamps lie, and Lamport, vector and hybrid clocks.

**Changing data safely**

- [ACID]({{< relref "/docs/roadmap/distributed-systems-concepts/acid" >}}): transaction guarantees and isolation levels inside one database.
- [Distributed Transactions]({{< relref "/docs/roadmap/distributed-systems-concepts/transaction" >}}): two-phase commit, sagas and the outbox pattern across machines.
- [Normalization or Denormalization]({{< relref "/docs/roadmap/distributed-systems-concepts/normalization-or-denormalization" >}}): store each fact once, or copy it where it is read.

**Processing data**

- [Batch and Stream Processing]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}}): process data in scheduled chunks or event by event.

A good reading order for newcomers: replication, sharding, CAP, consistency, then the rest in any order.

## Learning Resources

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: the standard reference for everything in this section
- [Distributed Systems](https://www.distributed-systems.net/index.php/books/ds4/), Maarten van Steen and Andrew Tanenbaum: free digital edition
- [Designing Distributed Systems](https://www.oreilly.com/library/view/designing-distributed-systems/9781491983638/), Brendan Burns: patterns for containerized systems
- [Database Internals](https://www.oreilly.com/library/view/database-internals/9781492040330/), Alex Petrov

### Courses

- [Distributed Systems lecture series](https://www.youtube.com/playlist?list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB), Martin Kleppmann (University of Cambridge): short, clear videos
- [MIT 6.5840 (formerly 6.824) Distributed Systems](https://pdos.csail.mit.edu/6.824/): labs build Raft and a sharded key-value store; [2020 lecture videos](https://www.youtube.com/watch?v=cQP8WApzIQQ&list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB)

### Articles

- [Fallacies of distributed computing explained](https://www.rgoarchitects.com/Files/fallacies.pdf), Arnon Rotem-Gal-Oz
- [Jepsen analyses](https://jepsen.io/analyses): how real databases behave when things go wrong
