---
title: "Block Storage"
description: "How block storage works, animated: a write travels from the app through the file system to numbered blocks on a network volume. EBS, Ceph RBD and NVMe compared."
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ lsblk -o NAME,SIZE,TYPE,MOUNTPOINT</div>

# Block Storage

**Block storage** presents a disk as a long array of fixed-size **blocks** (usually 4 KiB), each addressed by a number called a **logical block address (LBA)**. The device knows nothing about files, folders or owners; it only answers "read block 1,040" and "write these bytes to block 1,040". The operating system puts a **file system** (ext4, XFS, NTFS) on top to turn those blocks into files. A laptop SSD, an Amazon EBS volume, a Ceph RBD image and a SAN LUN are all block storage; they differ in where the blocks physically live.

## The path of one write

{{< fig kicker="$ pg_ctl start   # PostgreSQL on an EBS volume" title="From write() to replicated blocks" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <g>
    <rect x="20" y="20" width="320" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="36" y="42" class="m" font-size="12" font-weight="700" fill="#17151F">APPLICATION</text>
    <text x="36" y="60" font-size="11" fill="#5C5869">PostgreSQL, writing an 8 KiB page</text>
    <rect x="20" y="100" width="320" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="36" y="122" class="m" font-size="12" font-weight="700" fill="#17151F">FILE SYSTEM</text>
    <text x="36" y="140" font-size="11" fill="#5C5869">ext4 / XFS: names, folders, permissions</text>
    <rect x="20" y="180" width="320" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="36" y="202" class="m" font-size="12" font-weight="700" fill="#17151F">BLOCK DEVICE</text>
    <text x="36" y="220" font-size="11" fill="#5C5869">/dev/nvme1n1: numbered 4 KiB blocks</text>
    <rect x="20" y="260" width="320" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="36" y="282" class="m" font-size="12" font-weight="700" fill="#17151F">NETWORK VOLUME</text>
    <text x="36" y="300" font-size="11" fill="#5C5869">EBS / Ceph RBD, on storage servers</text>
  </g>
  <g class="f" data-step="1">
    <rect x="370" y="26" width="370" height="40" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/>
    <text x="386" y="51" class="m" font-size="12" fill="#17151F">write(orders_file, 8 KiB, offset 57344)</text>
  </g>
  <g class="f" data-step="2">
    <line x1="180" y1="72" x2="180" y2="100" stroke="#531A8A" stroke-width="2"/>
    <rect x="370" y="106" width="370" height="40" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/>
    <text x="386" y="131" class="m" font-size="12" fill="#17151F">file offset 57344 → blocks 1040–1041</text>
  </g>
  <g class="f" data-step="3">
    <line x1="180" y1="152" x2="180" y2="180" stroke="#531A8A" stroke-width="2"/>
    <rect x="370" y="186" width="370" height="40" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/>
    <text x="386" y="211" class="m" font-size="12" fill="#17151F">WRITE LBA 1040, 2 blocks</text>
    <g fill="#F7F7FB" stroke="#E7E7EF"><rect x="232" y="192" width="14" height="14"/><rect x="248" y="192" width="14" height="14"/><rect x="296" y="192" width="14" height="14"/><rect x="312" y="192" width="14" height="14"/></g>
    <g fill="#531A8A"><rect x="264" y="192" width="14" height="14"/><rect x="280" y="192" width="14" height="14"/></g>
  </g>
  <g class="f" data-step="4">
    <line x1="180" y1="232" x2="180" y2="260" stroke="#531A8A" stroke-width="2"/>
    <text x="370" y="290" class="m" font-size="12" fill="#17151F">copies in the zone → ack</text>
    <rect x="566" y="262" width="80" height="48" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="606" y="291" text-anchor="middle" class="m" font-size="11" fill="#17151F">SERVER A</text>
    <rect x="660" y="262" width="80" height="48" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="700" y="291" text-anchor="middle" class="m" font-size="11" fill="#17151F">SERVER B</text>
    <text x="324" y="42" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#531A8A">fsync ✓</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Four layers sit between a database and the physical media. Only the top two know what a <b>file</b> is.</li>
  <li>PostgreSQL asks to overwrite <b>8 KiB at offset 57344</b> of a data file. It changes just that page, not the whole file.</li>
  <li>The <b>file system</b> looks up which blocks hold that part of the file: <b>blocks 1040 and 1041</b>.</li>
  <li>The <b>block device</b> receives a plain "write 2 blocks at LBA 1040". No names, no folders, just addresses.</li>
  <li>On a cloud volume the blocks travel over the network and are <b>replicated</b> to several servers in the same zone before the write is acknowledged. Now <b>fsync</b> returns and the commit is durable.</li>
</ol>
{{< /fig >}}

This is why databases want block storage: they need **small, in-place, low-latency** writes and a guarantee (`fsync`) that a write survived. Object storage cannot overwrite 8 KiB in the middle of an object.

## Kinds of block storage

| Kind | Examples | Latency | Survives instance loss? | Notes |
|---|---|---|---|---|
| **Local NVMe SSD** | EC2 instance store, bare-metal disks | ~0.1 ms | No | Fastest, but data dies with the machine. Good for caches, scratch space, replicated systems like Kafka or ClickHouse. |
| **Cloud network volume** | Amazon EBS (gp3, io2), Google Persistent Disk / Hyperdisk, Azure Managed Disks | ~0.5–1 ms | Yes | Replicated inside one availability zone. Pay for provisioned size, IOPS and throughput. Snapshots go to object storage. |
| **Software-defined** | Ceph RBD, Longhorn, OpenEBS | ~1 ms | Yes | Self-hosted replicated volumes, common for Kubernetes and OpenStack. |
| **SAN** | iSCSI, Fibre Channel, NVMe over Fabrics arrays | sub-ms | Yes | Traditional enterprise data centers. |

In Kubernetes, block volumes appear as **PersistentVolumes** with access mode `ReadWriteOnce`: one node mounts them at a time.

## Performance terms

- **IOPS**: operations per second. Matters for databases doing many small random reads and writes.
- **Throughput**: MB/s. Matters for sequential scans, backups, Kafka segments.
- **Latency**: time per operation. Network volumes add roughly half a millisecond over local NVMe.
- On EBS **gp3** you set IOPS and throughput independently of size; **io2 Block Express** targets consistent sub-millisecond latency for large databases.

## What block storage is not

- **Not shareable by default.** Two machines mounting the same ext4 volume at once will corrupt it. Shared access needs a cluster file system or a file/object service. (EBS Multi-Attach exists for io1/io2 but requires a cluster-aware file system.)
- **Not cross-zone.** An EBS volume lives in one availability zone. Zone-level durability comes from snapshots or database replication.
- **Not HDFS.** HDFS splits files into 128 MB "blocks", but it is a distributed **file system** accessed through its own API, not block storage.

## Common mistakes

- Running a production database on instance-store NVMe without replication, then losing the data when the instance stops.
- Sizing a volume for capacity only and hitting the IOPS or throughput limit under load.
- Forgetting that a snapshot of a running database is only crash-consistent; use the database's own backup tooling or freeze I/O first.

## Learning Resources

- [What is block storage? (AWS)](https://aws.amazon.com/what-is/block-storage/)
- [Amazon EBS volume types](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html)
- [Ceph documentation: block devices (RBD)](https://docs.ceph.com/en/latest/rbd/)
- [Kubernetes: Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/): free book; the persistence chapters cover disks and file systems
- [Amazon Elastic Block Store (EBS) Overview](https://www.youtube.com/watch?v=77qLAl-lRpo): video
