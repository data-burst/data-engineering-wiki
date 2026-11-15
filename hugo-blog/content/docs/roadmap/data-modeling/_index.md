---
bookCollapseSection: true
weight: 12
description: "Data modeling for analytics: conceptual, logical and physical models, normalization, and how star schema, snowflake schema and Data Vault compare."
---

# Data Modeling

**Data modeling** is deciding how data is split into tables, what each row means, and how tables relate, so that the data is correct to load and easy to query. A good model makes the right query obvious and the wrong one hard. In analytics the model matters more than the engine: a fast warehouse cannot fix a fact table with an undefined grain.

## Three levels of a model

| Level | Answers | Example |
|---|---|---|
| Conceptual | What things does the business care about? | Customer places Order, Order contains Product |
| Logical | Which entities, attributes and keys, independent of a database? | `order(order_id PK, customer_id FK, ordered_at)` |
| Physical | How is it stored in this engine? | Types, partitioning, clustering keys, Parquet/Iceberg layout |

## Two goals that pull in different directions

- **Normalization** (3NF) removes redundancy so each fact is stored once. Ideal for transactional systems where many small writes must stay consistent.
- **Denormalization** repeats data so reads need fewer joins. Ideal for analytics where queries scan and aggregate.

Most analytical platforms do both: a normalized or raw integration layer, then denormalized models for consumers. See [normalization vs denormalization]({{< relref "/docs/roadmap/distributed-systems-concepts/normalization-or-denormalization" >}}).

## What this section covers

- [Star Schema]({{< relref "/docs/roadmap/data-modeling/star-schema" >}}): Kimball's fact and dimension tables, grain, surrogate keys and slowly changing dimensions (SCD Type 2). The default for BI.
- [Snowflake Schema]({{< relref "/docs/roadmap/data-modeling/snowflake" >}}): a star with normalized dimensions. Less redundancy, more joins.
- [Data Vault]({{< relref "/docs/roadmap/data-modeling/data-vault" >}}): hubs, links and satellites for auditable, change-friendly integration of many sources.

## Choosing an approach

| Situation | Good fit |
|---|---|
| Dashboards and self-service BI on a handful of sources | Star schema |
| Large shared hierarchies, normalized sources, semantic layer hides joins | Snowflake schema where it helps |
| Many volatile sources, strict audit requirements, big team | Data Vault for integration, stars on top |
| One dashboard that must be very fast | One big table built from a star |

A common 2026 layering, often called **medallion** (bronze, silver, gold) on lakehouses, maps onto these: raw data lands as-is, a cleaned and integrated layer (sometimes a vault) sits in the middle, and star schemas serve the gold layer.

## Learning Resources

### Books
- [The Data Warehouse Toolkit, 3rd Edition](https://www.wiley.com/en-us/The+Data+Warehouse+Toolkit%3A+The+Definitive+Guide+to+Dimensional+Modeling%2C+3rd+Edition-p-9781118530801): Kimball and Ross
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/): chapter 2 on data models
- [Data Modeling, A Beginner's Guide](https://www.oreilly.com/library/view/data-modeling-a/9780071623988/)

### Videos
- [Introduction to Data Models](https://www.youtube.com/watch?v=OwQoj3GJfNY)
- [What is Data Modelling? Beginner's Guide to Data Models and Data Modelling](https://www.youtube.com/watch?v=CUR6rKrIEGc)
