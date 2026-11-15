---
title: "Normalization or Denormalization"
description: "Normalization vs denormalization: update anomalies animated, normal forms by example, why OLTP normalizes and warehouses, NoSQL and sharded systems denormalize."
weight: 10
bookToC: false
---
<div class="lx-kicker-line">$ man normalization   # store each fact once, or where it is read?</div>

# Normalization or Denormalization

**Normalization** means storing each fact exactly once and linking tables with keys: a customer's city lives in one `customers` row, and orders point to it by `customer_id`. **Denormalization** means deliberately copying facts next to where they are read, such as the city on every order row, so queries need fewer joins. Normalization protects correctness when data changes; denormalization buys read speed and simplicity at the cost of keeping copies in sync.

## What goes wrong with copies

{{< fig kicker="$ UPDATE ... SET city = 'Toronto' WHERE customer = 'Sam'" title="An update anomaly, and the normalized fix" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 290">
  <text x="20" y="30" class="m" font-size="12" font-weight="700" fill="#17151F">orders · denormalized</text>
  <!-- step 1 highlight (behind text) -->
  <g class="f" data-step="1" fill="#F4EEFA">
    <rect x="20" y="70" width="340" height="24"/><rect x="20" y="122" width="340" height="24"/><rect x="20" y="148" width="340" height="24"/>
  </g>
  <line x1="20" y1="64" x2="360" y2="64" stroke="#E7E7EF" stroke-width="1.4"/>
  <g font-size="11" font-weight="700" fill="#8C8899">
    <text class="m" x="30" y="56">ORDER</text><text class="m" x="100" y="56">CUSTOMER</text><text class="m" x="190" y="56">CITY</text><text class="m" x="290" y="56">AMOUNT</text>
  </g>
  <g font-size="12" fill="#17151F">
    <text class="m" x="30" y="86">1001</text><text class="m" x="100" y="86">Sam</text><text class="m" x="190" y="86">New York</text><text class="m" x="290" y="86">250</text>
    <text class="m" x="30" y="112">1002</text><text class="m" x="100" y="112">Alice</text><text class="m" x="190" y="112">Chicago</text><text class="m" x="290" y="112">120</text>
    <text class="m" x="30" y="138">1003</text><text class="m" x="100" y="138">Sam</text><text class="m" x="190" y="138">New York</text><text class="m" x="290" y="138">450</text>
    <text class="m" x="30" y="164">1004</text><text class="m" x="100" y="164">Sam</text><text class="m" x="190" y="164">New York</text><text class="m" x="290" y="164">980</text>
  </g>
  <g class="f" data-step="1">
    <text x="20" y="200" class="m" font-size="11" fill="#531A8A">Sam moved: the city is stored 3 times</text>
  </g>
  <!-- step 2: partial update -->
  <g class="f" data-step="2">
    <rect x="186" y="72" width="90" height="20" fill="#F4EEFA"/>
    <text x="190" y="86" class="m" font-size="12" font-weight="700" fill="#531A8A">Toronto</text>
    <rect x="186" y="124" width="90" height="20" fill="#F4EEFA"/>
    <text x="190" y="138" class="m" font-size="12" font-weight="700" fill="#531A8A">Toronto</text>
    <rect x="20" y="148" width="340" height="24" fill="none" stroke="#C2382F" stroke-width="2"/>
    <text x="20" y="222" class="m" font-size="11" font-weight="700" fill="#C2382F">job updated 2 of 3 rows: Sam now lives in 2 cities</text>
  </g>
  <!-- step 3: normalized -->
  <g class="f" data-step="3">
    <line x1="385" y1="16" x2="385" y2="276" stroke="#E7E7EF" stroke-width="1.4"/>
    <text x="410" y="30" class="m" font-size="12" font-weight="700" fill="#17151F">customers</text>
    <rect x="400" y="70" width="340" height="24" fill="#F4EEFA"/>
    <line x1="400" y1="64" x2="740" y2="64" stroke="#E7E7EF" stroke-width="1.4"/>
    <g font-size="11" font-weight="700" fill="#8C8899"><text class="m" x="410" y="56">ID</text><text class="m" x="470" y="56">NAME</text><text class="m" x="560" y="56">CITY</text></g>
    <g font-size="12" fill="#17151F">
      <text class="m" x="410" y="86">7</text><text class="m" x="470" y="86">Sam</text><text class="m" x="560" y="86" font-weight="700" fill="#531A8A">Toronto</text>
      <text class="m" x="410" y="112">8</text><text class="m" x="470" y="112">Alice</text><text class="m" x="560" y="112">Chicago</text>
    </g>
    <text x="470" y="134" class="m" font-size="11" fill="#531A8A">UPDATE customers … → 1 row</text>
    <text x="410" y="160" class="m" font-size="12" font-weight="700" fill="#17151F">orders</text>
    <line x1="400" y1="186" x2="740" y2="186" stroke="#E7E7EF" stroke-width="1.4"/>
    <g font-size="11" font-weight="700" fill="#8C8899"><text class="m" x="410" y="180">ORDER</text><text class="m" x="480" y="180">CUSTOMER_ID</text><text class="m" x="620" y="180">AMOUNT</text></g>
    <g font-size="12" fill="#17151F">
      <text class="m" x="410" y="206">1001</text><text class="m" x="480" y="206">7</text><text class="m" x="620" y="206">250</text>
      <text class="m" x="410" y="228">1002</text><text class="m" x="480" y="228">8</text><text class="m" x="620" y="228">120</text>
      <text class="m" x="410" y="250">1003</text><text class="m" x="480" y="250">7</text><text class="m" x="620" y="250">450</text>
      <text class="m" x="410" y="272">1004</text><text class="m" x="480" y="272">7</text><text class="m" x="620" y="272">980</text>
    </g>
  </g>
  <!-- step 4: join -->
  <g class="f" data-step="4">
    <path d="M404 82 C 390 82, 390 202, 404 202" fill="none" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="4 4"/>
    <text x="740" y="160" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#531A8A">JOIN on customer_id</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>A denormalized <b>orders</b> table repeats the customer's name and city on every order.</li>
  <li>Sam moves to Toronto. The fact "where Sam lives" is stored <b>three times</b>, so the update must find and change all three rows.</li>
  <li>A job (or a race with another write) changes only two. The table now contradicts itself: an <b>update anomaly</b>.</li>
  <li><b>Normalized</b>: the city lives once in <b>customers</b>; orders keep only <code>customer_id</code>. The move is a one-row update and cannot be half-applied.</li>
  <li>The price: every query that shows an order with its city now needs a <b>JOIN</b>. On one machine that is cheap; across shards or in a giant fact table it can be the slowest part of the query.</li>
</ol>
{{< /fig >}}

## Normal forms, briefly

Each normal form removes one kind of redundancy. In practice, aiming for **3NF** in transactional databases covers almost everything.

| Form | Rule | Violation example | Fix |
|---|---|---|---|
| **1NF** | One value per cell, no repeating groups | `phones = '212-555-0101, 416-555-0199'` | A `customer_phones` table |
| **2NF** | 1NF, and every column depends on the *whole* key | In `order_items(order_id, product_id, product_name)`, the name depends only on `product_id` | Move names to `products` |
| **3NF** | 2NF, and no column depends on another non-key column | `orders(customer_id, customer_city)`: city depends on the customer, not the order | Move city to `customers` |
| **BCNF** | Every determinant is a candidate key | Rare edge cases with overlapping keys | Split the table further |

Normalization also prevents **insert anomalies** (cannot store a new customer until they order) and **delete anomalies** (deleting Alice's only order deletes the fact that Alice exists).

## Where each one wins

| | Normalize | Denormalize |
|---|---|---|
| Workload | OLTP: many small reads and writes | OLAP and read-heavy APIs |
| Data changes | Often | Rarely, or append-only (events, facts) |
| Correctness risk | Low: one copy | Copies can drift; needs pipelines or triggers to sync |
| Reads | Need joins | One table or one document |
| Storage | Smaller | Larger (cheap with columnar compression) |
| Typical home | PostgreSQL, MySQL app schemas | [Star schemas]({{< relref "/docs/roadmap/data-modeling/star-schema" >}}), wide tables in BigQuery/ClickHouse, Cassandra and DynamoDB tables, search indexes |

## Why distributed systems lean on denormalization

On one machine a join is a memory operation. When tables are [sharded]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}}) differently, a join means moving data across the network (a shuffle), which is often the most expensive step in a Spark or Trino query. So distributed designs either:

