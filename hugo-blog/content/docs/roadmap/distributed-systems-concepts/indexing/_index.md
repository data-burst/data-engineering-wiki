---
title: "Indexing"
description: "How database indexes work: B-tree lookup vs full table scan animated, index types (hash, LSM, GIN, BRIN) and local vs global indexes in sharded systems."
weight: 7
bookToC: false
---
<div class="lx-kicker-line">$ EXPLAIN SELECT * FROM orders WHERE id = 642;</div>

# Indexing

An **index** is an extra data structure that lets a database find rows without reading the whole table, the same way a book's index lets you jump to a page instead of reading every page. It is a sorted, compact copy of one or more columns with pointers back to the rows. Indexes make reads dramatically faster and make every write a little slower, because each insert or update must also update the index.

## From full scan to index lookup

{{< fig kicker="$ SELECT * FROM orders WHERE id = 642" title="Full table scan vs B-tree index lookup" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 300">
  <text x="740" y="30" text-anchor="end" class="m" font-size="11" fill="#5C5869">orders: 16 pages on disk</text>
  <text x="20" y="232" class="m" font-size="11" fill="#5C5869">HEAP · table pages, rows in insert order</text>
  <g fill="#fff" stroke="#3D3A49" stroke-width="1.2">
    <rect x="20" y="240" width="38" height="40" rx="4"/><rect x="65" y="240" width="38" height="40" rx="4"/><rect x="110" y="240" width="38" height="40" rx="4"/><rect x="155" y="240" width="38" height="40" rx="4"/>
    <rect x="200" y="240" width="38" height="40" rx="4"/><rect x="245" y="240" width="38" height="40" rx="4"/><rect x="290" y="240" width="38" height="40" rx="4"/><rect x="335" y="240" width="38" height="40" rx="4"/>
    <rect x="380" y="240" width="38" height="40" rx="4"/><rect x="425" y="240" width="38" height="40" rx="4"/><rect x="470" y="240" width="38" height="40" rx="4"/><rect x="515" y="240" width="38" height="40" rx="4"/>
    <rect x="560" y="240" width="38" height="40" rx="4"/><rect x="605" y="240" width="38" height="40" rx="4"/><rect x="650" y="240" width="38" height="40" rx="4"/><rect x="695" y="240" width="38" height="40" rx="4"/>
  </g>
  <!-- step 1: full scan -->
  <g class="f" data-step="1">
    <g fill="#3D3A49">
      <rect x="20" y="240" width="38" height="40" rx="4"/><rect x="65" y="240" width="38" height="40" rx="4"/><rect x="110" y="240" width="38" height="40" rx="4"/><rect x="155" y="240" width="38" height="40" rx="4"/>
      <rect x="200" y="240" width="38" height="40" rx="4"/><rect x="245" y="240" width="38" height="40" rx="4"/><rect x="290" y="240" width="38" height="40" rx="4"/><rect x="335" y="240" width="38" height="40" rx="4"/>
      <rect x="380" y="240" width="38" height="40" rx="4"/><rect x="425" y="240" width="38" height="40" rx="4"/><rect x="470" y="240" width="38" height="40" rx="4"/><rect x="515" y="240" width="38" height="40" rx="4"/>
      <rect x="560" y="240" width="38" height="40" rx="4"/><rect x="605" y="240" width="38" height="40" rx="4"/><rect x="650" y="240" width="38" height="40" rx="4"/><rect x="695" y="240" width="38" height="40" rx="4"/>
    </g>
    <text x="20" y="30" class="m" font-size="12" font-weight="700" fill="#17151F">SEQ SCAN · 16 / 16 pages read</text>
  </g>
  <!-- step 2: the B-tree -->
  <g class="f" data-step="2">
    <g stroke="#B5B0C4" stroke-width="1.4">
      <line x1="380" y1="56" x2="150" y2="90"/><line x1="380" y1="56" x2="380" y2="90"/><line x1="380" y1="56" x2="610" y2="90"/>
      <line x1="150" y1="126" x2="90" y2="160"/><line x1="150" y1="126" x2="210" y2="160"/>
      <line x1="380" y1="126" x2="320" y2="160"/><line x1="380" y1="126" x2="440" y2="160"/>
      <line x1="610" y1="126" x2="550" y2="160"/><line x1="610" y1="126" x2="670" y2="160"/>
    </g>
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4">
      <rect x="300" y="20" width="160" height="36" rx="6"/>
      <rect x="90" y="90" width="120" height="36" rx="6"/><rect x="320" y="90" width="120" height="36" rx="6"/><rect x="550" y="90" width="120" height="36" rx="6"/>
      <rect x="40" y="160" width="100" height="36" rx="6"/><rect x="160" y="160" width="100" height="36" rx="6"/>
      <rect x="270" y="160" width="100" height="36" rx="6"/><rect x="390" y="160" width="100" height="36" rx="6"/>
      <rect x="500" y="160" width="100" height="36" rx="6"/><rect x="620" y="160" width="100" height="36" rx="6"/>
    </g>
    <g font-size="12" font-weight="600" fill="#17151F" text-anchor="middle">
      <text class="m" x="380" y="43">ROOT · 400 | 800</text>
      <text class="m" x="150" y="113">&lt; 200 | ≥ 200</text><text class="m" x="380" y="113">&lt; 600 | ≥ 600</text><text class="m" x="610" y="113">&lt; 1000 | ≥ 1000</text>
    </g>
    <g font-size="11" fill="#3D3A49" text-anchor="middle">
      <text class="m" x="90" y="182">1–199</text><text class="m" x="210" y="182">200–399</text><text class="m" x="320" y="182">400–599</text>
      <text class="m" x="440" y="182">600–799</text><text class="m" x="550" y="182">800–999</text><text class="m" x="670" y="182">1000+</text>
    </g>
  </g>
  <!-- step 3: index path -->
  <g class="f" data-step="3">
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.2">
      <rect x="20" y="240" width="38" height="40" rx="4"/><rect x="65" y="240" width="38" height="40" rx="4"/><rect x="110" y="240" width="38" height="40" rx="4"/><rect x="155" y="240" width="38" height="40" rx="4"/>
      <rect x="200" y="240" width="38" height="40" rx="4"/><rect x="245" y="240" width="38" height="40" rx="4"/><rect x="290" y="240" width="38" height="40" rx="4"/><rect x="335" y="240" width="38" height="40" rx="4"/>
      <rect x="380" y="240" width="38" height="40" rx="4"/><rect x="425" y="240" width="38" height="40" rx="4"/><rect x="470" y="240" width="38" height="40" rx="4"/>
      <rect x="560" y="240" width="38" height="40" rx="4"/><rect x="605" y="240" width="38" height="40" rx="4"/><rect x="650" y="240" width="38" height="40" rx="4"/><rect x="695" y="240" width="38" height="40" rx="4"/>
    </g>
    <rect x="515" y="240" width="38" height="40" rx="4" fill="#531A8A"/>
    <g fill="none" stroke="#531A8A" stroke-width="2.4">
      <line x1="380" y1="56" x2="380" y2="90"/><line x1="380" y1="126" x2="440" y2="160"/><line x1="460" y1="196" x2="530" y2="238"/>
      <rect x="300" y="20" width="160" height="36" rx="6"/><rect x="320" y="90" width="120" height="36" rx="6"/><rect x="390" y="160" width="100" height="36" rx="6"/>
    </g>
    <text x="20" y="54" class="m" font-size="12" font-weight="700" fill="#531A8A">INDEX SCAN · 3 index + 1 heap page</text>
    <text x="545" y="228" class="m" font-size="11" fill="#531A8A">id 642 → page 11</text>
  </g>
  <!-- step 4: linked leaves -->
  <g class="f" data-step="4">
    <g stroke="#531A8A" stroke-width="1.6" fill="none">
      <path d="M140 178h18M260 178h8M370 178h18M490 178h8M600 178h18"/>
    </g>
    <text x="20" y="214" class="m" font-size="11" fill="#531A8A">leaves are linked: id BETWEEN 600 AND 999 = 1 descent + walk right</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The <b>orders</b> table is stored as pages on disk, rows in the order they were inserted. We want one row: <b>id = 642</b>.</li>
  <li>With no index, the database must read <b>every page</b> and check every row: a <b>sequential scan</b>. Cost grows with the table.</li>
  <li>A <b>B-tree index</b> on <code>id</code> keeps keys sorted in a shallow tree. Each node holds many keys and points to the right child for each range.</li>
  <li>Lookup: root says 642 is between 400 and 800, the next node sends it right of 600, the leaf holds <b>642 → page 11</b>. Four page reads instead of sixteen. On a billion rows, the tree is still only 3 to 5 levels deep.</li>
  <li>Leaves are linked in key order, so <b>range queries</b> and <code>ORDER BY id</code> descend once and then walk sideways.</li>
</ol>
{{< /fig >}}

## Index types

| Type | Structure | Good for | Found in |
|---|---|---|---|
| **B-tree** | Balanced sorted tree | Equality, ranges, sorting; the default | PostgreSQL, MySQL, SQL Server, Oracle, SQLite |
| **Hash** | Hash table | Equality only | PostgreSQL hash, in-memory stores |
| **LSM-tree** | Sorted in-memory buffer flushed to sorted files, merged in the background | Very high write rates | Cassandra, RocksDB, ScyllaDB, ClickHouse MergeTree (similar idea) |
| **Inverted (GIN)** | Term → list of rows | Full-text search, JSON, arrays | Elasticsearch, OpenSearch, PostgreSQL GIN |
| **BRIN / zone maps** | Min/max per block of rows | Huge, naturally ordered tables (time series) | PostgreSQL BRIN, Parquet statistics, Snowflake micro-partitions |
| **Bitmap** | One bit-array per distinct value | Low-cardinality columns in analytics | Oracle, Druid, Pinot |
| **Vector (HNSW, IVF)** | Graph or clusters of embeddings | Nearest-neighbour search | pgvector, Milvus, Elasticsearch |

Analytical warehouses rarely use B-trees. They rely on **columnar storage, partitioning and min/max statistics** to skip data instead, as explained on the [Parquet]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/parquet" >}}) page.

## Designing good indexes

- **Index what you filter and join on.** Start from real slow queries and their `EXPLAIN` plans, not from guesses.
- **Selectivity matters.** An index on `status` with three values rarely helps; the database will scan anyway.
- **Composite indexes follow the leftmost-prefix rule.** An index on `(customer_id, created_at)` serves `WHERE customer_id = 7` and `WHERE customer_id = 7 AND created_at > ...`, but not `WHERE created_at > ...` alone.
- **Covering indexes** (`INCLUDE (amount)` in PostgreSQL) answer a query from the index alone, skipping the heap.
- **Every index costs** disk space, memory and write time. A table with ten indexes does eleven writes per insert.

## Indexes in sharded systems

When data is [sharded]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}}) by one key, an index on a different column has two possible shapes:

