---
title: "NewSQL"
description: "What NewSQL (distributed SQL) databases are: sharded, Raft-replicated relational systems with ACID transactions, like Spanner, CockroachDB, TiDB and YugabyteDB."
weight: 7
---

# NewSQL (Distributed SQL)

**NewSQL**, now usually called **distributed SQL**, describes relational databases that keep SQL and ACID transactions but spread data across many machines like NoSQL systems do. You talk to it like PostgreSQL or MySQL, while underneath the tables are split into ranges, every range is replicated with a consensus protocol (Paxos or Raft), and a node or even a whole datacenter can fail without losing committed data. The trade-off is latency: a write must reach a majority of replicas before it commits.

## How it works

1. **Split.** Each table (and index) is cut into ranges by primary key, typically tens to hundreds of MB each. Ranges split and move automatically as data grows. See [Sharding]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}}).
2. **Replicate with consensus.** Each range has 3 or 5 replicas forming a Raft or Paxos group. A write commits when a majority acknowledges it, so there is no data loss when a minority fails. See [Replication]({{< relref "/docs/roadmap/distributed-systems-concepts/replication" >}}).
3. **Transactions across ranges.** A transaction touching rows in different ranges uses a two-phase commit coordinated across the consensus groups.
4. **Ordering with clocks.** To give a global order to transactions, Spanner uses **TrueTime** (GPS and atomic clocks with bounded uncertainty); CockroachDB and YugabyteDB use hybrid logical clocks; TiDB uses a central timestamp oracle. See [Clock]({{< relref "/docs/roadmap/distributed-systems-concepts/clock" >}}).

In [CAP]({{< relref "/docs/roadmap/distributed-systems-concepts/cap" >}}) terms these systems are **CP**: a minority side of a partition stops accepting writes rather than diverge.

## Popular systems

| Database | Compatible with | License / delivery | Notes |
|---|---|---|---|
| **[Google Spanner](https://cloud.google.com/spanner)** | GoogleSQL, PostgreSQL dialect | Managed (Google Cloud) | The original (2012 paper). External consistency via TrueTime. |
| **[CockroachDB](https://www.cockroachlabs.com/)** | PostgreSQL wire protocol | Source-available; since late 2024 one Enterprise license, free for small companies | Inspired by Spanner; multi-region tables with data placement rules. |
| **[TiDB](https://www.pingcap.com/)** | MySQL | Apache 2.0 | Row store (TiKV) plus a columnar replica (TiFlash) for analytics on the same data. |
| **[YugabyteDB](https://www.yugabyte.com/)** | PostgreSQL (reuses Postgres query layer) | Apache 2.0 | Also offers a Cassandra-compatible API. |
| **[Amazon Aurora DSQL](https://aws.amazon.com/rds/aurora/dsql/)** | PostgreSQL | Managed (AWS), GA 2025 | Serverless, multi-region active-active; some Postgres features unsupported. |

Note that **Amazon Aurora** (non-DSQL) and **Neon** separate storage from compute but still have a single writer; they scale reads and storage, not write throughput.

## When to use one

- **Good fit:** you need relational data and strong consistency, but more write throughput, data size or regional resilience than one primary can give: global payments, inventory, user accounts across regions.
- **Probably not needed:** a single PostgreSQL with replicas handles the load. Distributed SQL adds per-write latency, cost and operational complexity, and some features (certain extensions, triggers, sequences) behave differently or are missing.

## Common mistakes

- **Sequential primary keys** (auto-increment ids, timestamps) send every insert to the last range, creating a hotspot. Use UUIDs or hash-sharded indexes.
- **Expecting single-node latency.** Each commit waits for a quorum, and multi-region quorums add tens of milliseconds.
- **Long, wide transactions** that touch many ranges retry more often under contention.

## Learning Resources

- [Spanner: Google's Globally-Distributed Database](https://research.google/pubs/spanner-googles-globally-distributed-database-2/) (OSDI 2012)
- [CockroachDB: The Resilient Geo-Distributed SQL Database](https://dl.acm.org/doi/10.1145/3318464.3386134) (SIGMOD 2020)
- [In Search of an Understandable Consensus Algorithm (Raft)](https://raft.github.io/raft.pdf) and the [Raft visualization](https://raft.github.io/)
- [CockroachDB docs](https://www.cockroachlabs.com/docs/stable/), [TiDB docs](https://docs.pingcap.com/tidb/stable/), [YugabyteDB docs](https://docs.yugabyte.com/)
- [What's Really New with NewSQL?](https://db.cs.cmu.edu/papers/2016/pavlo-newsql-sigmodrec2016.pdf): Pavlo and Aslett, 2016
