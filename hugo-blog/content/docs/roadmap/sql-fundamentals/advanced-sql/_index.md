---
title: "Advanced SQL"
weight: 2
description: "Advanced SQL with animated window frames: CTEs and recursive CTEs, window functions, PARTITION BY, QUALIFY, GROUPING SETS, MERGE and materialized views."
---
<div class="lx-kicker-line">$ SELECT ... OVER (PARTITION BY ... ORDER BY ...)</div>

# Advanced SQL

Advanced SQL is mostly about expressing multi-step logic **in one readable query** instead of exporting data to Python. The core tools are **common table expressions** (CTEs) to break a query into named steps, **window functions** to compute running totals, rankings and comparisons across rows without collapsing them, and **MERGE** to upsert data. These features are standard SQL and work in PostgreSQL, Snowflake, BigQuery, Spark SQL, Trino and DuckDB with small syntax differences.

## Common table expressions (CTEs)

A CTE names a subquery so the main query reads top to bottom like a pipeline:

```sql
WITH paid AS (
  SELECT * FROM orders WHERE status = 'paid'
),
by_customer AS (
  SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS revenue
  FROM paid
  GROUP BY customer_id
)
SELECT *
FROM by_customer
WHERE revenue > 1000;
```

This is the style most dbt models are written in. Modern optimizers usually inline CTEs, so they cost nothing extra; check the plan if a CTE is referenced many times.

**Recursive CTEs** walk hierarchies such as org charts or category trees:

```sql
WITH RECURSIVE chain AS (
  SELECT id, manager_id, name, 1 AS depth FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.manager_id, e.name, c.depth + 1
  FROM employees e JOIN chain c ON e.manager_id = c.id
)
SELECT * FROM chain ORDER BY depth;
```

## Window functions

A window function computes a value for each row using a **window** of related rows, and unlike `GROUP BY` it keeps every row. The window is defined by `OVER (...)`:

- `PARTITION BY` splits rows into independent groups (per city, per customer).
- `ORDER BY` orders rows within each partition.
- A **frame** (`ROWS BETWEEN ...`) picks which rows around the current one to include.

