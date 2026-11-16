---
weight: 100
title: "Glossary"
description: "A–Z glossary of data engineering terms in plain English, from ACID and CDC to watermarks, each linked to the wiki page that explains it in depth."
---
<div class="lx-kicker-line">$ man data-engineering</div>

# Data Engineering Glossary

Short, plain-English definitions of the terms you will meet most often in data engineering. Each entry links to the page in this wiki that explains it properly. New to the field? Start with the [Introduction]({{< relref "/docs/roadmap/introduction" >}}).

**Jump to:** [A](#a) · [B](#b) · [C](#c) · [D](#d) · [E](#e) · [F](#f) · [H](#h) · [I](#i) · [K](#k) · [L](#l) · [M](#m) · [N](#n) · [O](#o) · [P](#p) · [Q](#q) · [R](#r) · [S](#s) · [T](#t) · [V](#v) · [W](#w)

## A

**ACID**: Four guarantees of a database transaction: Atomicity (all or nothing), Consistency (rules are never broken), Isolation (concurrent transactions don't see each other's half-done work) and Durability (committed data survives a crash). [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/acid" >}})

**Avro**: A compact binary serialization format that stores the schema alongside the data and handles schema changes well. Common in Kafka pipelines. [Read more]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization/avro" >}})

## B

**Backfill**: Re-running a pipeline for past dates, for example after fixing a bug or adding a new column, so historical data is filled in or corrected. [Read more]({{< relref "/docs/roadmap/pipeline-orchestration" >}})

**BASE**: The looser alternative to ACID used by many distributed databases: Basically Available, Soft state, Eventually consistent. The system stays up and replicas agree a little later. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/consistency-vs-eventual-consistency" >}})

**Batch processing**: Processing data in large chunks on a schedule, such as "all of yesterday's orders at 02:00". Simple and efficient, but results are only as fresh as the last run. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}})

## C

**CAP theorem**: When a network partition splits a distributed system, it must choose between Consistency (every read sees the latest write) and Availability (every request gets an answer). [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/cap" >}})

**CDC (change data capture)**: Reading every insert, update and delete from a database's transaction log and streaming those changes to other systems, instead of repeatedly copying whole tables. [Read more]({{< relref "/docs/roadmap/data-integration/cdc" >}})

**Checkpoint**: A saved snapshot of a stream job's progress and state, so it can restart after a failure from where it stopped instead of from the beginning. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}})

**Cluster**: A group of machines (nodes) that work together as one system, such as a Spark, Kafka or Kubernetes cluster. [Read more]({{< relref "/docs/roadmap/container-orchestration/kubernetes" >}})

**Columnar storage**: Storing a table column by column instead of row by row. Analytical queries read only the columns they need, and similar values compress very well. [Read more]({{< relref "/docs/roadmap/databases/noSQL/columnar" >}})

**Consumer group**: A set of consumers that share the work of reading a topic. Each partition is read by exactly one member of the group, so adding consumers adds throughput. [Read more]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}})

## D

**DAG (directed acyclic graph)**: A set of tasks connected by one-way dependencies with no loops. Orchestrators such as Airflow describe pipelines as DAGs. [Read more]({{< relref "/docs/roadmap/pipeline-orchestration" >}})

**Data catalog**: A searchable inventory of datasets with their owners, descriptions, schemas and lineage, so people can find data and know whether to trust it. [Read more]({{< relref "/docs/roadmap/data-governance" >}})

**Data contract**: An agreement between the team producing data and the teams consuming it about schema, meaning and quality, ideally checked automatically on every change. [Read more]({{< relref "/docs/roadmap/data-governance" >}})

**Data governance**: The roles, rules and processes that keep data trusted, findable, secure and used legally: ownership, access control, privacy, quality and lineage. [Read more]({{< relref "/docs/roadmap/data-governance" >}})

**Data lake**: Cheap storage, usually object storage like S3, that holds raw data of any format at any scale. Flexible, but can turn into a "data swamp" without governance. [Read more]({{< relref "/docs/roadmap/data-management-architecture/data-lake" >}})

