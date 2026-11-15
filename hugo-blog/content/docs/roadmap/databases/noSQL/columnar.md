---
title: "Columnar"
description: "Column-oriented analytical databases vs wide-column stores like Cassandra, and the LSM-tree write path they share, animated: memtable, WAL, flush, compaction."
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ clickhouse-client -q "SELECT city, sum(amount) FROM orders GROUP BY city"</div>

# Columnar and Wide-Column Databases

A **columnar (column-oriented) database** stores each column of a table separately on disk, so a query that needs 3 of 200 columns reads only those 3, and similar values packed together often compress 5 to 10 times. This makes columnar engines such as **ClickHouse, Apache Druid, Apache Pinot, Snowflake and BigQuery** the standard for analytics: scans and aggregations over billions of rows.

The name causes a classic confusion. **Wide-column stores** such as **Cassandra, HBase, ScyllaDB and Bigtable** are a different thing: they group data by row key into "column families" and are built for fast writes and key lookups, not analytical scans. Both families often share the same storage engine design, the **LSM tree**, explained below.

## Two families, one confusing name

| | Column-oriented (analytical) | Wide-column (operational) |
|---|---|---|
| Stores together | All values of one column | All columns of one row key (partition) |
| Typical query | `SUM(amount) GROUP BY city` over a billion rows | `get user 42's last 50 events` |
| Workload | OLAP: big scans, aggregates | OLTP at scale: huge write rates, key lookups |
| Schema | Fixed columns, SQL | Sparse, flexible columns per row; CQL or API |
| Joins | Yes (with limits on some engines) | No; denormalize, one table per query |
| Examples | ClickHouse, Druid, Pinot, StarRocks, DuckDB, Snowflake, BigQuery, Redshift | Cassandra, ScyllaDB, HBase, Google Bigtable |

Why column storage reads less and compresses better is animated on the [Parquet]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/parquet" >}}) page: Parquet is the same idea as a file format.

## Writing fast: the LSM tree

Updating values in place on disk means random I/O. Most wide-column stores (Cassandra, HBase, Bigtable, ScyllaDB) and many time-series databases instead use a **log-structured merge tree (LSM)**: buffer writes in memory, write sorted immutable files sequentially, and merge them in the background. ClickHouse's MergeTree uses the same idea without the memtable: each insert writes a sorted, immutable "part" directly, and parts are merged in the background.

