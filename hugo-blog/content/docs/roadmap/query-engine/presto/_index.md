---
title: "Presto"
description: "What Presto (PrestoDB) is today: Facebook's distributed SQL engine, its split from Trino, the Linux Foundation project, and the Velox-based C++ native workers."
weight: 4
---

# Presto

**Presto** (also called **PrestoDB**) is an open-source, distributed SQL query engine for interactive analytics on large datasets. Like Trino, it separates compute from storage: a **coordinator** plans each query, **workers** scan data in parallel through **connectors** (Hive, Iceberg, Delta Lake, Hudi, MySQL, Kafka and more), and intermediate results are pipelined through memory, giving answers in seconds over petabyte-scale lakes. Facebook created Presto in 2012; since 2019 it is hosted by the **Presto Foundation** under the Linux Foundation, with Meta, IBM and Uber among its main contributors.

<img src="presto.png" alt="Presto logo" width="160">

## How it works

The architecture is the classic MPP query engine animated on the [Query Engine]({{< relref "/docs/roadmap/query-engine" >}}) page: the coordinator parses and optimizes SQL, splits the plan into stages and tasks, assigns **splits** of the data to workers, and workers exchange data to complete joins and aggregations. Tables are addressed as `catalog.schema.table`, where a catalog is a configured connector.

## Presto and Trino: one origin, two projects

In January 2019 Presto's original creators left Facebook and continued as **PrestoSQL**. Facebook kept the original repository and donated it, with the Presto trademark, to the Linux Foundation in September 2019. In December 2020 PrestoSQL was renamed **Trino**. Full timeline on the [Trino]({{< relref "../trino" >}}) page.

Both still share most concepts and much of their SQL, but they have diverged for over six years:

| | Presto (PrestoDB) | Trino |
|---|---|---|
| Governance | Presto Foundation (Linux Foundation) | Trino Software Foundation |
| Main backers | Meta, IBM (acquired Ahana in 2023), Uber, Alibaba | Starburst, plus a broad user community |
| Execution direction | **Presto C++ native workers** ("Prestissimo") built on Meta's **Velox** vectorized engine, replacing Java workers | Java engine, frequent releases; fault-tolerant execution with spooled exchanges |
| Batch / fault tolerance | **Presto on Spark** runs Presto plans as Spark jobs | `retry-policy=TASK` inside Trino |
| Commercial / managed | IBM watsonx.data, Meta and Uber internal platforms | Starburst, Amazon Athena (engine v3) |

**Which one should you pick?** For most new teams Trino has the larger community, more connectors and more managed options. Presto is a strong choice where its backers' platforms are used, or where the native C++ execution path matters for cost at very large scale. Queries written for one usually port to the other with small changes.

## Presto C++ and Velox

**Velox**, open-sourced by Meta in 2022, is a C++ library of vectorized operators (scans, filters, joins, aggregations) shared across engines. **Presto C++** replaces the Java worker with a native process that runs Velox, keeping the Java coordinator. The aim is lower CPU and memory per query and fewer JVM garbage-collection pauses. Velox is also used outside Presto, for example by Apache Gluten to accelerate Spark SQL.

## Common mistakes

- **Mixing up Presto and Trino documentation, clients and configuration.** Property names, JDBC drivers and some functions differ. Check which project and version you run.
- **Using an interactive engine for very long batch jobs** without Presto on Spark or retries: one lost worker fails the whole query.
- **Small files and missing partitions** on the lake, which make even a fast engine slow.

## Learning Resources

- [Presto documentation](https://prestodb.io/docs/current/)
- [Presto: SQL on Everything](https://trino.io/paper.html) (ICDE 2019)
- [Presto C++ (native worker) docs](https://prestodb.io/docs/current/presto-cpp.html)
- [Velox: Meta's Unified Execution Engine](https://www.vldb.org/pvldb/vol15/p3372-pedreira.pdf) (VLDB 2022)
- *Learning and Operating Presto*, Angelica Lo Duca, Tim Meehan, Vivek Bharathan and Ying Su (O'Reilly, 2023)
- [Presto 101: An Introduction to Open Source Presto](https://www.youtube.com/watch?v=rKy7ifPhwrA): video
- [Presto on GitHub](https://github.com/prestodb/presto)
