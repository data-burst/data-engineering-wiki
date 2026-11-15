---
title: "Apache Hive"
description: "Apache Hive in 2026: HiveQL, the Hive Metastore, partition pruning (animated), Hive 4 on Tez, and why the Metastore outlived the engine."
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ beeline -u jdbc:hive2://hive:10000 -e "SHOW PARTITIONS orders"</div>

# Apache Hive

**Apache Hive** is a data warehouse system on top of Hadoop that lets you query files in HDFS or object storage with **HiveQL**, a SQL dialect, and compiles each query into distributed jobs. Facebook built it around 2008 so analysts could write SQL instead of Java MapReduce programs, and it became an Apache top-level project in 2010. Hive introduced two ideas the whole data lake world still runs on: **tables defined over folders of files** (with partitions as sub-folders) and a central **Metastore** that records those tables. In 2026 few teams start new projects on the Hive engine, but the Hive Metastore and the Hive table layout are everywhere.

<img src="hive.png" alt="Apache Hive logo" width="120">

## Tables are folders, partitions are sub-folders

A Hive table is metadata pointing at a directory. A **partitioned** table adds one sub-directory per partition value, so the engine can skip whole directories based on the `WHERE` clause:

```sql
CREATE EXTERNAL TABLE orders (id BIGINT, city STRING, amount DECIMAL(10,2))
PARTITIONED BY (dt STRING)
STORED AS PARQUET
LOCATION 's3://lake/orders/';
```

{{< fig kicker="$ SELECT SUM(amount) FROM orders WHERE dt = '2026-11-16'" title="Metastore lookup and partition pruning" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 320">
  <rect x="20" y="20" width="240" height="120" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text x="36" y="42" class="m" font-size="12" font-weight="700" fill="#17151F">HIVE METASTORE</text>
  <g class="m" font-size="11" fill="#5C5869"><text class="m" x="36" y="66">table</text><text class="m" x="116" y="66">orders</text><text class="m" x="36" y="84">format</text><text class="m" x="116" y="84">parquet</text><text class="m" x="36" y="102">location</text><text class="m" x="116" y="102">s3://lake/orders/</text><text class="m" x="36" y="120">partition</text><text class="m" x="116" y="120">dt (3 values)</text></g>
  <text x="320" y="38" class="m" font-size="12" font-weight="700" fill="#5C5869">s3://lake/orders/</text>
  <g>
    <rect x="320" y="52" width="420" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="320" y="120" width="420" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="320" y="188" width="420" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <g class="m" font-size="12" font-weight="700" fill="#17151F"><text class="m" x="336" y="74">dt=2026-11-14/</text><text class="m" x="336" y="142">dt=2026-11-15/</text><text class="m" x="336" y="210">dt=2026-11-16/</text></g>
    <g fill="#F7F7FB" stroke="#E7E7EF"><rect x="336" y="82" width="124" height="18" rx="3"/><rect x="468" y="82" width="124" height="18" rx="3"/><rect x="336" y="150" width="124" height="18" rx="3"/><rect x="468" y="150" width="124" height="18" rx="3"/><rect x="336" y="218" width="124" height="18" rx="3"/><rect x="468" y="218" width="124" height="18" rx="3"/></g>
    <g class="m" font-size="11" fill="#3D3A49"><text class="m" x="344" y="95">part-0.parquet</text><text class="m" x="476" y="95">part-1.parquet</text><text class="m" x="344" y="163">part-0.parquet</text><text class="m" x="476" y="163">part-1.parquet</text><text class="m" x="344" y="231">part-0.parquet</text><text class="m" x="476" y="231">part-1.parquet</text></g>
  </g>
  <g class="f" data-step="1">
    <rect x="20" y="172" width="240" height="72" rx="6" fill="#260246"/>
    <g class="m" font-size="12" fill="#EEEAF5"><text class="m" x="36" y="196">SELECT SUM(amount)</text><text class="m" x="36" y="214">FROM orders</text><text class="m" x="36" y="232">WHERE dt='2026-11-16'</text></g>
    <line x1="140" y1="172" x2="140" y2="142" stroke="#531A8A" stroke-width="2"/><circle cx="140" cy="142" r="3" fill="#531A8A"/>
    <text x="150" y="162" class="m" font-size="11" fill="#531A8A">lookup</text>
  </g>
  <g class="f" data-step="2">
    <rect x="320" y="52" width="420" height="56" rx="6" fill="#fff" fill-opacity=".85"/>
    <rect x="320" y="120" width="420" height="56" rx="6" fill="#fff" fill-opacity=".85"/>
    <g class="m" font-size="12" font-weight="700" fill="#8C8899" text-anchor="end"><text class="m" x="726" y="85">pruned</text><text class="m" x="726" y="153">pruned</text></g>
  </g>
  <g class="f" data-step="3">
    <rect x="317" y="185" width="426" height="62" rx="8" fill="none" stroke="#531A8A" stroke-width="2.5"/>
    <line x1="317" y1="216" x2="262" y2="216" stroke="#531A8A" stroke-width="2"/><circle cx="262" cy="216" r="3" fill="#531A8A"/>
    <text x="740" y="266" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#531A8A">2 of 6 files read</text>
  </g>
  <g class="f" data-step="4">
    <g fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"><rect x="20" y="276" width="70" height="30" rx="6"/><rect x="100" y="276" width="70" height="30" rx="6"/><rect x="180" y="276" width="70" height="30" rx="6"/><rect x="260" y="276" width="70" height="30" rx="6"/></g>
    <g class="m" font-size="11" font-weight="700" fill="#531A8A" text-anchor="middle"><text class="m" x="55" y="295">HIVE</text><text class="m" x="135" y="295">SPARK</text><text class="m" x="215" y="295">TRINO</text><text class="m" x="295" y="295">FLINK</text></g>
    <text x="344" y="295" font-size="11" fill="#5C5869">all read the same Metastore and the same files</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The data: one folder per day, Parquet files inside. The <b>Metastore</b> knows the schema, format, location and the list of <b>partitions</b>.</li>
  <li>A query arrives. Before reading any data, the engine asks the Metastore about <b>orders</b>.</li>
  <li>The filter is on the partition column <b>dt</b>, so two of the three folders cannot match. They are <b>pruned</b> without being listed or opened.</li>
  <li>Only the files under <b>dt=2026-11-16/</b> are read. On a table with three years of data this is 1 folder out of about 1,100.</li>
  <li>The Metastore is a shared service: <b>Spark, Trino, Flink</b> and Hive all resolve <b>orders</b> to the same files. That shared catalog is Hive's lasting legacy.</li>
</ol>
{{< /fig >}}

## Architecture

- **HiveServer2**: accepts JDBC/ODBC connections (for example from `beeline` or BI tools), with authentication and concurrency.
- **Driver and compiler**: parse HiveQL, check it against the Metastore, optimize it with a cost-based optimizer (Apache Calcite), and produce a DAG of tasks.
- **Execution engine**: **Apache Tez** runs the DAG on YARN. MapReduce execution has been deprecated since Hive 2, and Hive on Spark was removed in Hive 4. **LLAP** (Live Long and Process) adds long-running daemons with caching for faster interactive queries.
- **Hive Metastore (HMS)**: a Thrift service backed by a relational database (MySQL or PostgreSQL) that stores databases, tables, columns, partitions and statistics.

## Where Hive stands in 2026

- **Hive 4** (4.0 released in 2024) is the maintained line, with Iceberg table support, improved ACID tables and many fixes. The 2.x and 3.x lines are end-of-life.
- **The engine** is mostly found in existing Hadoop estates and Cloudera deployments. New lakehouse projects usually run **Spark SQL** for batch and **Trino** for interactive queries.
- **The Metastore** remains widely used as a catalog by Spark, Trino, Presto, Flink and Impala. AWS Glue Data Catalog speaks a Hive-Metastore-compatible API. New platforms increasingly use **Iceberg REST catalogs** (Apache Polaris, Unity Catalog, AWS Glue, Nessie) instead.
- **The Hive table format** (a table is just a folder) has known limits: no atomic multi-file commits, slow listing of many partitions on object storage, and schema changes that can break readers. **Apache Iceberg**, Delta Lake and Hudi were created largely to fix these. See [Data Lakehouse]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}}).

