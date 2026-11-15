---
title: "Object Storage"
description: "How object storage like Amazon S3 works, animated: a PUT and a GET, keys and metadata, consistency, multipart uploads, and why data lakes use it."
weight: 2
bookToC: false
---
<div class="lx-kicker-line">$ aws s3 cp part-0.parquet s3://lake/orders/dt=2026-11-16/</div>

# Object Storage

**Object storage** keeps data as **objects**: a blob of bytes plus metadata, stored under a **key** inside a **bucket**, and accessed over HTTP with a handful of verbs (`PUT`, `GET`, `HEAD`, `LIST`, `DELETE`). There are no real folders, no file handles and no in-place edits: you write a whole object and read it back, optionally just a byte range. In exchange you get storage that scales to exabytes, is replicated across data centers automatically, and costs a few cents per GB per month. **Amazon S3** defined the model and its API is the de facto standard; Google Cloud Storage, Azure Blob Storage, Cloudflare R2, Ceph and MinIO all follow it.

## What happens on a PUT and a GET

{{< fig kicker="$ PUT s3://lake/orders/part-0.parquet" title="Writing and reading one object" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <g>
    <rect x="20" y="130" width="130" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="85" y="156" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#17151F">CLIENT</text>
    <text x="85" y="174" text-anchor="middle" font-size="11" fill="#5C5869">Spark, boto3</text>
    <rect x="220" y="130" width="140" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="290" y="156" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#17151F">API FRONT END</text>
    <text x="290" y="174" text-anchor="middle" font-size="11" fill="#5C5869">auth, routing</text>
    <rect x="430" y="30" width="310" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="446" y="54" class="m" font-size="12" font-weight="700" fill="#17151F">METADATA INDEX</text>
    <text x="446" y="72" font-size="11" fill="#5C5869">key → size, ETag, where the bytes are</text>
    <g class="m" font-size="11" fill="#17151F">
      <rect x="430" y="230" width="90" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="475" y="252" text-anchor="middle">NODE</text><text class="m" x="475" y="282" text-anchor="middle" fill="#8C8899">zone a</text>
      <rect x="540" y="230" width="90" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="585" y="252" text-anchor="middle">NODE</text><text class="m" x="585" y="282" text-anchor="middle" fill="#8C8899">zone b</text>
      <rect x="650" y="230" width="90" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="695" y="252" text-anchor="middle">NODE</text><text class="m" x="695" y="282" text-anchor="middle" fill="#8C8899">zone c</text>
    </g>
  </g>
  <g class="f" data-step="1">
    <text x="20" y="116" class="m" font-size="11" fill="#531A8A">PUT lake/orders/part-0.parquet</text>
    <line x1="150" y1="148" x2="218" y2="148" stroke="#531A8A" stroke-width="2"/>
    <circle cx="218" cy="148" r="3" fill="#531A8A"/>
  </g>
  <g class="f" data-step="2">
    <g stroke="#531A8A" stroke-width="1.4" fill="none"><path d="M360 176 L475 228"/><path d="M360 182 L585 228"/><path d="M360 188 L695 228"/></g>
    <g fill="#531A8A"><rect x="459" y="260" width="10" height="10" rx="2"/><rect x="473" y="260" width="10" height="10" rx="2"/>
      <rect x="569" y="260" width="10" height="10" rx="2"/><rect x="583" y="260" width="10" height="10" rx="2"/>
      <rect x="679" y="260" width="10" height="10" rx="2"/><rect x="693" y="260" width="10" height="10" rx="2"/></g>
  </g>
  <g class="f" data-step="3">
    <path d="M360 140 L430 80" stroke="#531A8A" stroke-width="1.4" fill="none"/>
    <text x="446" y="91" class="m" font-size="11" fill="#531A8A">orders/part-0.parquet → a, b, c</text>
    <line x1="220" y1="182" x2="152" y2="182" stroke="#3D3A49" stroke-width="1.4"/>
    <circle cx="152" cy="182" r="3" fill="#3D3A49"/>
    <text x="20" y="210" class="m" font-size="11" fill="#17151F">200 OK · ETag "9b2f…"</text>
  </g>
  <g class="f" data-step="4">
    <text x="20" y="234" class="m" font-size="11" fill="#531A8A">GET part-0.parquet</text>
    <text x="20" y="250" class="m" font-size="11" fill="#531A8A">Range: last 64 KiB (footer)</text>
  </g>
  <g class="f" data-step="5">
    <rect x="20" y="268" width="380" height="54" rx="6" fill="#260246"/>
    <text x="36" y="290" class="m" font-size="12" fill="#EEEAF5">change 1 row → PUT a whole new object</text>
    <text x="36" y="310" font-size="11" fill="#DCC9EE">no in-place edit; versioning keeps the old one</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>An object store is a fleet: stateless <b>front ends</b> speaking HTTP, a <b>metadata index</b> mapping keys to locations, and many <b>storage nodes</b> across zones.</li>
  <li>The client sends <b>PUT</b> with the key, the bytes and headers (content type, custom metadata), signed with its credentials.</li>
  <li>The bytes are split into shards with <b>erasure coding</b> (or plain copies) and spread over nodes in several <b>availability zones</b>, so losing a disk or a zone loses nothing.</li>
  <li>Only after the data is durable is the key written to the <b>index</b>. The client gets <b>200 OK</b> and an <b>ETag</b>. Any later GET or LIST sees the new object.</li>
  <li>A reader sends <b>GET</b>, often with a <b>Range</b> header. Parquet readers fetch the footer first, then only the column chunks they need.</li>
  <li>Objects are <b>immutable</b>: to change one row you write a new object. That is why lakes use table formats (Iceberg, Delta) that add files and swap metadata instead of editing.</li>
</ol>
{{< /fig >}}

## Key properties

- **Flat namespace.** `orders/dt=2026-11-16/part-0.parquet` is one key; the slashes only look like folders. "Listing a folder" is a prefix query, and renaming a "folder" means copying every object. This is why Hadoop-era tricks that relied on cheap directory renames do not work on S3.
- **Strong consistency.** Since December 2020, S3 gives strong read-after-write consistency for PUTs, overwrites, deletes and LIST. GCS and Azure Blob are also strongly consistent. Older blog posts about eventual consistency (and tools like S3Guard) are outdated.
- **Conditional writes.** S3 supports `If-None-Match` (2024) and `If-Match` on PUT, so writers can create-if-absent or compare-and-swap. Table formats and lakehouse catalogs use this to commit safely.
- **Multipart upload.** Large objects are uploaded in parts (5 MiB to 5 GiB each, up to 10,000 parts) in parallel, then completed in one call. Failed uploads leave invisible parts that still cost money; add a lifecycle rule to abort them.
- **Durability and availability.** S3 Standard is designed for 99.999999999 % (11 nines) durability and 99.99 % availability.
- **Storage classes and lifecycle.** Move cold data automatically to cheaper tiers (S3 Standard-IA, Glacier, GCS Coldline/Archive), trading lower storage price for retrieval fees and delay.
- **Request costs and limits.** You pay per request as well as per GB. S3 handles at least 3,500 writes and 5,500 reads per second **per prefix**; spread hot data over prefixes.

## Popular object stores

| Store | Type | Notes |
|---|---|---|
| **[Amazon S3](https://aws.amazon.com/s3/)** | Managed | The reference API. Also S3 Express One Zone (single-zone, single-digit ms latency) and S3 Tables (managed Iceberg tables, 2024). |
| **[Google Cloud Storage](https://cloud.google.com/storage)** | Managed | Regional, dual-region and multi-region buckets. |
| **[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)** | Managed | With hierarchical namespace enabled (ADLS Gen2) it supports real directories and atomic renames. |
| **[Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)** | Managed | S3-compatible with no egress fees. |
| **[Ceph RGW](https://docs.ceph.com/en/latest/radosgw/)** | Self-hosted | S3 and Swift API on top of Ceph's RADOS cluster, which also serves block and file storage. |
| **[MinIO](https://min.io/)** | Self-hosted | Popular S3-compatible server. In 2025 MinIO removed most of the admin console from its community edition and stopped publishing free binaries; check the current licensing before adopting it. Alternatives include Ceph RGW, SeaweedFS and Garage. |

## Why data lakes live on object storage

1. **Separate storage from compute.** Keep one copy of the data; start and stop Spark, Trino or DuckDB clusters as needed.
2. **Cheap and unlimited.** No volumes to resize, no disks to replace.
3. **Open formats.** Parquet files plus an Iceberg or Delta table on S3 can be read by many engines.

The costs: higher latency per request, no in-place updates, and many small files hurt badly. Aim for objects of 100 MB to 1 GB for analytics. See [Data Lake]({{< relref "/docs/roadmap/data-management-architecture/data-lake" >}}) and [Parquet]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/parquet" >}}).

## Common mistakes

- **Millions of tiny files** from streaming jobs: listing and opening them dominates query time. Compact them.
- **Public buckets by accident.** Keep Block Public Access on and grant access through IAM roles.
- **Ignoring egress and request costs** when another cloud or region reads the data.
- **Treating a prefix rename as cheap.** It is a copy plus delete of every object.

## Learning Resources

- [Amazon S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [Amazon S3 strong consistency](https://aws.amazon.com/s3/consistency/)
- [Building and operating a pretty big storage system called S3](https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html): Andy Warfield, 2023
- [What is object storage? (Google Cloud)](https://cloud.google.com/learn/what-is-object-storage)
- [Ceph documentation: Object Gateway](https://docs.ceph.com/en/latest/radosgw/)
- [What is Object Storage?](https://www.youtube.com/watch?v=ZfTOQJlLsAs): video
