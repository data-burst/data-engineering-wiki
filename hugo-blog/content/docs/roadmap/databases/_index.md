---
title: "Databases"
description: "A map of database families for data engineers: relational, key-value, document, columnar, wide-column, graph, time-series, vector and distributed SQL."
bookCollapseSection: true
weight: 11
---

# Databases

A **database** is software that stores data durably and answers questions about it. Every database family makes a different bet about **what the data looks like** and **which questions are asked most often**: fetch one order by id, sum a billion rows, walk a friend-of-a-friend graph, or find the ten most similar images. Pick the family whose bet matches your workload.

As a data engineer you will mostly **read from** operational databases (as sources for pipelines, often through [CDC]({{< relref "/docs/roadmap/data-integration/cdc" >}})) and **write to** analytical ones (warehouses and columnar stores).

## The families at a glance

| Family | Data model | Best at | Examples |
|---|---|---|---|
| [Relational]({{< relref "relational" >}}) | Tables with a fixed schema, joins, ACID transactions | Business records: orders, payments, users | PostgreSQL, MySQL, SQL Server, Oracle |
| [Key-value]({{< relref "noSQL/key-value" >}}) | `key → value` | Caches, sessions, very fast lookups by id | Redis, Valkey, DynamoDB |
| [Document]({{< relref "noSQL/document-based" >}}) | JSON-like documents | Nested, evolving records read as one unit | MongoDB, Couchbase, PostgreSQL `jsonb` |
| [Columnar]({{< relref "noSQL/columnar" >}}) | Tables stored column by column | Analytics: scans and aggregates over many rows | ClickHouse, Druid, Pinot, Snowflake, BigQuery |
| [Time-series]({{< relref "noSQL/time-series" >}}) | Timestamped points per series | Metrics, IoT, monitoring | Prometheus, InfluxDB, TimescaleDB |
| [Vector]({{< relref "noSQL/vector" >}}) | Embeddings (arrays of floats) | Similarity search, RAG, recommendations | Qdrant, Milvus, pgvector, Pinecone |
| [Graph]({{< relref "noSQL/graph" >}}) | Nodes and edges | Multi-hop relationships: fraud rings, social graphs | Neo4j, Neptune, Memgraph |
| [Distributed SQL (NewSQL)]({{< relref "noSQL/newsql" >}}) | Relational, sharded across nodes | ACID transactions at horizontal scale | Spanner, CockroachDB, TiDB, YugabyteDB |

## OLTP vs OLAP

The most useful split is not SQL vs NoSQL, it is **what the queries do**:

- **OLTP** (online transaction processing): many small reads and writes that touch a few rows by key. "Insert order #9812", "get user 42". Relational, key-value and document databases live here, and they store data **row by row**.
- **OLAP** (online analytical processing): fewer, heavy queries that scan millions of rows but only a few columns. "Revenue per city per day". Columnar databases and warehouses live here, and they store data **column by column**.

Running analytics directly on your production OLTP database slows down the application. That is the original reason data engineering exists: copy the data into a system built for OLAP.

## How to choose

1. Start with **PostgreSQL** unless you have a concrete reason not to. With extensions (`jsonb`, PostGIS, TimescaleDB, pgvector) it covers a surprising share of the table above.
2. Move to a specialised engine when a **measured** need appears: sub-millisecond lookups at huge QPS, scans over billions of rows, multi-region writes.
3. Remember that **every extra database is another system to back up, monitor, secure and keep in sync.**

## Learning Resources

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: chapters on data models, storage engines and replication
- [CMU 15-445/645 Intro to Database Systems](https://15445.courses.cs.cmu.edu/): Andy Pavlo's lectures, free on YouTube
- [DB-Engines ranking](https://db-engines.com/en/ranking): popularity and categories of 400+ databases
- [What Goes Around Comes Around... And Around...](https://db.cs.cmu.edu/papers/2024/whatgoesaround-sigmodrec2024.pdf): Stonebraker and Pavlo on 20 years of data models (2024)