- **Co-locate** related data by sharding both tables on the same key (all of a customer's orders on the customer's shard), or
- **Denormalize**: Cassandra and DynamoDB model "one table per query"; Elasticsearch documents embed what they display; warehouses use wide fact tables and small dimension tables that can be broadcast to every node.

The usual pattern in data platforms is both: a **normalized source of truth** in the operational database, and **denormalized, rebuildable copies** (warehouse tables, search indexes, caches) fed by ELT or CDC. Because they can be rebuilt from the source, drift is fixable.

## Common mistakes

- **Denormalizing an OLTP schema up front "for performance"** before measuring. Indexes and a read replica usually suffice.
- **Modelling a warehouse in 3NF** and making every analyst join 15 tables. Use a dimensional model.
- **Confusing denormalization with history.** An order should store the price *at purchase time*. That is a separate fact, not a redundant copy of `products.price`. Likewise, if you need "city at the time of the order", use a slowly changing dimension, not a live join.
- **Denormalized copies with no owner.** Every copy needs a pipeline that keeps it fresh and a way to rebuild it.

## Learning Resources

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: the chapter on data models and query languages
- [The Data Warehouse Toolkit](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/), Ralph Kimball and Margy Ross: dimensional modelling

### Articles and docs

- [A Relational Model of Data for Large Shared Data Banks](https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf): E. F. Codd, 1970
- [Apache Cassandra: Data modeling](https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/index.html): query-first, denormalized design
- [The What, Why, and When of Single-Table Design with DynamoDB](https://www.alexdebrie.com/posts/dynamodb-single-table/), Alex DeBrie
- [Database Normalization vs. Denormalization](https://medium.com/analytics-vidhya/database-normalization-vs-denormalization-a42d211dd891)

### Videos

- [Data Normalization vs Denormalization: Which is better when?](https://www.youtube.com/watch?v=W_5vn8TBLys)
