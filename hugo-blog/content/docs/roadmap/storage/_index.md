---
title: "Storage"
description: "Block, file and object storage compared: how each addresses data, typical latency and cost, and why data lakes are built on object storage like S3."
bookCollapseSection: true
weight: 15
---

# Storage

Every database, file and data lake ends up on some kind of **storage**, and there are three ways to address it. **Block storage** exposes a raw disk of numbered blocks that the operating system formats with a file system. **File storage** exposes named files in folders over a network protocol (NFS, SMB). **Object storage** exposes whole objects (a file plus metadata) by key over HTTP, as Amazon S3 does. The interface decides what each one is good at.

<div class="lx-cards">
  <div class="lx-card"><div class="lab">Block · EBS, Ceph RBD, SAN</div><h4>"Write 4 KB at block 1,040"</h4><p>A raw disk attached to one machine. Lowest latency, in-place updates. Where databases and VM disks live.</p></div>
  <div class="lx-card"><div class="lab">File · NFS, SMB, EFS</div><h4>"Open /reports/q3.csv"</h4><p>A shared file system with folders, permissions and locks, mounted by many machines at once.</p></div>
  <div class="lx-card"><div class="lab">Object · S3, GCS, Azure Blob</div><h4>"GET bucket/key"</h4><p>Whole objects over HTTP in a flat namespace. Practically unlimited scale and the cheapest per GB. The base of every data lake.</p></div>
</div>

## Side by side

| | Block | File | Object |
|---|---|---|---|
| Unit | Fixed-size block (4 KiB typical) | File in a directory tree | Object (bytes + metadata) under a key |
| Access | OS block device (NVMe, iSCSI) plus a local file system | NFS / SMB mount | HTTP API (`PUT`, `GET`, `LIST`, `DELETE`) |
| Update | In place, any byte range | In place | Replace the whole object (no partial overwrite) |
| Shared by | Usually one machine at a time | Many machines | Any number of clients, anywhere |
| Latency | Sub-millisecond | Around a millisecond and up | Tens of milliseconds to first byte |
| Scale | One volume up to tens of TB | Up to petabytes, with care | Exabytes; no capacity planning |
| Cost (cloud, rough) | Higher; you pay for provisioned size | Highest per GB | Lowest per GB; pay for what you store plus requests |
| Typical use | Databases, VM boot disks, Kafka logs | Shared home dirs, legacy apps, ML training data | Data lakes, backups, logs, media, Parquet/Iceberg tables |

## What this means for data engineers

- **Operational databases** (PostgreSQL, Kafka brokers) run on **block storage**, because they update pages in place and fsync often.
- **Analytical data** lives on **object storage** as Parquet or ORC files, organized by table formats such as Iceberg or Delta Lake. Compute engines (Spark, Trino, Snowflake) read it over the network; storage and compute scale and bill separately. See [Data Lake]({{< relref "/docs/roadmap/data-management-architecture/data-lake" >}}) and [Data Lakehouse]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}}).
- **HDFS**, the Hadoop Distributed File System, is a distributed file system that most new platforms have replaced with object storage.

## Pages in this section

- [Block Storage]({{< relref "block-storage" >}}): how a write travels from your application through the file system to a network volume, and when to use EBS, Ceph RBD or local NVMe.
- [Object Storage]({{< relref "object-storage" >}}): what happens on a `PUT` and a `GET` to S3, consistency, multipart uploads, and why object stores fit data lakes.

## Learning Resources

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: storage and retrieval chapter
- [AWS: Block vs file vs object storage](https://aws.amazon.com/compare/the-difference-between-block-file-object-storage/)
- [Data Storage Types: File, Block and Object](https://www.youtube.com/watch?v=KhHr4chx_ZM): video
- [AWS Storage: EBS vs. S3 vs. EFS](https://www.youtube.com/watch?v=_CN7KqC3y3s): video