## Key concepts

| Concept | What it means |
|---|---|
| **Managed vs external table** | `DROP TABLE` on a managed table deletes the data; on an external table it deletes only the metadata. |
| **Partitioning** | One folder per value of a low-cardinality column (date, country). Enables pruning. |
| **Bucketing** | Hash rows into a fixed number of files by a column, to speed up joins and sampling. |
| **Schema-on-read** | The schema is applied when files are read, not checked when they are written. |
| **SerDe** | Serializer/deserializer that tells Hive how to read a file format (Parquet, ORC, JSON, CSV). |
| **`MSCK REPAIR TABLE`** | Scans the table location and registers partition folders that were written without telling the Metastore. |

## Common mistakes

- **Partitioning by a high-cardinality column** (user id, timestamp to the second): millions of tiny folders and a Metastore that slows to a crawl.
- **Writing files directly to S3 and forgetting to add the partition,** so queries silently return no rows for the new day.
- **Comparing the partition column with a function** (`WHERE to_date(dt) = ...`), which can prevent pruning. Filter on the raw partition value.
- **Treating the Metastore database as unimportant.** It is a single point of failure for every engine that uses it; back it up and monitor it.

## Learning Resources

- [Apache Hive website](https://hive.apache.org/) and [Hive Wiki: Language Manual](https://cwiki.apache.org/confluence/display/Hive/LanguageManual)
- [Hive: A Warehousing Solution Over a Map-Reduce Framework](https://www.vldb.org/pvldb/vol2/vldb09-938.pdf) (VLDB 2009): the original paper
- [Apache Hive: From MapReduce to Enterprise-grade Big Data Warehousing](https://arxiv.org/abs/1903.10970) (SIGMOD 2019)
- [Trino Hive connector](https://trino.io/docs/current/connector/hive.html): using the Metastore from Trino
- [Apache Hive Introduction and Architecture](https://www.youtube.com/watch?v=taTfW2kXSoE): video
- *Programming Hive*, Edward Capriolo, Dean Wampler and Jason Rutherglen (older, but the data model chapters still apply)
