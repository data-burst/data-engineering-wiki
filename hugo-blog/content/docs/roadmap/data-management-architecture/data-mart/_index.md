---
weight: 5
title: Data Mart
description: "What a data mart is: a subject-focused slice of the warehouse for one team, dependent vs independent marts, conformed dimensions and how to avoid data silos."
---

# Data Mart

A **data mart** is a small, subject-focused part of a data warehouse built for one business area, such as sales, finance or marketing. Instead of exposing hundreds of tables, it gives a team the handful of [star schemas]({{< relref "/docs/roadmap/data-modeling/star-schema" >}}), aggregates and definitions it actually needs, with names it understands. Think of the warehouse as the wholesale store and the mart as the shop around the corner.

## Types of data marts

| Type | Built from | Pros | Cons |
|---|---|---|---|
| **Dependent** | The central warehouse | Consistent numbers, single source of truth | Waits on the central team |
| **Independent** | Source systems directly | Fast to build | Silos: each mart defines "customer" its own way |
| **Hybrid** | Warehouse plus a few extra sources | Flexible | Needs care to stay consistent |

Bill Inmon's approach builds an integrated warehouse first and derives dependent marts from it. Ralph Kimball's approach builds marts per business process and ties them together with **conformed dimensions**, so `dim_customer` and `dim_date` are shared across all of them. Kimball's **bus matrix** (business processes as rows, dimensions as columns) is still a good planning tool.

## What a mart looks like in 2026

A data mart is rarely a separate database any more. It is usually:

- A **schema or dataset** in the warehouse or lakehouse (`marts.finance`, `marts.marketing`), often built as a dbt folder.
- With its own **access controls**, so finance data is visible only to finance.
- Exposed through a **semantic layer** or BI model with business-friendly metric definitions.

In a [data mesh]({{< relref "/docs/roadmap/data-management-architecture/data-mesh" >}}), the closest equivalent is a domain's set of **data products**.

## When to create a mart

- A team asks the same questions daily and needs a fast, simple model.
- Access must be restricted by subject area.
- Expensive joins and aggregates should be computed once, not in every dashboard.

## Common mistakes

- Independent marts that each compute revenue differently, so leadership gets three numbers.
- Copying whole fact tables into every mart instead of sharing conformed facts and dimensions.
- Marts no one owns: they keep refreshing and costing money long after the dashboard is gone.

## Learning Resources

- [The Data Warehouse Toolkit, 3rd Edition](https://www.wiley.com/en-us/The+Data+Warehouse+Toolkit%3A+The+Definitive+Guide+to+Dimensional+Modeling%2C+3rd+Edition-p-9781118530801): conformed dimensions and the bus matrix
- [Kimball Group: Dimensional Modeling Techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/)
- [dbt: How we structure our dbt projects (marts)](https://docs.getdbt.com/best-practices/how-we-structure/4-marts)
- [Deciphering Data Architectures](https://www.oreilly.com/library/view/deciphering-data-architectures/9781098150754/): James Serra
