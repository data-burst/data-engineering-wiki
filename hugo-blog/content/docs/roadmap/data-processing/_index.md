---
weight: 19
title: "Data Processing"
description: "How distributed data processing works, animated: split, map, shuffle and reduce, plus how Spark, Flink, Beam, dbt and DuckDB fit batch and streaming workloads."
bookToC: false
---
<div class="lx-kicker-line">$ spark-submit count_orders_by_city.py</div>

# Data Processing

**Data processing** is the step where raw data becomes something useful: filtered, cleaned, joined, aggregated and written somewhere else. When the data fits on one machine, a SQL query or a Python script is enough. When it doesn't, or when it never stops arriving, you need an engine that splits the work across many cores or machines and survives one of them dying halfway through.

Almost every distributed engine, from Google's MapReduce (2004) and Hadoop to Apache Spark and Flink today, follows the same shape: **split the input, process the pieces in parallel, shuffle by key, combine the results.**

## Split, map, shuffle, reduce

{{< fig kicker="$ SELECT city, COUNT(*) FROM orders GROUP BY city" title="Counting orders per city on three machines" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <defs><marker id="dp-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g class="m" font-size="11" fill="#8C8899"><text x="20" y="26">INPUT</text><text x="200" y="26">MAP</text><text x="390" y="26" text-anchor="middle">SHUFFLE</text><text x="452" y="26">REDUCE</text><text x="636" y="26">OUTPUT</text></g>
  <g class="m">
    <rect x="20" y="40" width="140" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="64" font-size="12" font-weight="600" fill="#17151F">SPLIT 1</text><text x="34" y="90" font-size="11.5" fill="#3D3A49">NYC NYC TOR</text>
    <rect x="20" y="130" width="140" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="154" font-size="12" font-weight="600" fill="#17151F">SPLIT 2</text><text x="34" y="180" font-size="11.5" fill="#3D3A49">NYC CHI TOR</text>
    <rect x="20" y="220" width="140" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="244" font-size="12" font-weight="600" fill="#17151F">SPLIT 3</text><text x="34" y="270" font-size="11.5" fill="#3D3A49">NYC NYC TOR</text>
  </g>
  <g class="f m" data-step="1">
    <line x1="160" y1="75" x2="194" y2="75" stroke="#531A8A" stroke-width="1.4" marker-end="url(#dp-ar)"/>
    <line x1="160" y1="165" x2="194" y2="165" stroke="#531A8A" stroke-width="1.4" marker-end="url(#dp-ar)"/>
    <line x1="160" y1="255" x2="194" y2="255" stroke="#531A8A" stroke-width="1.4" marker-end="url(#dp-ar)"/>
    <rect x="200" y="40" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="214" y="64" font-size="12" font-weight="600" fill="#17151F">MAP 1</text><text x="214" y="90" font-size="11.5" fill="#531A8A">NYC:2 TOR:1</text>
    <rect x="200" y="130" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="214" y="154" font-size="12" font-weight="600" fill="#17151F">MAP 2</text><text x="214" y="180" font-size="11.5" fill="#531A8A">NYC:1 CHI:1 TOR:1</text>
    <rect x="200" y="220" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="214" y="244" font-size="12" font-weight="600" fill="#17151F">MAP 3</text><text x="214" y="270" font-size="11.5" fill="#531A8A">NYC:2 TOR:1</text>
  </g>
  <g class="f m" data-step="2">
    <g stroke="#531A8A" stroke-width="1.2" fill="none" marker-end="url(#dp-ar)">
      <line x1="350" y1="70" x2="446" y2="90"/><line x1="350" y1="160" x2="446" y2="100"/><line x1="350" y1="250" x2="446" y2="110"/>
    </g>
    <g stroke="#8C8899" stroke-width="1.2" fill="none" stroke-dasharray="4 3" marker-end="url(#dp-ar)">
      <line x1="350" y1="84" x2="446" y2="216"/><line x1="350" y1="174" x2="446" y2="226"/><line x1="350" y1="264" x2="446" y2="236"/>
    </g>
    <rect x="452" y="60" width="150" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="466" y="84" font-size="12" font-weight="600" fill="#17151F">REDUCE 1</text><text x="466" y="104" font-size="11" fill="#5C5869">key NYC</text>
    <rect x="452" y="186" width="150" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="466" y="210" font-size="12" font-weight="600" fill="#17151F">REDUCE 2</text><text x="466" y="230" font-size="11" fill="#5C5869">keys TOR, CHI</text>
  </g>
  <g class="f m" data-step="3">
    <text x="466" y="128" font-size="11.5" fill="#531A8A">2+1+2 = 5</text>
    <text x="466" y="254" font-size="11.5" fill="#531A8A">TOR 3 · CHI 1</text>
    <line x1="602" y1="100" x2="630" y2="150" stroke="#531A8A" stroke-width="1.4" marker-end="url(#dp-ar)"/>
    <line x1="602" y1="226" x2="630" y2="190" stroke="#531A8A" stroke-width="1.4" marker-end="url(#dp-ar)"/>
    <rect x="636" y="120" width="104" height="96" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/>
    <g font-size="12" fill="#17151F"><text x="650" y="148">NYC  5</text><text x="650" y="172">TOR  3</text><text x="650" y="196">CHI  1</text></g>
  </g>
  <g class="f m" data-step="4">
    <rect x="196" y="126" width="158" height="78" rx="8" fill="#fff" stroke="#C2382F" stroke-width="1.6" stroke-dasharray="5 4"/>
    <text x="275" y="160" text-anchor="middle" font-size="12" font-weight="600" fill="#C2382F">MAP 2 · NODE DIED</text>
    <text x="275" y="180" text-anchor="middle" font-size="11" fill="#3D3A49">re-run split 2 only</text>
    <text x="20" y="316" font-size="11" fill="#5C5869">Other tasks keep their results. Only the lost task is re-run on another node.</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The input (a folder of Parquet files, a Kafka topic) is cut into <b>splits</b>, and each machine gets some of them.</li>
  <li><b>Map</b>: each task reads its split and emits <b>(city, count)</b> pairs. It pre-aggregates locally, so it sends NYC:2, not NYC:1 twice.</li>
  <li><b>Shuffle</b>: pairs are routed by <b>hash of the key</b>, so every NYC goes to reducer 1. This is the expensive step: data crosses the network and often hits disk.</li>
  <li><b>Reduce</b>: each reducer combines the values for its keys and writes the result.</li>
  <li>A machine dies. The engine knows which split that task read, so it <b>re-runs only that task</b> elsewhere. This is how a 1,000-node job survives failures.</li>
</ol>
{{< /fig >}}

Spark calls the parts between shuffles **stages** and plans them from your SQL or DataFrame code. Flink does the same continuously: a keyed stream is a never-ending shuffle, and reducers keep running totals in **state**.

## Batch, streaming and in between

- **Batch**: process a bounded dataset (yesterday's orders) and finish. Simple, cheap, easy to re-run.
- **Streaming**: process an unbounded stream event by event and keep results up to date. Fresh, but needs state, checkpoints and handling of late data.
- **Micro-batch**: small batches every few seconds (Spark Structured Streaming).

See [Batch and Stream Processing]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}}) for a side-by-side simulation.

