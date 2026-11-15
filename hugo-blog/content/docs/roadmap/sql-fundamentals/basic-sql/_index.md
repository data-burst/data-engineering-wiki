---
title: "Basic SQL"
weight: 1
description: "Basic SQL explained with animations: SELECT, WHERE, joins, GROUP BY and HAVING, NULL handling, INSERT/UPDATE/DELETE, and the logical order a query runs in."
---
<div class="lx-kicker-line">$ psql -c "SELECT ..."</div>

# Basic SQL

**SQL** lets you describe the rows you want from one or more tables, and the database works out how to fetch them. A query is built from a few clauses: `FROM` says which tables, `WHERE` filters rows, `GROUP BY` collapses rows into groups, `SELECT` picks the output columns and `ORDER BY` sorts. Learn these clauses, joins, and how `NULL` behaves, and you can answer most everyday questions about data.

The examples use one small table:

```sql
CREATE TABLE orders (
  order_id    BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  city        TEXT,
  status      TEXT,          -- 'paid', 'cancelled', ...
  amount      NUMERIC(10,2),
  ordered_at  TIMESTAMP
);
```

## Reading data

```sql
SELECT order_id, city, amount          -- which columns
FROM orders                            -- which table
WHERE status = 'paid' AND amount > 100 -- which rows
ORDER BY amount DESC                   -- sort
LIMIT 10;                              -- how many
```

Useful filters: `IN ('New York', 'Toronto')`, `BETWEEN 100 AND 500`, `LIKE 'New%'`, `IS NULL`. Use `SELECT DISTINCT city` to remove duplicate rows, and `CASE WHEN amount > 500 THEN 'large' ELSE 'small' END` for conditional values.

## The order SQL actually runs in

You write `SELECT` first, but the database evaluates it almost last. Knowing the **logical processing order** explains most beginner errors.

