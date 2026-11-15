---
weight: 6
title: Data Lakehouse
description: "How a data lakehouse works: open table formats (Iceberg, Delta Lake, Hudi) add ACID commits, snapshots and time travel to Parquet files on object storage."
---
<div class="lx-kicker-line">$ ls s3://lake/orders/_delta_log/</div>

# Data Lakehouse

A **data lakehouse** stores data once, as open files on cheap object storage like a [data lake]({{< relref "/docs/roadmap/data-management-architecture/data-lake" >}}), but adds the features that used to require a [data warehouse]({{< relref "/docs/roadmap/data-management-architecture/relational-data-warehouse" >}}): ACID transactions, schemas, updates and deletes, fast SQL and fine-grained access control. The trick is an **open table format** (Apache Iceberg, Delta Lake or Apache Hudi) that keeps a transaction log next to the Parquet files. Any engine that understands the format (Spark, Trino, Flink, DuckDB, Snowflake, BigQuery, Databricks) can read and write the same table.

## How a table format turns files into a table

A table is a folder of immutable [Parquet]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/parquet" >}}) data files plus metadata that says which files make up the table **right now**. Every write adds new files and then atomically commits a new metadata version. Step through the example (Delta Lake naming, with the 20-digit log file names shortened; Iceberg uses metadata files, manifest lists and manifests, but the idea is the same).

