---
bookCollapseSection: true
weight: 14
description: "How data moves between systems: ETL, ELT, change data capture and reverse ETL compared, with when to use each pattern and the tools behind them."
---

# Data Integration

**Data integration** is the work of getting data out of the systems where it is created (application databases, SaaS tools, files, APIs) and into the systems where it is used (a warehouse, a lake, a search index, a CRM), in a shape those systems can use. Almost every data platform is built from four patterns:

| Pattern | Direction | Where transformation happens | Freshness | Typical tools |
|---|---|---|---|---|
| [ETL]({{< relref "etl" >}}) | Sources → warehouse | In a separate engine, **before** loading | Hours (batch) | Spark, Informatica, SSIS, custom Python |
| [ELT]({{< relref "elt" >}}) | Sources → warehouse | **Inside** the warehouse, after loading raw data | Minutes to hours | Fivetran / Airbyte + dbt |
| [CDC]({{< relref "cdc" >}}) | Database → anywhere | Usually downstream | Seconds | Debezium, Kafka Connect, cloud DMS |
| [Reverse ETL]({{< relref "reverse-etl" >}}) | Warehouse → business tools | In the warehouse, before syncing | Minutes to hours | Hightouch, Census, RudderStack |

They are not rivals. A typical 2026 stack uses **CDC or an ELT connector** to land raw data, **dbt** (ELT) to model it, and **reverse ETL** to push the results into the tools sales and marketing use. Classic ETL survives where data must be cleaned or masked before it is allowed into the warehouse.

## What's in this section

- **[ETL]({{< relref "etl" >}})**: extract, transform in a staging engine, then load clean tables.
- **[ELT]({{< relref "elt" >}})**: load raw data first, transform it with SQL inside the warehouse.
- **[CDC]({{< relref "cdc" >}})**: stream every insert, update and delete from a database's log.
- **[Reverse ETL]({{< relref "reverse-etl" >}})**: sync modeled warehouse data back into operational tools.