| | Local (document-partitioned) index | Global (term-partitioned) index |
|---|---|---|
| Where it lives | Each shard indexes only its own rows | The index itself is sharded by the indexed value |
| Writes | Cheap: one shard | Touch the data shard and an index shard, often asynchronously |
| Reads by indexed column | Ask every shard (scatter-gather) | Ask one index shard |
| Examples | Elasticsearch, MongoDB, Cassandra secondary indexes | DynamoDB global secondary indexes, Spanner, CockroachDB |

DynamoDB global secondary indexes are updated asynchronously, so they are eventually consistent: a read right after a write can miss it. See [Consistency vs Eventual Consistency]({{< relref "/docs/roadmap/distributed-systems-concepts/consistency-vs-eventual-consistency" >}}).

## Common mistakes

- **Wrapping the column in a function.** `WHERE LOWER(email) = ...` cannot use a plain index on `email`; create an expression index or store the normalized value.
- **Leading wildcards.** `LIKE '%gmail.com'` cannot use a B-tree; use a trigram (pg_trgm) or full-text index.
- **Indexing everything "just in case".** Unused indexes slow every write. Check `pg_stat_user_indexes` and drop the dead ones.
- **Forgetting bulk loads.** For a big backfill, drop or disable secondary indexes, load, then rebuild.
- **Implicit type casts.** Comparing a `varchar` column to a number can disable the index.

## Learning Resources

### Books and sites

- [Use The Index, Luke](https://use-the-index-luke.com/): Markus Winand's free guide to SQL indexing
- [Database Internals](https://www.oreilly.com/library/view/database-internals/9781492040330/), Alex Petrov: B-trees and LSM-trees in depth
- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: storage and retrieval, and the partitioning chapter on secondary indexes

### Docs

- [PostgreSQL: Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [DynamoDB: Global secondary indexes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html)

### Videos

- [How indexes work in distributed databases, their trade-offs, and challenges](https://www.youtube.com/watch?v=eQ3eNd5WbH8)