{{< fig kicker="$ INSERT · INSERT · UPDATE · time travel · concurrent MERGE" title="Commits, snapshots and time travel" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <g class="m" font-size="11" font-weight="700" fill="#8C8899">
    <text class="m" x="20" y="30">TRANSACTION LOG · _delta_log/</text><text class="m" x="290" y="30">DATA FILES · Parquet</text><text class="m" x="560" y="30">SNAPSHOTS</text>
  </g>
  <g class="m" font-size="12">
    <rect x="20" y="44" width="230" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="63" font-weight="700" fill="#17151F">000.json</text><text class="m" x="34" y="80" fill="#5C5869">INSERT · +f1 +f2</text>
    <rect x="290" y="48" width="100" height="36" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="340" y="71" text-anchor="middle" fill="#17151F">f1</text>
    <rect x="410" y="48" width="100" height="36" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="460" y="71" text-anchor="middle" fill="#17151F">f2</text>
    <rect x="560" y="44" width="180" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="574" y="71" fill="#17151F"><tspan font-weight="700">v0</tspan> = {f1, f2}</text>
  </g>
  <g class="f m" data-step="1" font-size="12">
    <rect x="20" y="98" width="230" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="117" font-weight="700" fill="#17151F">001.json</text><text class="m" x="34" y="134" fill="#5C5869">INSERT · +f3</text>
    <rect x="290" y="102" width="100" height="36" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="340" y="125" text-anchor="middle" fill="#17151F">f3</text>
    <rect x="560" y="98" width="180" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="574" y="125" fill="#17151F"><tspan font-weight="700">v1</tspan> = {f1, f2, f3}</text>
  </g>
  <g class="f m" data-step="2" font-size="12">
    <rect x="20" y="152" width="230" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="171" font-weight="700" fill="#17151F">002.json</text><text class="m" x="34" y="188" fill="#5C5869">UPDATE · −f2 +f4</text>
    <rect x="410" y="102" width="100" height="36" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text class="m" x="460" y="125" text-anchor="middle" fill="#531A8A" font-weight="700">f4</text>
    <rect x="410" y="48" width="100" height="36" rx="6" fill="#fff" opacity=".85"/>
    <text class="m" x="460" y="66" text-anchor="middle" fill="#8C8899" font-size="11">f2</text><text class="m" x="460" y="79" text-anchor="middle" fill="#8C8899" font-size="11">not in v2</text>
    <rect x="560" y="152" width="180" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="574" y="179" fill="#531A8A"><tspan font-weight="700">v2</tspan> = {f1, f3, f4}</text>
  </g>
  <g class="f m" data-step="3" font-size="12">
    <rect x="557" y="95" width="186" height="50" rx="8" fill="none" stroke="#531A8A" stroke-width="2.5"/>
    <rect x="20" y="262" width="350" height="54" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="34" y="283" fill="#17151F">SELECT * FROM orders <tspan font-weight="700" fill="#531A8A">VERSION AS OF 1</tspan></text>
    <text class="m" x="34" y="303" fill="#5C5869">reads f1, f2, f3 · f2 is still on disk</text>
  </g>
  <g class="f m" data-step="4" font-size="12">
    <rect x="20" y="206" width="230" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="225" font-weight="700" fill="#17151F">003.json</text><text class="m" x="34" y="242" fill="#5C5869">MERGE · +f5 (writer B)</text>
    <rect x="290" y="156" width="100" height="36" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="340" y="179" text-anchor="middle" fill="#17151F">f5</text>
    <rect x="390" y="262" width="350" height="54" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4" stroke-dasharray="5 4"/>
    <text class="m" x="404" y="283" fill="#C2382F" font-weight="700">writer B: 002.json already exists</text>
    <text class="m" x="404" y="303" fill="#5C5869">check conflicts, retry as 003.json</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The first write adds files <b>f1</b> and <b>f2</b> and commits log entry <b>000</b>. The table version <b>v0</b> is exactly the set of files the log lists.</li>
  <li>An insert writes <b>f3</b>, then commits <b>001</b>. Readers see either v0 or v1, never half of a write: the commit is <b>atomic</b>.</li>
  <li>An <b>UPDATE</b> never edits a Parquet file. It rewrites the affected file: new file <b>f4</b> holds f2's rows with the change applied, and the commit says "remove f2, add f4". (Deletion vectors can mark rows deleted instead of rewriting the whole file.)</li>
  <li><b>Time travel</b>: old snapshots still point to existing files, so you can query or restore v1. Files leave disk only after <code>VACUUM</code> / snapshot expiry.</li>
  <li><b>Optimistic concurrency</b>: writer B also tried to commit 002 and lost the race. It checks whether v2 touched the same data, then retries as <b>003</b>.</li>
</ol>
{{< /fig >}}

The same design gives you schema enforcement and evolution (the schema lives in the metadata), partition pruning and file skipping from per-file min/max statistics, and an audit history of every change.

## The three open table formats

| | Apache Iceberg | Delta Lake | Apache Hudi |
|---|---|---|---|
| Origin | Netflix, 2017 | Databricks, 2019 | Uber, 2016 |
| Metadata | metadata.json → manifest list → manifests | `_delta_log` JSON commits + Parquet checkpoints | Timeline of commits in `.hoodie` |
| Strength | Broadest engine support, hidden partitioning, REST catalog spec | Tight Spark / Databricks integration, simple log | Upserts and incremental pulls, record-level indexes |
| Catalogs | Iceberg REST (Polaris, Nessie, Glue, Unity, Snowflake Open Catalog) | Unity Catalog, Hive Metastore, Glue | Hive Metastore, Glue |

By 2026 Iceberg has become the common denominator across vendors, and Delta tables can be exposed to Iceberg readers through Delta UniForm. Pick based on your main engine and catalog; data in all three is still Parquet underneath. DuckLake is a newer design that keeps the metadata in a SQL database instead of files.

## Lakehouse vs lake vs warehouse

| | Data lake | Lakehouse | Warehouse |
|---|---|---|---|
| Storage | Open files | Open files + table metadata | Engine-managed |
| ACID updates and deletes | No | Yes | Yes |
| Engines | Many | Many, on the same tables | Usually one |
| Unstructured data and ML | Yes | Yes | Limited |
| Lock-in | Low | Low | Higher |

## Operating a lakehouse

Table formats move work from the database to you:

- **Compaction**: streaming and frequent small writes create many small files. Schedule `OPTIMIZE` / `rewrite_data_files`.
- **Snapshot expiry and vacuum**: old files stay until expired, which costs storage and matters for data deletion requests.
- **Clustering**: sort or cluster by common filter columns (Z-order, liquid clustering, Iceberg sort orders) so min/max stats can skip files.
- **One catalog**: the catalog is the source of truth for "where is the current metadata". Two catalogs pointing at the same table is a recipe for lost commits.

## Common mistakes

- Treating the lakehouse as "just a lake" and skipping compaction until queries slow to a crawl.
- Writing to the same table from engines that use different catalogs.
- Forgetting that `DELETE` does not physically remove data until snapshots expire and files are vacuumed.
- Over-partitioning, as in plain lakes. Iceberg's hidden partitioning (for example `days(ordered_at)`) avoids many of these mistakes.

## Learning Resources

### Papers
- [Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics (CIDR 2021)](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)
- [Delta Lake: High-Performance ACID Table Storage over Cloud Object Stores (VLDB 2020)](https://www.vldb.org/pvldb/vol13/p3411-armbrust.pdf)

### Docs and specs
- [Apache Iceberg table spec](https://iceberg.apache.org/spec/)
- [Delta Lake transaction log protocol](https://github.com/delta-io/delta/blob/master/PROTOCOL.md)
- [Apache Hudi overview](https://hudi.apache.org/docs/overview)

### Books
- [Apache Iceberg: The Definitive Guide](https://www.oreilly.com/library/view/apache-iceberg-the/9781098148614/)
- [Delta Lake: The Definitive Guide](https://www.oreilly.com/library/view/delta-lake-the/9781098151935/)
- [Deciphering Data Architectures](https://www.oreilly.com/library/view/deciphering-data-architectures/9781098150754/): chapter on the data lakehouse
