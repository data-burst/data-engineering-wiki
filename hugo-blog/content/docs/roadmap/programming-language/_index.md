---
title: "Programming Language"
description: "Which programming languages data engineers need in 2026: Python and SQL first, then where Java, Scala, Go and Rust fit in the data tooling ecosystem."
bookCollapseSection: true
weight: 1
---

# Programming Language

A data engineer writes code to move, transform and serve data, and to build the platforms that do it. **SQL** (covered in [SQL Fundamentals]({{< relref "../sql-fundamentals" >}})) is the language of transformation; a **general-purpose language** is needed for everything around it: ingestion scripts, orchestration, APIs, custom connectors, tests and infrastructure.

You do not need all of these. The practical path in 2026 is **Python first**, solid SQL alongside it, and then one compiled language when your work requires it.

## How the languages divide the work

| Language | Main role in data engineering | Data tools written in it |
|---|---|---|
| [Python]({{< relref "python" >}}) | Glue, orchestration, transformation, ML handoff: the default | Airflow, Dagster, Prefect, dbt Core, pandas, PySpark API |
| [Java]({{< relref "java" >}}) | The engine room of big data on the JVM | Kafka, Flink, Trino, Iceberg, Hadoop, Cassandra, Elasticsearch |
| [Scala]({{< relref "scala" >}}) | Spark internals and Spark-heavy teams | Spark core, parts of Kafka |
| [Go]({{< relref "go" >}}) | Cloud-native infrastructure and network services | Kubernetes, Docker, Terraform, Prometheus, Grafana Loki, etcd |
| [Rust]({{< relref "rust" >}}) | New high-performance engines and Python tooling | Polars, DataFusion, delta-rs, Vector, uv, ruff, dbt Fusion engine |

Two trends shape the picture: **Python is the interface** to almost every engine (PySpark, Polars, DuckDB, Flink's PyFlink), and the engines underneath are increasingly **written in Rust or C++** and connected through **Apache Arrow**, so Python users get native speed without leaving Python.

## Choosing what to learn next

- **You build pipelines and models**: deepen Python and SQL. That covers most data engineering jobs.
- **You work on Kafka, Flink or JVM services**: learn Java. Reading Java stack traces and configs is useful for anyone running these systems.
- **You maintain a large Scala Spark codebase**: learn Scala; for new Spark projects, PySpark and Spark SQL are now the common choice.
- **You build platform tooling, operators or CLIs**: learn Go.
- **You build engines, connectors or performance-critical libraries**: learn Rust.

## Learning Resources

- [Stack Overflow Developer Survey](https://survey.stackoverflow.co/): yearly data on language usage
- *Fundamentals of Data Engineering*, Joe Reis and Matt Housley (O'Reilly): chapter on the data engineering toolkit
- [Apache Arrow](https://arrow.apache.org/): the columnar format that lets these languages share data without copying