## Engines in 2026

| Engine | Type | Best at |
|---|---|---|
| [Apache Spark](https://spark.apache.org/) | Batch + micro-batch streaming | Large ETL, lakehouse jobs, ML prep. SQL, Python, Scala. Spark 4 (2025) added a VARIANT type for semi-structured data and a native XML reader. |
| [Apache Flink](https://flink.apache.org/) | Streaming first (batch too) | Low-latency stateful streaming, event time, exactly-once state |
| [Apache Beam](https://beam.apache.org/) | Unified API | Write once, run on Dataflow, Flink or Spark |
| [Kafka Streams](https://kafka.apache.org/documentation/streams/) | Streaming library | Stream processing inside a Java service, no separate cluster |
| Warehouse SQL + [dbt](https://docs.getdbt.com/) | Batch (ELT) | Transformations where the data already lives: Snowflake, BigQuery, Databricks SQL, ClickHouse |
| [DuckDB](https://duckdb.org/), [Polars](https://pola.rs/) | Single-node, vectorized | Anything up to hundreds of GB on one machine, fast and cheap |
| [Ray](https://www.ray.io/), [Dask](https://www.dask.org/) | Python-native distributed | ML pipelines and Python workloads that outgrow one machine |
| RisingWave, Materialize | Streaming SQL databases | Continuously updated SQL views over streams |

What this table leaves out on purpose: **Kafka** itself moves data but doesn't process it (see [Messaging and Streaming Platforms]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}})); **Apache Arrow** is an in-memory columnar format that many of these engines use internally; **Hadoop MapReduce, Storm and Samza** are legacy and rarely chosen for new work.

## How to choose

1. **Does it fit on one machine?** Data under a few hundred GB: try DuckDB or Polars first. It's often faster than a cluster and costs nothing to run.
2. **Is the data already in a warehouse?** Transform it there with SQL and dbt.
3. **Does it need results in seconds?** Use Flink, Kafka Streams or a streaming database.
4. **Otherwise**, large-scale batch on files: Spark.

## Common mistakes

- **Data skew.** One key (a huge customer, `city = NULL`) sends most rows to one reducer, and the whole job waits for it. Salt the key or handle the hot key separately.
- **Too many shuffles.** Every `JOIN`, `GROUP BY` and `DISTINCT` on a new key is a shuffle. Filter and project early; broadcast small tables in joins.
- **The small-files problem.** Thousands of tiny output files make every later read slow. Compact or repartition before writing.
- **Row-by-row Python UDFs** in Spark. Use built-in functions or vectorized (Arrow-based) UDFs.
- **Reaching for a cluster too early.** Distributed systems add cost and failure modes. Scale out when one machine really isn't enough.

## Learning Resources

### Papers
- [MapReduce: Simplified Data Processing on Large Clusters](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/): Dean and Ghemawat, 2004
- [Resilient Distributed Datasets](https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/zaharia): the paper behind Spark
- [The Dataflow Model](https://research.google/pubs/the-dataflow-model-a-practical-approach-to-balancing-correctness-latency-and-cost-in-massive-scale-unbounded-out-of-order-data-processing/): the ideas behind Beam and Flink

### Books
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/), Chapters 10 and 11: Martin Kleppmann
- [Learning Spark, 2nd Edition](https://www.oreilly.com/library/view/learning-spark-2nd/9781492050032/)
- [Streaming Systems](https://www.oreilly.com/library/view/streaming-systems/9781491983867/): Akidau, Chernyak and Lax

### Docs and courses
- [Spark SQL, DataFrames and Datasets guide](https://spark.apache.org/docs/latest/sql-programming-guide.html)
- [Flink: Learn Flink](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/overview/)
- [DuckDB documentation](https://duckdb.org/docs/)
- [PySpark Tutorial](https://www.youtube.com/watch?v=_C8kWso4ne4)
