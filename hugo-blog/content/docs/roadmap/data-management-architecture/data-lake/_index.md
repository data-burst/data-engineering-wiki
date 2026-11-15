---
weight: 2
title: Data Lake
description: "What a data lake is: raw files on object storage, schema-on-read, raw/clean/curated zones, catalogs, lake vs warehouse, and how to avoid a data swamp."
---
<div class="lx-kicker-line">$ aws s3 ls s3://lake/raw/</div>

# Data Lake

A **data lake** is a central store that keeps data of any type (database extracts, JSON events, CSV files, logs, images) as **files on cheap, scalable storage**, usually object storage such as Amazon S3, Azure Data Lake Storage (ADLS) or Google Cloud Storage. Data is loaded first in its raw form and given a structure only when it is read (**schema-on-read**). That makes ingestion fast and flexible, and makes the lake the natural home for machine learning and large-scale processing.

## How data flows through a lake

{{< fig kicker="$ ingest --to s3://lake" title="Sources, zones and the catalog that holds it together" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 320">
  <g class="m" font-size="11.5">
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4">
      <rect x="20" y="44" width="120" height="44" rx="6"/><rect x="20" y="104" width="120" height="44" rx="6"/>
      <rect x="20" y="164" width="120" height="44" rx="6"/><rect x="20" y="224" width="120" height="44" rx="6"/></g>
    <g fill="#17151F" font-weight="700" text-anchor="middle">
      <text class="m" x="80" y="64">APP DB</text><text class="m" x="80" y="124">CLICKSTREAM</text><text class="m" x="80" y="184">PARTNER</text><text class="m" x="80" y="244">IMAGES</text></g>
    <g fill="#8C8899" text-anchor="middle" font-size="11">
      <text class="m" x="80" y="80">orders</text><text class="m" x="80" y="140">events</text><text class="m" x="80" y="200">CSV drop</text><text class="m" x="80" y="260">product photos</text></g>
    <rect x="160" y="20" width="455" height="285" rx="10" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.5"/>
    <text class="m" x="176" y="40" font-size="11" font-weight="700" fill="#8C8899">OBJECT STORAGE · s3://lake</text>
  </g>
  <g class="f m" data-step="1" font-size="11">
    <g stroke="#3D3A49" stroke-width="1.4"><line x1="140" y1="66" x2="174" y2="90"/><line x1="140" y1="126" x2="174" y2="126"/>
      <line x1="140" y1="186" x2="174" y2="162"/><line x1="140" y1="246" x2="174" y2="198"/></g>
    <rect x="174" y="52" width="136" height="180" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="188" y="72" font-size="12" font-weight="700" fill="#17151F">RAW · bronze</text>
    <g fill="#5C5869"><text class="m" x="188" y="94">orders/*.json</text><text class="m" x="188" y="130">clicks/*.json.gz</text>
      <text class="m" x="188" y="166">partner/*.csv</text><text class="m" x="188" y="202">img/*.jpg</text></g>
    <text class="m" x="188" y="224" fill="#8C8899">as received</text>
  </g>
  <g class="f m" data-step="2" font-size="11">
    <rect x="174" y="246" width="426" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="188" y="266" font-size="12" font-weight="700" fill="#531A8A">CATALOG</text>
    <text class="m" x="188" y="281" fill="#3D3A49">tables, schemas, locations, owners · Glue, Unity, Polaris</text>
  </g>
  <g class="f m" data-step="3" font-size="11">
    <line x1="310" y1="140" x2="320" y2="140" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="320" y="52" width="136" height="180" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="334" y="72" font-size="12" font-weight="700" fill="#17151F">CLEAN · silver</text>
    <g fill="#5C5869"><text class="m" x="334" y="94">orders</text><text class="m" x="334" y="108" fill="#8C8899">typed, deduped</text>
      <text class="m" x="334" y="130">clicks</text><text class="m" x="334" y="144" fill="#8C8899">sessionized</text>
      <text class="m" x="334" y="166">partner_prices</text><text class="m" x="334" y="224" fill="#8C8899">Parquet / Iceberg</text></g>
  </g>
  <g class="f m" data-step="4" font-size="11">
    <line x1="456" y1="140" x2="466" y2="140" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="466" y="52" width="134" height="180" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="480" y="72" font-size="12" font-weight="700" fill="#531A8A">CURATED · gold</text>
    <g fill="#3D3A49"><text class="m" x="480" y="94">fct_orders</text><text class="m" x="480" y="114">dim_customer</text>
      <text class="m" x="480" y="134">daily_revenue</text><text class="m" x="480" y="154">churn_features</text></g>
    <g stroke="#3D3A49" stroke-width="1.4"><line x1="600" y1="100" x2="636" y2="80"/><line x1="600" y1="140" x2="636" y2="146"/><line x1="600" y1="180" x2="636" y2="212"/></g>
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4"><rect x="636" y="58" width="104" height="44" rx="6"/><rect x="636" y="124" width="104" height="44" rx="6"/><rect x="636" y="190" width="104" height="44" rx="6"/></g>
    <g fill="#17151F" font-weight="700" text-anchor="middle" font-size="11.5"><text class="m" x="688" y="85">BI</text><text class="m" x="688" y="151">ML</text><text class="m" x="688" y="217">SQL / Trino</text></g>
  </g>
</svg>
<ol class="lx-caps">
  <li>Sources of every shape: database extracts, event streams, partner files, images. A warehouse would only take the first one easily.</li>
  <li>Everything lands in the <b>raw zone</b> exactly as received. Loading is cheap and never fails on schema, and you can always reprocess from here.</li>
  <li>A <b>catalog</b> records what each dataset is, its schema, location and owner. Without it, the lake becomes a <b>data swamp</b> nobody can navigate.</li>
  <li>Jobs (Spark, dbt, Flink) produce the <b>clean zone</b>: typed, deduplicated, columnar files.</li>
  <li>The <b>curated zone</b> holds business-ready tables for BI, ML and SQL engines. Bronze, silver and gold is the "medallion" naming popularized by Databricks.</li>
</ol>
{{< /fig >}}

## Data lake vs data warehouse

| | Data lake | Relational data warehouse |
|---|---|---|
| Data types | Any: structured, semi-structured, unstructured | Structured tables |
| Schema | On read | On write |
| Storage | Open files (Parquet, JSON, CSV, images) on object storage | Database-managed, often proprietary |
| Cost per TB | Very low | Higher |
| Transactions, updates | Not on plain files | Yes |
| Typical users | Data engineers, data scientists | Analysts, BI users |
| Typical engines | Spark, Trino, Flink, DuckDB | The warehouse's own SQL engine |

## The building blocks

- **Storage**: object storage. HDFS was the original lake storage in the Hadoop era and is now mostly legacy.
- **Ingestion**: batch loads, [CDC]({{< relref "/docs/roadmap/data-integration/cdc" >}}) from databases, streams from Kafka. Tools such as Airbyte, Fivetran, Kafka Connect and Spark.
- **File formats**: land raw data as received, but store clean data as columnar [Parquet]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/parquet" >}}), partitioned by something queries filter on (often a date).
- **Catalog**: AWS Glue Data Catalog, Hive Metastore, Unity Catalog, Apache Polaris or another Iceberg REST catalog.
- **Processing and query**: Spark, Flink, [Trino]({{< relref "/docs/roadmap/query-engine/trino" >}}), DuckDB.

## Why plain lakes struggle

A lake of plain files has no transactions. Two jobs writing the same folder can corrupt it, readers can see half-written data, updating one customer means rewriting files by hand, and there is no reliable way to roll back a bad load. Thousands of tiny files also make queries slow. Table formats (Apache Iceberg, Delta Lake, Apache Hudi) fix these problems and turn the lake into a [lakehouse]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}}). In 2026 most new lakes use a table format from day one.

## Common mistakes

- **No catalog or ownership**: files pile up with unknown meaning. This is the data swamp.
- **Small files**: streaming jobs writing a file per second. Compact to 100 MB to 1 GB files.
- **Over-partitioning**: partitioning by user ID creates millions of folders. Partition by low-cardinality columns such as date.
- **Storing personal data raw and forever** with no retention or deletion process, which breaks GDPR-style deletion requests.
- **Skipping access control** because "it's just files". Use catalog-level permissions, not bucket-wide keys.

## Learning Resources

### Books
- [The Enterprise Big Data Lake](https://www.oreilly.com/library/view/the-enterprise-big/9781491931547/): Alex Gorelik
- [Deciphering Data Architectures](https://www.oreilly.com/library/view/deciphering-data-architectures/9781098150754/): James Serra

### Articles
- [Martin Fowler: Data Lake](https://martinfowler.com/bliki/DataLake.html)
- [Databricks: Medallion architecture](https://www.databricks.com/glossary/medallion-architecture)
- [AWS: What is a data lake?](https://aws.amazon.com/what-is/data-lake/)
- [Google Cloud: What is a data lake?](https://cloud.google.com/learn/what-is-a-data-lake)

### Videos
- [What is a Data Lake?](https://www.youtube.com/watch?v=LxcH6z8TFpI)
- [Data Lake vs Data Warehouse](https://www.youtube.com/watch?v=AwbKwcw7bgg)
