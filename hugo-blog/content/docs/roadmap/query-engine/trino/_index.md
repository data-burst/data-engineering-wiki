---
title: "Trino"
description: "What Trino is and how it works: coordinator and workers, connectors and catalogs, federated queries, fault-tolerant execution, and the PrestoSQL fork."
weight: 3
---

# Trino

**Trino** is an open-source, distributed SQL query engine for fast, interactive analytics over data where it already lives: Parquet and ORC files on S3 or HDFS, Iceberg, Delta Lake and Hive tables, and also PostgreSQL, MySQL, Kafka, Elasticsearch and dozens of other systems through **connectors**. It has no storage of its own. A coordinator plans each query and a fleet of workers executes it in parallel, pipelining data through memory, so queries over terabytes return in seconds. Trino was called **PrestoSQL** until December 2020; it is the fork created by Presto's original authors.

<img src="trino-twitter.png" alt="Commander Bun Bun, the Trino mascot" width="110">

## How Trino runs a query

The general flow (coordinator, splits, parallel scans, partial aggregation, exchange, final aggregation) is animated on the [Query Engine]({{< relref "/docs/roadmap/query-engine" >}}) page. Trino-specific pieces:

- **Coordinator**: accepts queries over HTTP (CLI, JDBC, BI tools), parses and optimizes them with a cost-based optimizer, breaks the plan into **stages**, and schedules **tasks** on workers. It also returns results to the client.
- **Workers**: run tasks, read **splits** through connectors, and exchange data with each other over HTTP. Data flows between operators in columnar **pages** held in memory.
- **Connectors and catalogs**: a connector is a plugin that knows how to talk to one kind of system. A **catalog** is a configured instance of a connector (`etc/catalog/lake.properties`, `etc/catalog/crm.properties`). Tables are addressed as `catalog.schema.table`.

## Federation: one query, several systems

```sql
-- Join lake data (Iceberg on S3) with live CRM data (PostgreSQL)
SELECT c.segment, SUM(o.amount) AS revenue
FROM lake.sales.orders AS o
JOIN crm.public.customers AS c ON o.customer_id = c.id
WHERE o.dt >= DATE '2026-11-01'
GROUP BY c.segment;
```

Trino pushes what it can into each source (filters, projections, sometimes aggregates and limits into PostgreSQL) and does the join itself. Federation is great for exploration and small dimension tables; for heavy recurring joins, copy the data into the lake.

## Fault-tolerant execution

By default Trino is pipelined: if a worker dies, the whole query fails and must be rerun. That is fine for 10-second dashboard queries, painful for 3-hour ETL. Since 2022, **fault-tolerant execution** (`retry-policy=TASK`) writes intermediate exchange data to a spooling store such as S3, so only failed tasks retry. It makes Trino usable for batch ETL at the cost of extra I/O.

## History: Presto, PrestoSQL, Trino

| Year | Event |
|---|---|
| 2012 | Martin Traverso, Dain Sundstrom, David Phillips and Eric Hwang start Presto at Facebook to replace slow Hive queries. |
| 2013 | Presto is open-sourced. |
| 2019 (Jan) | The founders leave Facebook and continue development as **PrestoSQL**, under the Presto Software Foundation. |
| 2019 (Sep) | Facebook donates the original repository (**PrestoDB**) and the Presto trademark to the Linux Foundation's Presto Foundation. |
| 2020 (Dec) | PrestoSQL is renamed **Trino** because of the trademark. The foundation becomes the Trino Software Foundation. |
| 2022 | Amazon Athena engine version 3 moves to Trino. Fault-tolerant execution lands. |

Since then the two projects have diverged; see [Presto]({{< relref "../presto" >}}) for how they compare today.

## Where you meet Trino

- **Self-hosted** on Kubernetes (official Helm chart) or VMs.
- **Starburst**: the main commercial company behind Trino (Starburst Enterprise and Starburst Galaxy).
- **Amazon Athena** (serverless, engine v3 is Trino-based) and **Amazon EMR**.
- Inside many in-house lakehouse platforms as the interactive SQL layer, often next to Spark for ETL.

## Common mistakes

- **Undersized memory.** Joins and aggregations happen in memory; set `query.max-memory-per-node` deliberately and enable spill-to-disk or fault-tolerant mode for big queries.
- **Letting the coordinator also act as a worker** in production clusters. It slows planning for everyone.
- **Over-relying on federation.** Pulling a 500 GB PostgreSQL table through JDBC on every query will hurt both Trino and the database.
- **Ignoring table statistics.** Without `ANALYZE` (or Iceberg/Delta stats), the cost-based optimizer guesses join order and can pick a terrible plan.

## Learning Resources

- [Trino documentation](https://trino.io/docs/current/) and [Trino concepts](https://trino.io/docs/current/overview/concepts.html)
- *Trino: The Definitive Guide* (2nd ed.), Matt Fuller, Manfred Moser and Martin Traverso (free PDF from Starburst)
- [Presto: SQL on Everything](https://trino.io/paper.html) (ICDE 2019): the architecture paper
- [Trino blog: "We're rebranding PrestoSQL as Trino"](https://trino.io/blog/2020/12/27/announcing-trino.html)
- [Trino docs: fault-tolerant execution](https://trino.io/docs/current/admin/fault-tolerant-execution.html)
- [Trino: An Origin Story](https://www.youtube.com/watch?v=_VUQ-Jh-M68): video
- [Trino on GitHub](https://github.com/trinodb/trino)
