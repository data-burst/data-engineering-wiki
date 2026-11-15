---
weight: 3
title: Modern Data Warehouse
description: "The modern data warehouse pattern: a data lake for raw data plus a cloud warehouse for serving, with ELT, and how it compares to a lakehouse."
---

# Modern Data Warehouse

A **modern data warehouse (MDW)** combines a [data lake]({{< relref "/docs/roadmap/data-management-architecture/data-lake" >}}) and a [relational data warehouse]({{< relref "/docs/roadmap/data-management-architecture/relational-data-warehouse" >}}) into one platform. All data lands raw and cheaply in the lake; the cleaned, modeled subset that business users need is loaded into a cloud warehouse for fast, governed SQL. The lake handles volume, variety and data science; the warehouse handles BI. The term is used this way in Microsoft's reference architectures and in James Serra's *Deciphering Data Architectures*. You will also hear "modern data warehouse" used loosely for any cloud warehouse such as Snowflake or BigQuery, which is the core of what people call the **modern data stack**.

## How data flows

1. **Ingest** from databases, SaaS apps and event streams into the lake's raw zone (Fivetran, Airbyte, Kafka Connect, [CDC]({{< relref "/docs/roadmap/data-integration/cdc" >}})).
2. **Prepare** in the lake: clean, deduplicate and convert to Parquet with Spark or dbt.
3. **Load** the curated tables into the warehouse (Snowflake, BigQuery, Redshift, Synapse / Fabric Warehouse).
4. **Model and serve** with [ELT]({{< relref "/docs/roadmap/data-integration/elt" >}}) inside the warehouse (dbt), then BI tools on top.
5. **Data science** reads directly from the lake, so it can use raw and unstructured data the warehouse never sees.

## What makes it "modern"

Compared with an on-premises warehouse of the 2000s:

- **Separation of storage and compute**: data sits in cloud object storage; compute clusters scale up, down or to zero independently. Several teams can run separate clusters on the same data.
- **Elastic, usage-based pricing** instead of buying hardware for peak load.
- **ELT instead of ETL**: raw data is loaded first and transformed with SQL inside the platform, versioned and tested with dbt.
- **Semi-structured data support**: JSON columns (`VARIANT`, `JSON`, `SUPER`) queried with SQL.

## Modern data warehouse vs lakehouse

| | Modern data warehouse | [Lakehouse]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}}) |
|---|---|---|
| Copies of curated data | Two: lake files and warehouse tables | One: open table format in the lake |
| Engines | Lake engines + warehouse engine | Any engine that reads the table format |
| Serving performance | Excellent, warehouse-native | Very good, depends on engine and table maintenance |
| Cost and complexity | Pay to store and move data twice | One storage layer, more table maintenance |
| Lock-in | Warehouse format is proprietary | Open formats |

The two are converging. Snowflake, BigQuery and Redshift now read and write Apache Iceberg tables directly, so many "modern data warehouses" in 2026 keep their curated data in Iceberg on object storage and use the warehouse only as a compute engine.

## When it fits

- You already run a cloud warehouse and want to add data science or cheap raw storage.
- BI performance and a mature SQL experience matter more than avoiding a second copy of data.
- Your team is strongest in SQL.

## Common mistakes

- Copying **everything** from lake to warehouse, paying twice for data nobody queries.
- Letting lake and warehouse definitions drift apart, so the data science model and the dashboard disagree.
- Forgetting cost controls: auto-suspend, warehouse sizing and query monitoring.

## Learning Resources

- [Deciphering Data Architectures (Chapter: The Modern Data Warehouse)](https://www.oreilly.com/library/view/deciphering-data-architectures/9781098150754/): James Serra
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/): Reis and Housley
- [The Snowflake Elastic Data Warehouse (SIGMOD 2016)](https://dl.acm.org/doi/10.1145/2882903.2903741)
- [dbt documentation](https://docs.getdbt.com/)
