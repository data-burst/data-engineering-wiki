---
weight: 1
title: Relational Data Warehouse
description: "What a relational data warehouse is: OLTP vs OLAP, ETL into modeled tables, Inmon vs Kimball, MPP engines, and where it still fits in 2026."
---

# Relational Data Warehouse

A **relational data warehouse (RDW)** is a database built for analysis rather than for running the business. Data from operational systems (orders, CRM, billing) is extracted, cleaned and loaded into modeled SQL tables, so analysts can ask questions across the whole company with one query and get one trusted answer. It is "relational" because everything is tables with schemas, keys and SQL, and it is the original pattern that every later architecture builds on.

## OLTP vs OLAP

Operational databases and warehouses are tuned for opposite workloads:

| | OLTP (operational DB) | OLAP (data warehouse) |
|---|---|---|
| Typical query | Fetch or update order #1234 | Revenue by city by month for 3 years |
| Rows touched per query | A few | Millions to billions |
| Writes | Many small transactions | Bulk loads, append-mostly |
| Data model | Normalized (3NF) | Dimensional (star) or integrated 3NF |
| Storage | Row-oriented | Usually columnar |
| Examples | PostgreSQL, MySQL, SQL Server | Snowflake, BigQuery, Redshift, Synapse / Fabric Warehouse, ClickHouse, Teradata |

Running heavy analytics on the production database slows down the application and only sees one system. A warehouse fixes both.

## How it works

1. **Extract** data from source systems on a schedule (or continuously with [CDC]({{< relref "/docs/roadmap/data-integration/cdc" >}})).
2. **Transform** it in a staging area: clean types, deduplicate, conform keys across sources.
3. **Load** it into modeled tables. This is **schema-on-write**: data must fit the schema before it is stored.
4. **Serve** it to BI tools, reports and ad-hoc SQL.

Traditional warehouses ran [ETL]({{< relref "/docs/roadmap/data-integration/etl" >}}) on separate servers. Cloud warehouses are powerful enough to transform inside the warehouse, so [ELT]({{< relref "/docs/roadmap/data-integration/elt" >}}) with tools like dbt is now the norm.

## Inmon vs Kimball

The two classic design schools:

- **Bill Inmon (top-down)**: build one integrated, normalized (3NF) enterprise warehouse first, then derive departmental [data marts]({{< relref "/docs/roadmap/data-management-architecture/data-mart" >}}) from it. Strong consistency, slower to deliver.
- **Ralph Kimball (bottom-up)**: build [star schemas]({{< relref "/docs/roadmap/data-modeling/star-schema" >}}) per business process, tied together with shared (conformed) dimensions. Faster to deliver value, needs discipline to stay consistent.

Most modern teams use a blend: a cleaned integration layer, then Kimball-style marts.

## Under the hood: MPP and columnar storage

Analytical warehouses scale with **massively parallel processing (MPP)**: a query is split across many nodes, each scanning its slice of the data. Data is stored **column by column** so a query reading 3 of 200 columns reads only those 3 (see [Parquet]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/parquet" >}}) for the same idea in a file format). Cloud warehouses add **separation of storage and compute**: data sits in object storage, and you start or resize compute clusters independently.

## Strengths and limits

- **Strengths**: trusted, governed numbers; fast SQL; mature tooling, security and access control.
- **Limits**: structured data only; schema changes take work; traditionally expensive at petabyte scale; proprietary storage formats lock you in. These limits gave rise to the [data lake]({{< relref "/docs/roadmap/data-management-architecture/data-lake" >}}) and later the [lakehouse]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}}).

## Common mistakes

- Treating the warehouse as a copy of production tables with no modeling, so every analyst rebuilds the same joins.
- Running BI directly against the OLTP database "for now", until it takes production down.
- No clear owner for business definitions, so "revenue" means three different things in three reports.

## Learning Resources

### Books
- [Deciphering Data Architectures (Chapter 4: The Relational Data Warehouse)](https://www.oreilly.com/library/view/deciphering-data-architectures/9781098150754/): James Serra
- [The Data Warehouse Toolkit, 3rd Edition](https://www.wiley.com/en-us/The+Data+Warehouse+Toolkit%3A+The+Definitive+Guide+to+Dimensional+Modeling%2C+3rd+Edition-p-9781118530801): Kimball and Ross
- [Building the Data Warehouse](https://www.wiley.com/en-us/Building+the+Data+Warehouse%2C+4th+Edition-p-9780764599446): Bill Inmon
- [Mastering Data Warehouse Design: Relational and Dimensional Techniques](https://www.amazon.com/Mastering-Data-Warehouse-Design-Dimensional/dp/0471324213)

### Papers
- [The Snowflake Elastic Data Warehouse (SIGMOD 2016)](https://dl.acm.org/doi/10.1145/2882903.2903741): storage/compute separation in practice

### Videos
- [Do you need a relational data warehouse?](https://www.youtube.com/watch?v=c_M0iJ6jmSA): James Serra