{{< fig kicker="$ EXPLAIN (logically)" title="Written order vs evaluation order" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 270">
  <rect x="20" y="20" width="380" height="234" rx="8" fill="#260246"/>
  <g class="m" font-size="13" fill="#EEEAF5">
    <text class="m" x="40" y="56"><tspan fill="#E2B6FB">SELECT</tspan> city, <tspan fill="#E2B6FB">COUNT</tspan>(*) <tspan fill="#E2B6FB">AS</tspan> orders</text>
    <text class="m" x="40" y="86"><tspan fill="#E2B6FB">FROM</tspan> orders</text>
    <text class="m" x="40" y="116"><tspan fill="#E2B6FB">WHERE</tspan> status = 'paid'</text>
    <text class="m" x="40" y="146"><tspan fill="#E2B6FB">GROUP BY</tspan> city</text>
    <text class="m" x="40" y="176"><tspan fill="#E2B6FB">HAVING</tspan> <tspan fill="#E2B6FB">COUNT</tspan>(*) &gt; 1</text>
    <text class="m" x="40" y="206"><tspan fill="#E2B6FB">ORDER BY</tspan> orders <tspan fill="#E2B6FB">DESC</tspan></text>
    <text class="m" x="40" y="236"><tspan fill="#E2B6FB">LIMIT</tspan> 1;</text>
  </g>
  <g class="m" font-size="12">
    <circle cx="375" cy="82" r="11" fill="#F4EEFA"/><text class="m" x="375" y="86" text-anchor="middle" font-weight="700" fill="#531A8A">1</text>
    <rect x="430" y="22" width="310" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="444" y="43" fill="#17151F" font-weight="700">1 · FROM orders</text><text class="m" x="726" y="43" text-anchor="end" fill="#5C5869">8 rows</text>
  </g>
  <g class="f m" data-step="1" font-size="12">
    <circle cx="375" cy="112" r="11" fill="#F4EEFA"/><text class="m" x="375" y="116" text-anchor="middle" font-weight="700" fill="#531A8A">2</text>
    <rect x="430" y="62" width="310" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="444" y="83" fill="#17151F" font-weight="700">2 · WHERE status = 'paid'</text><text class="m" x="726" y="83" text-anchor="end" fill="#5C5869">6 rows</text>
  </g>
  <g class="f m" data-step="2" font-size="12">
    <circle cx="375" cy="142" r="11" fill="#F4EEFA"/><text class="m" x="375" y="146" text-anchor="middle" font-weight="700" fill="#531A8A">3</text>
    <rect x="430" y="102" width="310" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="444" y="123" fill="#17151F" font-weight="700">3 · GROUP BY city</text><text class="m" x="726" y="123" text-anchor="end" fill="#5C5869">3 groups</text>
  </g>
  <g class="f m" data-step="3" font-size="12">
    <circle cx="375" cy="172" r="11" fill="#F4EEFA"/><text class="m" x="375" y="176" text-anchor="middle" font-weight="700" fill="#531A8A">4</text>
    <rect x="430" y="142" width="310" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="444" y="163" fill="#17151F" font-weight="700">4 · HAVING COUNT(*) &gt; 1</text><text class="m" x="726" y="163" text-anchor="end" fill="#5C5869">2 groups</text>
  </g>
  <g class="f m" data-step="4" font-size="12">
    <circle cx="375" cy="52" r="11" fill="#F4EEFA"/><text class="m" x="375" y="56" text-anchor="middle" font-weight="700" fill="#531A8A">5</text>
    <rect x="430" y="182" width="310" height="32" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="444" y="203" fill="#531A8A" font-weight="700">5 · SELECT (alias "orders")</text><text class="m" x="726" y="203" text-anchor="end" fill="#5C5869">2 rows</text>
  </g>
  <g class="f m" data-step="5" font-size="12">
    <circle cx="375" cy="202" r="11" fill="#F4EEFA"/><text class="m" x="375" y="206" text-anchor="middle" font-weight="700" fill="#531A8A">6</text>
    <circle cx="375" cy="232" r="11" fill="#F4EEFA"/><text class="m" x="375" y="236" text-anchor="middle" font-weight="700" fill="#531A8A">7</text>
    <rect x="430" y="222" width="310" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="444" y="243" fill="#17151F" font-weight="700">6–7 · ORDER BY, LIMIT 1</text><text class="m" x="726" y="243" text-anchor="end" fill="#531A8A" font-weight="700">New York · 3</text>
  </g>
</svg>
<ol class="lx-caps">
  <li><b>FROM</b> (and any joins) runs first: it builds the full set of input rows. Here, 8 orders.</li>
  <li><b>WHERE</b> filters individual rows. 2 cancelled orders drop out. It cannot use aggregates or <code>SELECT</code> aliases: they don't exist yet.</li>
  <li><b>GROUP BY</b> collapses rows into one row per city: New York 3, Toronto 2, Chicago 1.</li>
  <li><b>HAVING</b> filters <b>groups</b>, so it can use aggregates. Chicago, with one paid order, is removed.</li>
  <li><b>SELECT</b> computes the output columns. Only now does the alias <code>orders</code> exist.</li>
  <li><b>ORDER BY</b> runs after SELECT, so it <b>can</b> use the alias. <b>LIMIT</b> keeps the first row: New York with 3 paid orders.</li>
</ol>
{{< /fig >}}

This is the logical order. The optimizer may physically execute things differently (push filters into scans, reorder joins), but the result must be as if it followed these steps.

## Joins

A join combines rows from two tables where a condition matches, usually a foreign key equal to a primary key.

{{< fig kicker="$ SELECT c.name, o.order_id FROM customers c ? JOIN orders o ON o.customer_id = c.id" title="INNER, LEFT and FULL OUTER JOIN on the same two tables" >}}
<div class="rc-top">
<table class="rc-tbl"><tr><th>customers.id</th><th>name</th></tr>
<tr><td>1</td><td>Alice</td></tr><tr><td>2</td><td>Sam</td></tr><tr><td>3</td><td>Ryan</td></tr></table>
<table class="rc-tbl"><tr><th>order_id</th><th>customer_id</th></tr>
<tr><td>o1</td><td>1</td></tr><tr><td>o2</td><td>1</td></tr><tr><td>o3</td><td>2</td></tr><tr><td>o4</td><td>9</td></tr></table>
</div>
<table class="lx-log"><tr><th>name</th><th>order_id</th><th>returned by</th></tr>
<tr class="f" data-step="1"><td>Alice</td><td>o1</td><td><span class="tag">INNER</span> · LEFT · FULL</td></tr>
<tr class="f" data-step="1"><td>Alice</td><td>o2</td><td><span class="tag">INNER</span> · LEFT · FULL</td></tr>
<tr class="f" data-step="1"><td>Sam</td><td>o3</td><td><span class="tag">INNER</span> · LEFT · FULL</td></tr>
<tr class="f" data-step="2"><td>Ryan</td><td>NULL</td><td><span class="tag">LEFT</span> · FULL: customer with no orders</td></tr>
<tr class="f" data-step="3"><td>NULL</td><td>o4</td><td><span class="tag">FULL</span> (and RIGHT): order whose customer 9 does not exist</td></tr>
</table>
<ol class="lx-caps">
  <li>Three customers, four orders. Alice has two orders, Ryan has none, and order o4 points to a customer id that doesn't exist.</li>
  <li><b>INNER JOIN</b> returns only matching pairs. Alice appears twice because she has two orders: joins can <b>multiply</b> rows.</li>
  <li><b>LEFT JOIN</b> keeps every customer. Ryan has no match, so the order columns are <b>NULL</b>.</li>
  <li><b>FULL OUTER JOIN</b> also keeps unmatched rows from the right side: o4 appears with a NULL customer. <b>RIGHT JOIN</b> is a LEFT JOIN with the tables swapped.</li>
</ol>
{{< /fig >}}

Two more: `CROSS JOIN` pairs every row with every row (use deliberately, for example with a calendar table), and a **self join** joins a table to itself (employees and their managers). Anti-joins ("customers with no orders") are written as `LEFT JOIN ... WHERE o.order_id IS NULL` or `WHERE NOT EXISTS (...)`.

## Aggregation: GROUP BY and HAVING

```sql
SELECT city,
       COUNT(*)              AS orders,
       COUNT(DISTINCT customer_id) AS customers,
       SUM(amount)           AS revenue,
       AVG(amount)           AS avg_order
FROM orders
WHERE status = 'paid'
GROUP BY city
HAVING SUM(amount) > 1000
ORDER BY revenue DESC;
```

Every column in `SELECT` must either be in `GROUP BY` or wrapped in an aggregate. `WHERE` filters rows before grouping, `HAVING` filters groups after.

## NULL: the unknown value

`NULL` means "unknown", and SQL uses three-valued logic: comparisons with NULL are neither true nor false but **unknown**, and `WHERE` keeps only rows where the condition is true.

- `city = NULL` is never true. Use `city IS NULL`.
- `COUNT(*)` counts rows; `COUNT(city)` counts non-null cities. `SUM` and `AVG` ignore NULLs.
- `NOT IN (subquery)` returns nothing if the subquery contains a NULL. Prefer `NOT EXISTS`.
- `COALESCE(city, 'unknown')` replaces NULL with a default.

## Changing data (CRUD)

```sql
INSERT INTO orders (order_id, customer_id, city, status, amount, ordered_at)
VALUES (9001, 42, 'New York', 'paid', 80.00, '2026-01-15 10:30');

UPDATE orders SET status = 'cancelled' WHERE order_id = 9001;

DELETE FROM orders WHERE status = 'cancelled' AND ordered_at < '2025-01-01';
```

Always write the `WHERE` of an `UPDATE` or `DELETE` first, and run it as a `SELECT` to see which rows it touches. Wrap risky changes in a transaction (`BEGIN; ... COMMIT;` or `ROLLBACK;`). Table structure is defined with DDL: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, plus constraints (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `CHECK`).

## Common mistakes

- Using a `SELECT` alias in `WHERE` (it doesn't exist yet; see the figure).
- Joining on a non-unique key and silently multiplying rows, then summing them. Check row counts before and after a join.
- Filtering the right table of a `LEFT JOIN` in `WHERE`, which turns it into an inner join. Put the condition in `ON` instead.
- `= NULL` instead of `IS NULL`, and `NOT IN` with NULLs.
- `SELECT *` in production queries: wasteful on columnar engines and breaks when columns change.

## Learning Resources

### Books
- [Learning SQL, 3rd Edition](https://www.oreilly.com/library/view/learning-sql-3rd/9781492057604/): Alan Beaulieu
- [Sams Teach Yourself SQL in 10 Minutes](https://www.amazon.com/SQL-Minutes-Sams-Teach-Yourself/dp/0672336073): Ben Forta, short and hands-on

### Interactive
- [SQLBolt](https://sqlbolt.com/)
- [Select Star SQL](https://selectstarsql.com/)
- [SQLZoo](https://www.sqlzoo.net/wiki/SQL_Tutorial)
- [Mode SQL Tutorial](https://mode.com/sql-tutorial)

### Docs
- [PostgreSQL Tutorial: The SQL Language](https://www.postgresql.org/docs/current/tutorial-sql.html)
- [PostgreSQL: Joins Between Tables](https://www.postgresql.org/docs/current/tutorial-join.html)
