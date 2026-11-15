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
