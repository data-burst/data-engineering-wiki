---
title: "NoSQL"
description: "What NoSQL means, why non-relational databases exist, and how key-value, document, columnar, time-series, vector, graph and NewSQL systems differ."
weight: 2
---

# NoSQL

**NoSQL** ("not only SQL") is an umbrella term for databases that do not use the classic relational model of normalized tables and joins. Most appeared in the late 2000s, when companies like Amazon (Dynamo) and Google (Bigtable) needed to spread data over hundreds of cheap machines and traded some relational features, such as joins, a rigid schema or multi-row transactions, for **horizontal scale, availability, or a data model that fits one access pattern very well**.

The term is fuzzy today. Many "NoSQL" systems now speak SQL (Cassandra's CQL, ClickHouse, InfluxDB 3), document stores support multi-document transactions, and PostgreSQL stores JSON. Think in **data models and access patterns**, not in SQL vs NoSQL.

## Pages in this section

| Page | One-line summary |
|---|---|
| [Columnar]({{< relref "columnar" >}}) | Column-oriented analytical stores (ClickHouse, Druid) and wide-column stores (Cassandra, HBase), plus the LSM-tree write path many of them share |
| [Document]({{< relref "document-based" >}}) | JSON documents with a flexible schema; embed what you read together |
| [Key-value]({{< relref "key-value" >}}) | The simplest model: `get`/`put` by key, partitioned by hashing |
| [Time-series]({{< relref "time-series" >}}) | Append-mostly timestamped points with compression, downsampling and retention |
| [Vector]({{< relref "vector" >}}) | Nearest-neighbour search over embeddings, the storage layer behind RAG |
| [Graph]({{< relref "graph" >}}) | Nodes and relationships for multi-hop queries |
| [NewSQL]({{< relref "newsql" >}}) | Distributed SQL: relational and ACID, but sharded and replicated like NoSQL |

## Trade-offs to keep in mind

- **Query-first modeling.** In Cassandra or DynamoDB you design tables around the queries you will run. An unplanned query may be impossible or need a full scan.
- **Consistency is tunable, not free.** Many NoSQL stores default to eventual consistency. See [CAP]({{< relref "/docs/roadmap/distributed-systems-concepts/cap" >}}) and [Consistency vs Eventual Consistency]({{< relref "/docs/roadmap/distributed-systems-concepts/consistency-vs-eventual-consistency" >}}).
- **Schema-less is not schema-free.** The schema moves into your application code, and pipelines reading the data must cope with every version of it.

## Learning Resources

- [Dynamo: Amazon's Highly Available Key-value Store](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) (2007)
- [Bigtable: A Distributed Storage System for Structured Data](https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/) (2006)
- *Designing Data-Intensive Applications* (2nd ed.): chapter on data models and query languages
- *NoSQL Distilled*, Pramod Sadalage and Martin Fowler: a short, readable overview
