---
bookCollapseSection: true
weight: 10
description: "SQL for data engineers: the basics (SELECT, joins, GROUP BY, NULLs, logical query order) and advanced features (CTEs, window functions, MERGE, views)."
---

# SQL Fundamentals

**SQL (Structured Query Language)** is the language for asking questions of, and changing, data stored in tables. It is declarative: you describe the result you want and the database figures out how to get it. For data engineers SQL is the most important single skill, because nearly every warehouse, lakehouse engine and stream processor (Snowflake, BigQuery, PostgreSQL, Spark SQL, Trino, DuckDB, Flink SQL) speaks it, and most transformation code in tools like dbt is SQL.

## What this section covers

- [Basic SQL]({{< relref "/docs/roadmap/sql-fundamentals/basic-sql" >}}): reading and writing data, filtering, joins, aggregation with `GROUP BY`, `NULL` handling, and the **logical order** in which a query is evaluated.
- [Advanced SQL]({{< relref "/docs/roadmap/sql-fundamentals/advanced-sql" >}}): CTEs (including recursive ones), **window functions** and frames, `QUALIFY`, `GROUPING SETS`, `MERGE` for upserts, views and materialized views, and reading query plans.

## How to practice

The fastest way to learn is to run queries on real data. Install [DuckDB](https://duckdb.org/) (a single binary, no server) and query a CSV or Parquet file directly:

```sql
SELECT city, COUNT(*) AS orders, SUM(amount) AS revenue
FROM 'orders.parquet'
GROUP BY city
ORDER BY revenue DESC;
```

Then repeat the same queries in PostgreSQL, which follows the SQL standard closely and has excellent documentation.

## Learning Resources

- [PostgreSQL Tutorial (official docs)](https://www.postgresql.org/docs/current/tutorial.html)
- [SQLBolt](https://sqlbolt.com/): short interactive lessons
- [Modern SQL](https://modern-sql.com/): Markus Winand on standard SQL features and which databases support them
- [Use The Index, Luke](https://use-the-index-luke.com/): SQL performance and indexing
