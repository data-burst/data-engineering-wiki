---
title: "Relational"
description: "How relational databases work: tables, primary and foreign keys, joins, ACID transactions, B-tree indexes, and when PostgreSQL or MySQL is the right choice."
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ psql -c '\d orders'</div>

# Relational Databases

A **relational database** stores data in **tables** (relations) made of rows and typed columns, links tables through **keys**, and lets you ask questions in **SQL**. The database, not your application, enforces the rules: types, uniqueness, references between tables, and **ACID transactions** so a half-finished change is never visible. The model comes from E. F. Codd's 1970 paper and still runs most of the world's business data: PostgreSQL, MySQL, SQL Server, Oracle and SQLite are all relational.

## The building blocks

- **Table**: one kind of thing, for example `customers` or `orders`. Every row has the same columns.
- **Primary key**: a column (or set of columns) that uniquely identifies a row, such as `customers.id`.
- **Foreign key**: a column that points to another table's primary key, such as `orders.customer_id → customers.id`. The database rejects orders for customers that do not exist.
- **Join**: combine rows from several tables by matching keys at query time.
- **Schema**: the declared structure (tables, columns, types, constraints). It is enforced on write (**schema-on-write**).

{{< fig kicker="$ SELECT c.name, SUM(o.total) FROM orders o JOIN customers c ..." title="Keys link tables, joins follow the keys" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 360">
  <text x="20" y="30" class="m" font-size="12" font-weight="700" fill="#5C5869">CUSTOMERS</text>
  <rect x="20" y="40" width="230" height="104" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <line x1="20" y1="66" x2="250" y2="66" stroke="#E7E7EF"/>
  <g class="m" font-size="12" fill="#8C8899" font-weight="700"><text class="m" x="36" y="58">id</text><text class="m" x="86" y="58">name</text><text class="m" x="176" y="58">city</text></g>
  <g class="m" font-size="12" fill="#17151F">
    <text class="m" x="36" y="84">1</text><text class="m" x="86" y="84">alice</text><text class="m" x="176" y="84">NYC</text>
    <text class="m" x="36" y="110">2</text><text class="m" x="86" y="110">sam</text><text class="m" x="176" y="110">TOR</text>
    <text class="m" x="36" y="136">3</text><text class="m" x="86" y="136">ryan</text><text class="m" x="176" y="136">CHI</text>
  </g>
  <text x="470" y="30" class="m" font-size="12" font-weight="700" fill="#5C5869">ORDERS</text>
  <rect x="470" y="40" width="270" height="130" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <line x1="470" y1="66" x2="740" y2="66" stroke="#E7E7EF"/>
  <g class="m" font-size="12" fill="#8C8899" font-weight="700"><text class="m" x="486" y="58">id</text><text class="m" x="552" y="58">customer_id</text><text class="m" x="676" y="58">total</text></g>
  <g class="m" font-size="12" fill="#17151F">
    <text class="m" x="486" y="84">101</text><text class="m" x="552" y="84">1</text><text class="m" x="676" y="84">250</text>
    <text class="m" x="486" y="110">102</text><text class="m" x="552" y="110">2</text><text class="m" x="676" y="110">120</text>
    <text class="m" x="486" y="136">103</text><text class="m" x="552" y="136">2</text><text class="m" x="676" y="136">980</text>
    <text class="m" x="486" y="162">104</text><text class="m" x="552" y="162">1</text><text class="m" x="676" y="162">450</text>
  </g>
  <g class="f" data-step="1">
    <rect x="544" y="44" width="110" height="122" rx="4" fill="none" stroke="#531A8A" stroke-width="1.6"/>
    <g stroke="#531A8A" stroke-width="1.2" stroke-dasharray="4 4" fill="none">
      <line x1="470" y1="80" x2="250" y2="80"/><line x1="470" y1="106" x2="250" y2="106"/>
      <line x1="470" y1="132" x2="250" y2="106"/><line x1="470" y1="158" x2="250" y2="80"/>
    </g>
    <text x="397" y="188" text-anchor="middle" class="m" font-size="11" fill="#531A8A">FOREIGN KEY → customers.id</text>
  </g>
  <g class="f" data-step="2">
    <rect x="20" y="210" width="420" height="104" rx="6" fill="#260246"/>
    <g class="m" font-size="12" fill="#EEEAF5">
      <text class="m" x="36" y="236">SELECT c.name, SUM(o.total) AS total</text>
      <text class="m" x="36" y="256">FROM orders o</text>
      <text class="m" x="36" y="276">JOIN customers c ON o.customer_id = c.id</text>
      <text class="m" x="36" y="296">GROUP BY c.name;</text>
    </g>
  </g>
  <g class="f" data-step="3" fill="none" stroke="#531A8A" stroke-width="2">
    <rect x="24" y="94" width="222" height="24" rx="4"/>
    <rect x="474" y="94" width="262" height="24" rx="4"/>
    <rect x="474" y="120" width="262" height="24" rx="4"/>
  </g>
  <g class="f" data-step="4">
    <text x="470" y="204" class="m" font-size="12" font-weight="700" fill="#5C5869">RESULT</text>
    <rect x="470" y="212" width="270" height="78" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/>
    <g class="m" font-size="12"><text class="m" x="486" y="232" fill="#8C8899" font-weight="700">name</text><text class="m" x="640" y="232" fill="#8C8899" font-weight="700">total</text>
      <text class="m" x="486" y="256" fill="#17151F">alice</text><text class="m" x="640" y="256" fill="#17151F">700</text>
      <text class="m" x="486" y="280" fill="#17151F">sam</text><text class="m" x="640" y="280" fill="#17151F">1100</text></g>
  </g>
  <g class="f" data-step="5">
    <rect x="20" y="322" width="720" height="30" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/>
    <text x="36" y="342" class="m" font-size="12" fill="#C2382F">INSERT INTO orders VALUES (105, 9, 70);  ERROR: violates foreign key constraint</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Two tables. Each customer is stored <b>once</b>; each order stores only the customer's <b>id</b>.</li>
  <li><b>orders.customer_id</b> is a <b>foreign key</b>: every value must exist in <b>customers.id</b>.</li>
  <li>To answer "how much did each customer spend?", SQL <b>joins</b> the tables on that key.</li>
  <li>For <b>sam</b> (id 2) the engine finds orders 102 and 103. An index on <b>customer_id</b> makes this a lookup, not a full scan.</li>
  <li>The result: one row per customer. <b>ryan</b> has no orders, so an inner join leaves him out (a <b>LEFT JOIN</b> would keep him).</li>
  <li>The database <b>guards integrity</b>: an order for customer 9, who does not exist, is rejected.</li>
</ol>
{{< /fig >}}

## How a relational database works inside

- **Row storage.** Rows are packed into fixed-size pages (8 KB in PostgreSQL, 16 KB in InnoDB). Reading or updating one whole row is cheap; scanning one column across 100 million rows is not. That is why analytics moves to [columnar]({{< relref "../noSQL/columnar" >}}) systems.
- **Indexes.** A **B-tree** index on `customer_id` turns "find all orders of customer 2" from reading every page into a few page reads. Indexes speed up reads and slow down writes. See [Indexing]({{< relref "/docs/roadmap/distributed-systems-concepts/indexing" >}}).
- **Write-ahead log (WAL).** Every change is first appended to a log, and the log is flushed to disk at commit, before the changed data pages are written. After a crash the database replays the log. The same log feeds replicas and [change data capture]({{< relref "/docs/roadmap/data-integration/cdc" >}}).
- **Transactions.** `BEGIN … COMMIT` groups changes so they all happen or none do (**ACID**). Concurrency control (MVCC in PostgreSQL and InnoDB) lets readers and writers work without blocking each other. See [ACID]({{< relref "/docs/roadmap/distributed-systems-concepts/acid" >}}).
- **Query planner.** SQL says *what* you want; a cost-based optimizer decides *how*: which index, which join order, hash join or nested loop. `EXPLAIN ANALYZE` shows the plan.

## Normalization

Storing each fact once (the customer's city lives only in `customers`) avoids update anomalies: change it in one place and every join sees the new value. Analytics schemas often **denormalize** on purpose to avoid joins. See [Normalization or Denormalization]({{< relref "/docs/roadmap/distributed-systems-concepts/normalization-or-denormalization" >}}).

## Popular relational databases

| Database | License | Notes |
|---|---|---|
| **PostgreSQL** | Open source (PostgreSQL License) | The default choice in 2026. Rich types (`jsonb`, arrays), extensions (PostGIS, pgvector, TimescaleDB), strong SQL compliance. |
| **MySQL / MariaDB** | GPL | Huge install base in web apps. InnoDB storage engine. MariaDB is a community fork. |
| **SQL Server** | Commercial | Common in Microsoft shops; strong BI tooling. |
| **Oracle** | Commercial | Large enterprises, finance, telecom. |
| **SQLite** | Public domain | A library, not a server. Ships in every phone and browser; great for local tools and tests. |

## When to use one, and when not

**Use a relational database when** data has clear structure and relationships, correctness matters (money, inventory, bookings), and you need ad hoc queries you did not plan for.

**Look elsewhere when** a single node cannot hold the write volume (consider [distributed SQL]({{< relref "../noSQL/newsql" >}}) or sharding), when the main workload is scanning billions of rows for analytics (a columnar warehouse), or when the access pattern is purely `get(key)` at extreme scale (a [key-value]({{< relref "../noSQL/key-value" >}}) store).

## Common mistakes

- **Running heavy analytics on the production primary.** Use a read replica, or replicate into a warehouse.
- **Missing indexes on foreign keys.** Joins and cascading deletes turn into full scans.
- **`SELECT *` in pipelines.** Schema changes upstream silently break or bloat downstream tables. Name your columns.
- **Long-running transactions.** They hold locks and, in PostgreSQL, block vacuum, so tables bloat.
- **Treating "relational" as "doesn't scale".** A well-indexed PostgreSQL on one modern server handles tens of thousands of transactions per second.

## Learning Resources

- [A Relational Model of Data for Large Shared Data Banks](https://dl.acm.org/doi/10.1145/362384.362685): E. F. Codd, 1970
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/): the tutorial and "Performance Tips" chapters are excellent
- [Use The Index, Luke](https://use-the-index-luke.com/): SQL indexing and tuning, free online
- [CMU 15-445/645 Intro to Database Systems](https://15445.courses.cs.cmu.edu/): how storage, indexes, transactions and query execution work
- *Database Internals*, Alex Petrov: storage engines and distributed databases
- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