**Data lakehouse**: A data lake with table formats (Delta Lake, Apache Iceberg, Apache Hudi) that add warehouse features such as transactions, schema enforcement and time travel. [Read more]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}})

**Data mart**: A small, focused slice of the warehouse built for one team or subject, such as sales or finance. [Read more]({{< relref "/docs/roadmap/data-management-architecture/data-mart" >}})

**Data mesh**: An organizational approach where each business domain owns and publishes its data as a product, with a shared self-service platform and federated governance. [Read more]({{< relref "/docs/roadmap/data-management-architecture/data-mesh" >}})

**Data pipeline**: An automated series of steps that moves data from sources to a destination, transforming it along the way. [Read more]({{< relref "/docs/roadmap/data-integration" >}})

**Data quality**: How fit data is for use, usually measured by accuracy, completeness, consistency, timeliness, validity and uniqueness. [Read more]({{< relref "/docs/roadmap/data-governance/data-quality" >}})

**Data warehouse**: A database built for analytics: cleaned, modeled and historical data from many sources in one place, optimized for large read queries. [Read more]({{< relref "/docs/roadmap/data-management-architecture/modern-data-warehouse" >}})

**DataOps**: Applying DevOps practices (version control, automated tests, CI/CD, monitoring) to data pipelines so changes ship quickly without breaking data. [Read more]({{< relref "/docs/roadmap/cicd/dataops" >}})

**DHCP**: The network protocol that automatically gives a device an IP address and other network settings when it joins a network. [Read more]({{< relref "/docs/roadmap/networking/concepts/dhcp" >}})

**Dimension table**: A table of descriptive context, such as customers, products or dates, that fact tables refer to and reports filter and group by. [Read more]({{< relref "/docs/roadmap/data-modeling/star-schema" >}})

## E

**ELT (extract, load, transform)**: Load raw data into the warehouse first, then transform it there with SQL (often dbt). The default pattern for cloud analytics. [Read more]({{< relref "/docs/roadmap/data-integration/elt" >}})

**ETL (extract, transform, load)**: Clean and reshape data in a separate engine before loading only the finished result into the target. [Read more]({{< relref "/docs/roadmap/data-integration/etl" >}})

**Exactly-once**: A delivery guarantee where every message affects the result exactly one time, even if it is retried after a failure. The alternatives are at-most-once and at-least-once. [Read more]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}})

## F

**Fact table**: A table of measurable events, such as orders or payments, with numbers (amount, quantity) and keys pointing to dimension tables. [Read more]({{< relref "/docs/roadmap/data-modeling/star-schema" >}})

## H

**Horizontal scaling (scale out)**: Adding more machines to share the load. It can grow almost without limit, but brings distributed-system problems. Compare vertical scaling. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}})

## I

**Idempotency**: Running an operation twice gives the same result as running it once. Idempotent pipelines can be safely retried and backfilled without creating duplicates. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/transaction" >}})

**Ingestion**: Getting data from source systems into your platform, in batches or as a continuous stream. [Read more]({{< relref "/docs/roadmap/data-integration" >}})

**IP address**: A number that identifies a device on a network, such as `192.168.1.10` (IPv4), so packets can be routed to it. [Read more]({{< relref "/docs/roadmap/networking/concepts/ip-addressing" >}})

## K

**Kappa architecture**: Process everything as a stream: one code path, and reprocessing is done by replaying the event log from the start. [Read more]({{< relref "/docs/roadmap/data-architecture/kappa" >}})

## L

**Lambda architecture**: Process the same data twice, in a batch layer for accuracy and a speed layer for freshness, then merge the results at query time. [Read more]({{< relref "/docs/roadmap/data-architecture/lambda" >}})

**Lineage**: A map of where data came from and what it flows into, column by column or table by table, so you can trace a wrong number back to its source and see what a change will break. [Read more]({{< relref "/docs/roadmap/data-governance" >}})

## M

**Message broker**: A system that receives messages from producers and delivers them to consumers, so the two sides don't need to talk directly. RabbitMQ and Kafka are examples. [Read more]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}})