{{< fig kicker="$ AVG(revenue) OVER (PARTITION BY city ORDER BY day ROWS 2 PRECEDING)" title="A 3-day moving average: the frame slides, and resets per partition" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 352">
  <g class="m" font-size="12.5">
    <rect x="20" y="40" width="410" height="26" rx="4" fill="#F7F7FB"/>
    <g fill="#8C8899" font-size="11" font-weight="700"><text class="m" x="36" y="58">CITY</text><text class="m" x="126" y="58">DAY</text><text class="m" x="290" y="58" text-anchor="end">REVENUE</text><text class="m" x="414" y="58" text-anchor="end">AVG_3D</text><text class="m" x="470" y="30">FRAME FOR EACH ROW</text></g>
    <rect x="20" y="72" width="410" height="26" rx="4" fill="#fff" stroke="#E7E7EF"/>
    <text class="m" x="36" y="90" fill="#17151F">Tehran</text><text class="m" x="126" y="90" fill="#5C5869">11-01</text><text class="m" x="290" y="90" text-anchor="end" fill="#17151F">100</text>
    <rect x="20" y="102" width="410" height="26" rx="4" fill="#fff" stroke="#E7E7EF"/>
    <text class="m" x="36" y="120" fill="#17151F">Tehran</text><text class="m" x="126" y="120" fill="#5C5869">11-02</text><text class="m" x="290" y="120" text-anchor="end" fill="#17151F">140</text>
    <rect x="20" y="132" width="410" height="26" rx="4" fill="#fff" stroke="#E7E7EF"/>
    <text class="m" x="36" y="150" fill="#17151F">Tehran</text><text class="m" x="126" y="150" fill="#5C5869">11-03</text><text class="m" x="290" y="150" text-anchor="end" fill="#17151F">90</text>
    <rect x="20" y="162" width="410" height="26" rx="4" fill="#fff" stroke="#E7E7EF"/>
    <text class="m" x="36" y="180" fill="#17151F">Tehran</text><text class="m" x="126" y="180" fill="#5C5869">11-04</text><text class="m" x="290" y="180" text-anchor="end" fill="#17151F">130</text>
    <rect x="20" y="192" width="410" height="26" rx="4" fill="#F7F7FB" stroke="#E7E7EF"/>
    <text class="m" x="36" y="210" fill="#17151F">Shiraz</text><text class="m" x="126" y="210" fill="#5C5869">11-01</text><text class="m" x="290" y="210" text-anchor="end" fill="#17151F">60</text>
    <rect x="20" y="222" width="410" height="26" rx="4" fill="#F7F7FB" stroke="#E7E7EF"/>
    <text class="m" x="36" y="240" fill="#17151F">Shiraz</text><text class="m" x="126" y="240" fill="#5C5869">11-02</text><text class="m" x="290" y="240" text-anchor="end" fill="#17151F">80</text>
    <line x1="20" y1="190" x2="740" y2="190" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="5 4"/>
    <rect x="20" y="272" width="720" height="66" rx="6" fill="#260246"/>
    <text class="m" x="36" y="298" fill="#EEEAF5"><tspan fill="#E2B6FB">AVG</tspan>(revenue) <tspan fill="#E2B6FB">OVER</tspan> (<tspan fill="#E2B6FB">PARTITION BY</tspan> city <tspan fill="#E2B6FB">ORDER BY</tspan> day</text>
    <text class="m" x="186" y="322" fill="#EEEAF5"><tspan fill="#E2B6FB">ROWS BETWEEN</tspan> 2 <tspan fill="#E2B6FB">PRECEDING AND CURRENT ROW</tspan>) <tspan fill="#E2B6FB">AS</tspan> avg_3d</text>
  </g>
  <g class="f m" data-step="1" font-size="12.5">
    <rect x="470" y="72" width="26" height="26" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="483" y="112" text-anchor="middle" font-size="11" fill="#8C8899">r1</text>
    <text class="m" x="414" y="90" text-anchor="end" font-weight="700" fill="#531A8A">100.0</text>
  </g>
  <g class="f m" data-step="2" font-size="12.5">
    <rect x="515" y="72" width="26" height="56" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="528" y="142" text-anchor="middle" font-size="11" fill="#8C8899">r2</text>
    <text class="m" x="414" y="120" text-anchor="end" font-weight="700" fill="#531A8A">120.0</text>
  </g>
  <g class="f m" data-step="3" font-size="12.5">
    <rect x="560" y="72" width="26" height="86" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="573" y="172" text-anchor="middle" font-size="11" fill="#8C8899">r3</text>
    <text class="m" x="414" y="150" text-anchor="end" font-weight="700" fill="#531A8A">110.0</text>
  </g>
  <g class="f m" data-step="4" font-size="12.5">
    <rect x="605" y="102" width="26" height="86" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="618" y="202" text-anchor="middle" font-size="11" fill="#8C8899">r4</text>
    <text class="m" x="414" y="180" text-anchor="end" font-weight="700" fill="#531A8A">120.0</text>
  </g>
  <g class="f m" data-step="5" font-size="12.5">
    <rect x="650" y="192" width="26" height="26" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="663" y="232" text-anchor="middle" font-size="11" fill="#8C8899">r5</text>
    <text class="m" x="414" y="210" text-anchor="end" font-weight="700" fill="#531A8A">60.0</text>
  </g>
  <g class="f m" data-step="6" font-size="12.5">
    <rect x="695" y="192" width="26" height="56" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="708" y="262" text-anchor="middle" font-size="11" fill="#8C8899">r6</text>
    <text class="m" x="414" y="240" text-anchor="end" font-weight="700" fill="#531A8A">70.0</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Daily revenue for two cities. We want a <b>3-day moving average</b> that restarts for each city.</li>
  <li>Row 1 (Tehran, Nov 1): no preceding rows yet, so the frame holds only itself. avg = 100.</li>
  <li>Row 2: the frame is rows 1–2, because only one preceding row exists. avg = 120.</li>
  <li>Row 3: the full frame, <b>2 preceding + current</b>. avg = (100 + 140 + 90) / 3 = 110.</li>
  <li>Row 4: the frame <b>slides</b> down one row and Nov 1 drops out. avg = (140 + 90 + 130) / 3 = 120.</li>
  <li>Shiraz is a new <b>partition</b>: the frame resets and never reaches into Tehran's rows. avg = 60.</li>
  <li>All six input rows are still in the output. Window functions <b>add a column</b>; GROUP BY would have collapsed the rows.</li>
</ol>
{{< /fig >}}

### The main window functions

| Family | Functions | Example use |
|---|---|---|
| Ranking | `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `NTILE` | Top 3 products per category, deduplicate rows |
| Offset | `LAG`, `LEAD`, `FIRST_VALUE`, `LAST_VALUE` | Change vs previous day, time between orders |
| Aggregate | `SUM`, `AVG`, `COUNT`, `MIN`, `MAX` with `OVER` | Running totals, moving averages, share of total |

```sql
SELECT customer_id, order_id, ordered_at, amount,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at)      AS order_seq,
       ordered_at - LAG(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at) AS since_prev,
       SUM(amount) OVER (PARTITION BY customer_id ORDER BY ordered_at)       AS running_total,
       amount / SUM(amount) OVER (PARTITION BY customer_id)                  AS share_of_customer
FROM orders;
```

`ROW_NUMBER` gives 1, 2, 3, 4 even for ties; `RANK` gives 1, 2, 2, 4; `DENSE_RANK` gives 1, 2, 2, 3.

### Filtering on a window: QUALIFY

You cannot use a window function in `WHERE` (it runs before `SELECT`). Either wrap the query in a CTE, or use `QUALIFY`, supported by Snowflake, BigQuery, Databricks, DuckDB and others (not PostgreSQL):

```sql
-- keep the latest version of each customer (a classic dedup)
SELECT *
FROM customers_raw
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1;
```

## More aggregation: GROUPING SETS, ROLLUP, CUBE

Compute several levels of totals in one pass:

```sql
SELECT city, status, SUM(amount) AS revenue
FROM orders
GROUP BY ROLLUP (city, status);   -- per (city, status), per city, and grand total
```

`CUBE (city, status)` adds every combination; `GROUPING SETS ((city), (status), ())` lists exactly the levels you want. `FILTER (WHERE ...)` computes conditional aggregates: `COUNT(*) FILTER (WHERE status = 'paid')`.

## Upserts with MERGE

`MERGE` inserts, updates or deletes in one atomic statement, which is how incremental loads into warehouses and lakehouse tables (Delta, Iceberg) are written:

```sql
MERGE INTO dim_customer t
USING staged_customers s
  ON t.customer_id = s.customer_id
WHEN MATCHED AND t.city <> s.city THEN
  UPDATE SET city = s.city, updated_at = s.updated_at
WHEN NOT MATCHED THEN
  INSERT (customer_id, city, updated_at) VALUES (s.customer_id, s.city, s.updated_at);
```

PostgreSQL also has `INSERT ... ON CONFLICT (customer_id) DO UPDATE`. Make sure the source has **one row per key**, or the merge fails or behaves unpredictably.

## Views and materialized views

- A **view** is a saved query. It always shows current data and costs a full query each time it is read.
- A **materialized view** stores the result. Reads are fast; the data is as fresh as the last refresh. PostgreSQL refreshes manually (`REFRESH MATERIALIZED VIEW CONCURRENTLY sales_summary;`); Snowflake, BigQuery and ClickHouse can maintain some materialized views incrementally and automatically.

```sql
CREATE MATERIALIZED VIEW sales_summary AS
SELECT city, date_trunc('day', ordered_at) AS day, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY 1, 2;
```

In dbt, the same choice is the model's materialization: `view`, `table`, `incremental` or `materialized_view`.

## Reading the query plan

`EXPLAIN` shows how the engine will run a query; `EXPLAIN ANALYZE` runs it and shows real timings and row counts. Look for full scans of big tables where you expected an index or partition pruning, row estimates far from the actual counts, and joins that explode row counts. See [indexing]({{< relref "/docs/roadmap/distributed-systems-concepts/indexing" >}}).

## Common mistakes

- **Default frame surprise**: with `ORDER BY` and no frame, the default is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Ties are treated as one peer group, so a running total jumps by several rows at once, and `LAST_VALUE` returns the current row, not the last. Spell out `ROWS BETWEEN ...` when it matters.
- Using `ROW_NUMBER` for dedup without a deterministic `ORDER BY`, so reruns keep different rows.
- `ROWS BETWEEN 6 PRECEDING` as a "7-day average" when some days have no rows. Fill gaps with a calendar table or use `RANGE` with an interval.
- `MERGE` from a source with duplicate keys.
- Deeply nested subqueries instead of named CTEs that someone else can read.

## Learning Resources

### Docs
- [PostgreSQL: Window Functions tutorial](https://www.postgresql.org/docs/current/tutorial-window.html)
- [PostgreSQL: WITH Queries (CTEs)](https://www.postgresql.org/docs/current/queries-with.html)
- [Modern SQL](https://modern-sql.com/): standard features and support across databases
- [Use The Index, Luke](https://use-the-index-luke.com/): performance and query plans

### Tutorials
- [Mode: SQL Window Functions](https://mode.com/sql-tutorial/sql-window-functions/)
- [SQL PARTITION BY Clause](https://www.sqltutorial.org/sql-window-functions/sql-partition-by/)

### Books
- [SQL Antipatterns, Volume 1](https://pragprog.com/titles/bksap1/sql-antipatterns-volume-1/): Bill Karwin
- [SQL Performance Explained](https://sql-performance-explained.com/): Markus Winand

### Videos
- [Advanced SQL Tutorial | CTE (Common Table Expression)](https://www.youtube.com/watch?v=K1WeoKxLZ5o)
- [Advanced SQL Tutorial | Partition By](https://www.youtube.com/watch?v=D6XNlTfglW4)