{{< fig kicker="$ INSERT INTO events (key, value) VALUES ('k31', ...)" title="The LSM write path: buffer, flush, compact" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <text x="740" y="30" text-anchor="end" class="m" font-size="11" fill="#8C8899">MEMORY</text>
  <line x1="190" y1="148" x2="750" y2="148" stroke="#8C8899" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="740" y="166" text-anchor="end" class="m" font-size="11" fill="#8C8899">DISK</text>
  <g><rect x="20" y="62" width="140" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="90" y="86" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#17151F">CLIENT</text>
    <text x="90" y="104" text-anchor="middle" class="m" font-size="11" fill="#5C5869">write k31</text></g>
  <g><rect x="220" y="36" width="230" height="92" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="236" y="58" class="m" font-size="12" font-weight="700" fill="#17151F">MEMTABLE</text>
    <text x="236" y="76" font-size="11" fill="#5C5869">sorted by key, in RAM</text>
    <text x="236" y="108" class="m" font-size="12" fill="#17151F">k07 · k12</text></g>
  <g><rect x="220" y="176" width="230" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="236" y="198" class="m" font-size="12" font-weight="700" fill="#17151F">WAL</text>
    <text x="236" y="216" font-size="11" fill="#5C5869">append-only commit log</text></g>
  <g class="m" font-size="11" fill="#17151F">
    <rect x="500" y="176" width="72" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="536" y="198" text-anchor="middle">FILE 1</text><text class="m" x="536" y="216" text-anchor="middle" fill="#8C8899">k01–k40</text>
    <rect x="584" y="176" width="72" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="620" y="198" text-anchor="middle">FILE 2</text><text class="m" x="620" y="216" text-anchor="middle" fill="#8C8899">k03–k35</text>
  </g>
  <g class="f" data-step="1">
    <path d="M160 108 L220 196" stroke="#531A8A" stroke-width="1.6" fill="none"/>
    <circle cx="220" cy="196" r="3" fill="#531A8A"/>
    <text x="436" y="198" text-anchor="end" class="m" font-size="12" fill="#531A8A">+ k31</text>
  </g>
  <g class="f" data-step="2">
    <path d="M160 82 L220 82" stroke="#531A8A" stroke-width="1.6" fill="none"/>
    <circle cx="220" cy="82" r="3" fill="#531A8A"/>
    <text x="316" y="108" class="m" font-size="12" font-weight="700" fill="#531A8A">· k31</text>
    <text x="90" y="140" text-anchor="middle" class="m" font-size="11" fill="#531A8A">ack ✓</text>
  </g>
  <g class="f" data-step="3">
    <path d="M450 82 C 640 82, 704 120, 704 172" stroke="#531A8A" stroke-width="1.6" fill="none"/>
    <circle cx="704" cy="174" r="3" fill="#531A8A"/>
    <rect x="668" y="176" width="72" height="52" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="704" y="198" text-anchor="middle" class="m" font-size="11" fill="#17151F">FILE 3</text><text x="704" y="216" text-anchor="middle" class="m" font-size="11" fill="#531A8A">k07–k31</text>
    <text x="462" y="138" class="m" font-size="11" fill="#531A8A">flush (sequential write)</text>
  </g>
  <g class="f" data-step="4">
    <g stroke="#531A8A" stroke-width="1.4" fill="none"><line x1="536" y1="228" x2="580" y2="262"/><line x1="620" y1="228" x2="620" y2="262"/><line x1="704" y1="228" x2="660" y2="262"/></g>
    <rect x="500" y="262" width="240" height="52" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="620" y="284" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#17151F">MERGED FILE · k01–k40</text>
    <text x="620" y="302" text-anchor="middle" font-size="11" fill="#5C5869">latest version per key, tombstones dropped</text>
  </g>
  <g class="f" data-step="5">
    <rect x="20" y="252" width="430" height="62" rx="6" fill="#260246"/>
    <text x="36" y="276" class="m" font-size="12" fill="#EEEAF5">GET k12 → memtable → newest file → older …</text>
    <text x="36" y="298" font-size="11" fill="#DCC9EE">newest first; bloom filters skip files without the key</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>An LSM engine has a sorted <b>memtable</b> in RAM, an append-only <b>WAL</b>, and immutable sorted <b>files</b> on disk (SSTables in Cassandra and RocksDB).</li>
  <li>A write is first appended to the <b>WAL</b>. Appending is sequential, so it is fast, and it makes the write survive a crash.</li>
  <li>Then it goes into the <b>memtable</b> and the client gets its <b>ack</b>. No data file was touched.</li>
  <li>When the memtable is full it is <b>flushed</b> as a new sorted file in one sequential write. The WAL for it can now be discarded.</li>
  <li>In the background, <b>compaction</b> merge-sorts small files into bigger ones, keeping only the newest version of each key and dropping deleted ones.</li>
  <li>Reads pay the price: check the memtable, then files from <b>newest to oldest</b>, stopping at the first match. Bloom filters and compaction keep this cheap.</li>
</ol>
{{< /fig >}}

The trade-off: **writes are cheap and sequential, reads may touch several files, and compaction uses background I/O.** B-tree databases such as PostgreSQL make the opposite trade. When you see "write amplification" or "compaction storms" in Cassandra or ClickHouse tuning guides, this is the mechanism.

## Popular engines

- **[ClickHouse](https://clickhouse.com/)**: open-source columnar OLAP database, originally built at Yandex and now developed by ClickHouse Inc. Very fast on a single node, scales out with shards. Logs, product analytics, observability.
- **[Apache Druid](https://druid.apache.org/)** and **[Apache Pinot](https://pinot.apache.org/)**: real-time OLAP stores that ingest from Kafka and serve sub-second queries to user-facing dashboards. Pinot came from LinkedIn.
- **[DuckDB](https://duckdb.org/)**: embedded, in-process columnar engine. The "SQLite for analytics", great for local work and pipelines.
- **Cloud warehouses**: Snowflake, BigQuery, Amazon Redshift, Databricks SQL. Columnar storage, separated from compute.
- **[Apache Cassandra](https://cassandra.apache.org/)** and **[ScyllaDB](https://www.scylladb.com/)**: wide-column, masterless, multi-datacenter writes. Cassandra 5.0 (2024) added storage-attached indexes and vector search.
- **[Apache HBase](https://hbase.apache.org/)** and **Google Bigtable**: wide-column stores with strongly consistent rows. HBase runs on HDFS and is mostly found in older Hadoop estates.

## Common mistakes

- **Calling Cassandra "columnar" and using it for analytics.** A full-table aggregate in Cassandra is slow and expensive. Replicate the data into an OLAP engine.
- **Single-row inserts into ClickHouse.** Each insert creates a part that must later be merged. Batch inserts (thousands of rows) or use async inserts.
- **Updates and deletes as a hot path.** Columnar and LSM engines handle them as rewrites or tombstones; frequent ones hurt.
- **Bad partition keys in wide-column stores.** One huge partition (for example all events of a popular customer) becomes a hotspot.

## Learning Resources

- [C-Store: A Column-oriented DBMS](https://web.stanford.edu/class/cs345d-01/rl/cstore.pdf) (2005): the paper behind modern column stores
- [The Log-Structured Merge-Tree](https://www.cs.umb.edu/~poneil/lsmtree.pdf) (1996): the original LSM paper
- [ClickHouse documentation: MergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree)
- [Cassandra documentation: storage engine](https://cassandra.apache.org/doc/latest/cassandra/architecture/storage-engine.html)
- [Apache Druid design](https://druid.apache.org/docs/latest/design/) and [Apache Pinot docs](https://docs.pinot.apache.org/)
- *Database Internals*, Alex Petrov: chapters on LSM trees and B-trees