**Metadata**: Data about data: schemas, owners, row counts, update times, descriptions and tags. [Read more]({{< relref "/docs/roadmap/data-governance" >}})

## N

**Normalization**: Splitting data into related tables so each fact is stored only once, avoiding update errors. Denormalization does the opposite to make reads faster. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/normalization-or-denormalization" >}})

**NoSQL**: Databases that don't use the relational table model: key-value, document, wide-column, graph and others, usually built to scale out. [Read more]({{< relref "/docs/roadmap/databases/noSQL" >}})

## O

**Offset**: The position of a message in a partition of a log such as Kafka. Consumers store their offset to remember how far they have read. [Read more]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}})

**OLAP / OLTP**: OLTP (online transaction processing) systems handle many small reads and writes, like an app's database. OLAP (online analytical processing) systems run large queries over history, like a warehouse. [Read more]({{< relref "/docs/roadmap/databases" >}})

**Orchestration**: Scheduling pipeline tasks, running them in the right order, retrying failures and alerting when something breaks. [Read more]({{< relref "/docs/roadmap/pipeline-orchestration" >}})

## P

**Parquet**: An open columnar file format for analytics. It compresses well and lets query engines skip columns and row groups they don't need. [Read more]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/parquet" >}})

**Partitioning**: Splitting a large table or topic into parts by a key, such as date, so queries and consumers touch only the parts they need. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}})

## Q

**Query engine**: Software that runs SQL over data stored elsewhere, such as files in a lake, without owning the storage. Trino, Presto and Spark SQL are examples. [Read more]({{< relref "/docs/roadmap/query-engine" >}})

## R

**Replication**: Keeping copies of the same data on several machines so the system survives failures and can serve more reads. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/replication" >}})

**Retention**: How long data is kept before it is deleted or archived, for example "Kafka keeps events for 7 days" or "raw logs are deleted after one year". [Read more]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}})

**Reverse ETL**: Copying modeled data from the warehouse back into operational tools such as a CRM or ad platform, so business teams can act on it. [Read more]({{< relref "/docs/roadmap/data-integration/reverse-etl" >}})

## S

**SCD (slowly changing dimension)**: Techniques for handling dimension values that change over time, such as a customer moving city. Type 1 overwrites; Type 2 keeps history with a new row per version. [Read more]({{< relref "/docs/roadmap/data-modeling" >}})

**Schema**: The structure of data: field names, types and constraints. Schema-on-write checks it when data is stored; schema-on-read applies it when data is queried. [Read more]({{< relref "/docs/roadmap/data-modeling" >}})

**Serialization**: Turning in-memory objects into bytes for storage or sending over a network, and back again. JSON, Avro and Protobuf are serialization formats. [Read more]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization" >}})

**Sharding**: Splitting one dataset across several machines by a key, so each machine holds and serves only part of the data. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}})

**Snowflake schema**: A star schema whose dimension tables are further normalized into sub-dimensions, for example product → category. [Read more]({{< relref "/docs/roadmap/data-modeling/snowflake" >}})

**Star schema**: A central fact table surrounded by denormalized dimension tables. The most common model for analytics. [Read more]({{< relref "/docs/roadmap/data-modeling/star-schema" >}})

**Stream processing**: Processing each event continuously as it arrives, so results are seconds old instead of hours. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}})

## T

**Topic**: A named stream of messages in a platform like Kafka, such as `orders`, split into partitions. Producers write to it and consumers read from it. [Read more]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}})

**Transformation**: Changing data to make it useful: cleaning, deduplicating, joining, aggregating and applying business rules. [Read more]({{< relref "/docs/roadmap/data-processing" >}})

## V

**Vertical scaling (scale up)**: Giving one machine more CPU, memory or disk. Simple, but limited by the biggest machine you can buy. Compare horizontal scaling. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}})

## W

**Watermark**: In stream processing, a moving estimate of "we have probably seen all events up to time T", used to decide when a time window is complete and how to handle late events. [Read more]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}})
