---
title: "Query Engine"
description: "How distributed SQL query engines work, animated: coordinator, splits, parallel scans, partial aggregation, exchange. Hive, Spark SQL, Trino, Presto."
bookCollapseSection: true
weight: 17
bookToC: false
---
<div class="lx-kicker-line">$ trino --execute "SELECT city, SUM(amount) FROM lake.orders GROUP BY city"</div>

# Query Engines

A **query engine** takes a SQL query and runs it over data stored somewhere else: Parquet files on S3, tables in Hive or Iceberg, even PostgreSQL or Kafka. Unlike a database it usually **does not own the storage**; it only reads (and sometimes writes) files and asks a **catalog** where tables live and what their schemas are. Splitting compute from storage lets you keep one copy of the data on cheap object storage and point many engines at it. Distributed engines such as **Trino, Presto, Spark SQL and Hive** spread each query over many machines so a scan of terabytes takes seconds or minutes instead of hours.

## How a distributed query runs

Every engine in this section follows the same shape: one node plans, many nodes scan in parallel, and data is **shuffled** (exchanged) between them so rows with the same key meet on the same machine.

{{< fig kicker="$ SELECT city, SUM(amount) FROM orders GROUP BY city" title="Coordinator, splits, partial aggregates, exchange" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 370">
  <rect x="200" y="14" width="360" height="50" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text x="380" y="35" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#17151F">COORDINATOR</text>
  <text x="380" y="53" text-anchor="middle" font-size="11" fill="#5C5869">parse · plan · schedule</text>
  <rect x="620" y="14" width="120" height="50" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text x="680" y="35" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#17151F">CLIENT</text>
  <text x="680" y="53" text-anchor="middle" font-size="11" fill="#5C5869">BI tool, CLI</text>
  <line x1="620" y1="39" x2="562" y2="39" stroke="#531A8A" stroke-width="2"/><circle cx="562" cy="39" r="3" fill="#531A8A"/>
  <g class="m" font-size="11" fill="#8C8899" text-anchor="middle">
    <text class="m" x="80" y="90">STORAGE</text><text class="m" x="265" y="90">SCAN + PARTIAL AGG</text><text class="m" x="400" y="90">EXCHANGE</text><text class="m" x="525" y="90">FINAL AGG</text>
  </g>
  <g class="m" font-size="11">
    <rect x="20" y="105" width="120" height="70" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="80" y="135" text-anchor="middle" fill="#17151F">part-0.parquet</text><text class="m" x="80" y="155" text-anchor="middle" fill="#8C8899">3 rows</text>
    <rect x="20" y="195" width="120" height="70" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="80" y="225" text-anchor="middle" fill="#17151F">part-1.parquet</text><text class="m" x="80" y="245" text-anchor="middle" fill="#8C8899">2 rows</text>
    <rect x="20" y="285" width="120" height="70" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="80" y="315" text-anchor="middle" fill="#17151F">part-2.parquet</text><text class="m" x="80" y="335" text-anchor="middle" fill="#8C8899">3 rows</text>
  </g>
  <g>
    <rect x="180" y="105" width="170" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="196" y="125" class="m" font-size="12" font-weight="700" fill="#17151F">WORKER 1</text>
    <rect x="180" y="195" width="170" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="196" y="215" class="m" font-size="12" font-weight="700" fill="#17151F">WORKER 2</text>
    <rect x="180" y="285" width="170" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="196" y="305" class="m" font-size="12" font-weight="700" fill="#17151F">WORKER 3</text>
  </g>
  <g class="f" data-step="1">
    <path d="M200 50 H165 V305" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="4 4" fill="none"/>
    <g stroke="#531A8A" stroke-width="1.4"><line x1="165" y1="125" x2="180" y2="125"/><line x1="165" y1="215" x2="180" y2="215"/><line x1="165" y1="305" x2="180" y2="305"/></g>
    <g class="m" font-size="11" fill="#531A8A"><text class="m" x="196" y="143">split 0</text><text class="m" x="196" y="233">split 1</text><text class="m" x="196" y="323">split 2</text></g>
  </g>
  <g class="f" data-step="2" stroke="#531A8A" stroke-width="2">
    <line x1="140" y1="158" x2="180" y2="158"/><line x1="140" y1="248" x2="180" y2="248"/><line x1="140" y1="338" x2="180" y2="338"/>
  </g>
  <g class="f" data-step="3">
    <g class="m" font-size="11" font-weight="700" fill="#531A8A"><text class="m" x="190" y="163">TEH 370·SHZ 600</text><text class="m" x="190" y="253">TEH 450·ISF 1200</text><text class="m" x="190" y="343">SHZ 980·ISF 300·TEH 100</text></g>
  </g>
  <g class="f" data-step="4">
    <g stroke="#531A8A" stroke-width="1.3" fill="none">
      <line x1="350" y1="134" x2="450" y2="134"/><line x1="350" y1="146" x2="450" y2="226"/>
      <line x1="350" y1="224" x2="450" y2="140"/><line x1="350" y1="236" x2="450" y2="316"/>
      <line x1="350" y1="314" x2="450" y2="232"/><line x1="350" y1="326" x2="450" y2="326"/><line x1="350" y1="320" x2="450" y2="146"/>
    </g>
    <text x="400" y="106" text-anchor="middle" class="m" font-size="11" fill="#531A8A">hash(city)</text>
    <rect x="450" y="105" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="450" y="195" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="450" y="285" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <g class="m" font-size="12" font-weight="700" fill="#17151F"><text class="m" x="466" y="125">TEH</text><text class="m" x="466" y="215">SHZ</text><text class="m" x="466" y="305">ISF</text></g>
    <g class="m" font-size="11" fill="#5C5869"><text class="m" x="466" y="145">370+450+100</text><text class="m" x="466" y="235">600+980</text><text class="m" x="466" y="325">1200+300</text></g>
  </g>
  <g class="f" data-step="5">
    <g class="m" font-size="12" font-weight="700" fill="#531A8A"><text class="m" x="466" y="165">= 920</text><text class="m" x="466" y="255">= 1580</text><text class="m" x="466" y="345">= 1500</text></g>
    <g stroke="#531A8A" stroke-width="1.4"><line x1="600" y1="140" x2="630" y2="184"/><line x1="600" y1="230" x2="630" y2="230"/><line x1="600" y1="320" x2="630" y2="276"/></g>
    <rect x="630" y="160" width="110" height="140" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/>
    <g class="m" font-size="12" fill="#17151F"><text class="m" x="644" y="184" font-weight="700" fill="#8C8899">RESULT</text>
      <text class="m" x="644" y="214">TEH</text><text class="m" x="726" y="214" text-anchor="end">920</text>
      <text class="m" x="644" y="244">SHZ</text><text class="m" x="726" y="244" text-anchor="end">1580</text>
      <text class="m" x="644" y="274">ISF</text><text class="m" x="726" y="274" text-anchor="end">1500</text></g>
    <line x1="685" y1="160" x2="685" y2="66" stroke="#531A8A" stroke-width="2"/><circle cx="685" cy="66" r="3" fill="#531A8A"/>
  </g>
</svg>
<ol class="lx-caps">
  <li>The client sends SQL to the <b>coordinator</b>. The table <b>orders</b> is three Parquet files on object storage.</li>
  <li>The coordinator parses and optimizes the query, asks the <b>catalog</b> which files make up the table, and hands each worker a <b>split</b> (a file or part of one).</li>
  <li>Workers <b>scan their splits in parallel</b>, reading only the <b>city</b> and <b>amount</b> columns and skipping row groups the filters rule out.</li>
  <li>Each worker computes a <b>partial aggregate</b> over its own rows. Three rows become two or three small sums, so far less data moves next.</li>
  <li><b>Exchange</b>: partial results are routed by <b>hash(city)</b>, so every TEH row lands on the same task, every SHZ row on another. This is the shuffle.</li>
  <li>Each task adds up its partial sums into the <b>final aggregate</b>, and the result streams back to the client.</li>
</ol>
{{< /fig >}}

The steps hide the hard parts: a **cost-based optimizer** picks join order and join strategy (broadcast the small table or shuffle both), **pushdown** sends filters and column lists into the connector or file reader, and the **exchange** is where most network traffic, memory pressure and skew problems appear.

## The engines in this section

| Engine | Execution model | Strength | Status in 2026 |
|---|---|---|---|
| [Apache Hive]({{< relref "hive" >}}) | Compiles SQL to Tez DAGs (MapReduce is deprecated) | Batch ETL on Hadoop; the **Hive Metastore** catalog | Hive 4.x is the maintained line. The engine is legacy for new projects; the Metastore is still everywhere. |
| [Spark SQL]({{< relref "sparksql" >}}) | Stages separated by shuffle files; tasks retried on failure | Large ETL, mixing SQL with Python/Scala, ML | Spark 4.0 (2025) is current; the default batch engine of the lakehouse. |
| [Trino]({{< relref "trino" >}}) | MPP, pipelined in memory; optional fault-tolerant mode | Interactive analytics and federation across many sources | Very active; powers Amazon Athena and Starburst. |
| [Presto]({{< relref "presto" >}}) | MPP, pipelined in memory; C++ native workers (Velox) | Interactive analytics at Meta-scale | Active under the Linux Foundation, led by Meta, IBM and Uber. |

Other engines worth knowing: **DuckDB** and **Polars** (single-machine, in-process, often enough for data up to hundreds of GB), **StarRocks** and **Apache Doris** (MPP engines with their own storage that also query lakes), **Dremio**, **Apache DataFusion** (a Rust library many new engines build on), and managed services such as **BigQuery**, **Athena** and **Snowflake**. Apache Drill, once a popular schema-free engine, sees little activity today.

## Choosing

- **Interactive dashboards and ad hoc SQL on the lake** → Trino (or Presto), or a managed variant such as Athena or Starburst.
- **Heavy nightly ETL, joins over huge tables, Python in the same job** → Spark SQL.
- **Data fits on one machine** → DuckDB. Do not run a cluster you do not need.
- **Existing Hive warehouse** → keep the Metastore (or migrate to an Iceberg REST catalog), and move the queries to Spark or Trino.

## Common mistakes

- **Many small files.** Each file is at least one split and one request; a million 100 KB files will be slower than a hundred 1 GB files.
- **No partition or sort strategy,** so every query scans the full table. Partition by date and filter on it.
- **Joining two huge tables without thinking about skew.** One hot key (a single customer with 30 % of orders) makes one task run for an hour while others idle.
- **Using an interactive engine for 6-hour ETL** without enabling its fault-tolerant mode: one worker loss restarts the whole query.

## Learning Resources

- [How Query Engines Work](https://andygrove.io/how-query-engines-work/): Andy Grove's free book, build one step by step
- [CMU 15-445/645 Intro to Database Systems](https://15445.courses.cs.cmu.edu/): query processing and optimization lectures
- [Presto: SQL on Everything](https://trino.io/paper.html) (ICDE 2019): the architecture paper behind Presto and Trino
- [Spark SQL: Relational Data Processing in Spark](https://people.csail.mit.edu/matei/papers/2015/sigmod_spark_sql.pdf) (SIGMOD 2015)
- [Dremel: Interactive Analysis of Web-Scale Datasets](https://research.google/pubs/dremel-interactive-analysis-of-web-scale-datasets-2/): the system behind BigQuery
