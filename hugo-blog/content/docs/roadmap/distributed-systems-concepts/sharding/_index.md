---
title: "Sharding"
description: "Sharding explained with an animation: range vs hash partitioning, choosing a shard key, hot spots, rebalancing, cross-shard queries and when not to shard."
weight: 3
bookToC: false
---
<div class="lx-kicker-line">$ man sharding   # a.k.a. partitioning, horizontal scaling</div>

# Sharding

**Sharding** splits one large dataset into smaller pieces (shards, also called partitions) and puts each piece on a different machine. Every row lives on exactly one shard, so together the machines can store more data and absorb more writes than any single server. The same idea is called *partitioning* in Kafka, Cassandra, Spark and most data tools.

Sharding is **horizontal scaling** (add machines). Its alternative is **vertical scaling** (buy a bigger machine), which is simpler and should usually come first.

## The whole game is the shard key

A **shard key** (or partition key) is the column that decides where a row goes. Two classic ways to map a key to a shard behave very differently.

{{< fig kicker="$ ./route --key user_id --shards 3" title="Range vs hash partitioning on the same keys" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <text x="20" y="34" class="m" font-size="12" fill="#5C5869">user_id:</text>
  <text x="90" y="34" class="m" font-size="13" font-weight="700" fill="#17151F">7   18   29   44   63   88</text>
  <text x="20" y="104" class="m" font-size="12" font-weight="700" fill="#531A8A">RANGE</text>
  <text x="20" y="122" class="m" font-size="11" fill="#8C8899">by key order</text>
  <text x="20" y="244" class="m" font-size="12" font-weight="700" fill="#531A8A">HASH</text>
  <text x="20" y="262" class="m" font-size="11" fill="#8C8899">by hash(key)</text>
  <g font-size="12" font-weight="600" fill="#17151F" text-anchor="middle">
    <rect x="150" y="70" width="180" height="84" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="360" y="70" width="180" height="84" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="570" y="70" width="180" height="84" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="240" y="90">SHARD 1 · 1–33</text>
    <text class="m" x="450" y="90">SHARD 2 · 34–66</text>
    <text class="m" x="660" y="90">SHARD 3 · 67–100</text>
    <rect x="150" y="210" width="180" height="84" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="360" y="210" width="180" height="84" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="570" y="210" width="180" height="84" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="240" y="230">SHARD 1 · h % 3 = 0</text>
    <text class="m" x="450" y="230">SHARD 2 · h % 3 = 1</text>
    <text class="m" x="660" y="230">SHARD 3 · h % 3 = 2</text>
  </g>
  <!-- step 1: range placement -->
  <g class="f" data-step="1" font-size="14" font-weight="700" fill="#17151F" text-anchor="middle">
    <text class="m" x="240" y="122">7   18   29</text>
    <text class="m" x="450" y="122">44   63</text>
    <text class="m" x="660" y="122">88</text>
  </g>
  <!-- step 2: range query is cheap -->
  <g class="f" data-step="2">
    <rect x="146" y="66" width="188" height="92" rx="8" fill="none" stroke="#531A8A" stroke-width="2.4"/>
    <rect x="356" y="66" width="188" height="92" rx="8" fill="none" stroke="#531A8A" stroke-width="2.4"/>
    <text x="150" y="180" class="m" font-size="12" fill="#531A8A">WHERE user_id BETWEEN 20 AND 50  →  2 of 3 shards</text>
  </g>
  <!-- step 3: hot spot -->
  <g class="f" data-step="3">
    <rect x="566" y="66" width="188" height="92" rx="8" fill="none" stroke="#C2382F" stroke-width="2.4"/>
    <text x="660" y="144" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#C2382F">96 97 98 99</text>
    <text x="750" y="60" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#C2382F">HOT: every new signup</text>
  </g>
  <!-- step 4: hash spreads -->
  <g class="f" data-step="4" font-size="14" font-weight="700" text-anchor="middle">
    <text class="m" x="240" y="262" fill="#17151F">7   63</text>
    <text class="m" x="450" y="262" fill="#17151F">18   44</text>
    <text class="m" x="660" y="262" fill="#17151F">29   88</text>
    <text class="m" x="240" y="284" fill="#531A8A" font-size="13">98</text>
    <text class="m" x="450" y="284" fill="#531A8A" font-size="13">96   99</text>
    <text class="m" x="660" y="284" fill="#531A8A" font-size="13">97</text>
  </g>
  <!-- step 5: scatter-gather -->
  <g class="f" data-step="5">
    <rect x="146" y="206" width="188" height="92" rx="8" fill="none" stroke="#531A8A" stroke-width="2.4"/>
    <rect x="356" y="206" width="188" height="92" rx="8" fill="none" stroke="#531A8A" stroke-width="2.4"/>
    <rect x="566" y="206" width="188" height="92" rx="8" fill="none" stroke="#531A8A" stroke-width="2.4"/>
    <text x="150" y="322" class="m" font-size="12" fill="#531A8A">WHERE user_id BETWEEN 20 AND 50  →  ask all 3 shards</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Six users, three machines. The same keys will be placed two ways: by <b>range</b> and by <b>hash</b>.</li>
  <li><b>Range partitioning</b>: each shard owns a contiguous key range, like volumes of an encyclopedia.</li>
  <li>Range queries are cheap: users 20 to 50 live on <b>2 of 3</b> shards, and the rest are never touched.</li>
  <li>But keys that grow over time (auto-increment IDs, timestamps) all land on the <b>last shard</b>. One machine takes every write: a <b>hot spot</b>.</li>
  <li><b>Hash partitioning</b>: <code>hash(user_id) % 3</code> scatters keys pseudo-randomly, so new signups spread evenly across all shards.</li>
  <li>The price: neighbors are no longer together. The same range query must ask <b>every shard</b> and merge the answers (<b>scatter-gather</b>).</li>
</ol>
{{< /fig >}}

## Partitioning strategies

| Strategy | How a key is placed | Good at | Bad at | Used by |
|---|---|---|---|---|
| **Range** | Sorted key ranges per shard | Range scans, ordered reads | Hot spots on increasing keys | HBase, Bigtable, CockroachDB, TiDB, MongoDB ranged shards |
| **Hash** | `hash(key)` decides the shard | Even spread of reads and writes | Range queries become scatter-gather | Cassandra, DynamoDB, Kafka (default partitioner), Redis Cluster |
| **Consistent hashing** | Keys and nodes on a hash ring | Adding a node moves only ~1/N of keys | Uneven without virtual nodes | Dynamo-style stores, Cassandra vnodes, CDNs |
| **Directory / lookup** | A mapping table says where each key lives | Moving single tenants, uneven tenants | The directory is one more service to keep available | Vitess, many multi-tenant SaaS setups |

Plain `hash(key) % N` has a nasty property: change N from 3 to 4 and almost every key moves. Real systems avoid that with consistent hashing or with **many more partitions than nodes** (for example 256 partitions on 4 nodes) so rebalancing just moves whole partitions.

## Choosing a shard key

A good shard key has **high cardinality**, spreads **writes evenly**, and matches **how you query**:

- `user_id` or `tenant_id` for a SaaS app: most queries are "everything for this user", so they hit one shard.
- `country` is a bad key: a handful of values, and one country may hold half your users.
- `created_at` alone is a bad key for range sharding: today's writes all go to one shard. Combine it with a hashed prefix, or bucket by `hash(user_id)` first.

The same rule applies to data engineering tools: Kafka keys decide which partition holds an entity's events (and therefore their order), and Spark or Iceberg partition columns decide which files a query can skip.

## Sharding and replication together

Sharding and [replication]({{< relref "/docs/roadmap/distributed-systems-concepts/replication" >}}) solve different problems and are almost always combined.

| | Replication | Sharding |
|---|---|---|
| What each node holds | A full copy | A slice |
| Scales | Reads, availability | Storage, writes, and reads |
| A node dies | Another copy serves the data | That slice is gone unless the shard is also replicated |
| Typical layout | 1 leader + 2 followers | N shards, each with its own leader + followers |

## What sharding costs you

- **Cross-shard queries**: joins and aggregations across shards need scatter-gather or data shuffling.
- **Cross-shard transactions**: atomically updating rows on two shards needs a protocol like two-phase commit. See [Distributed Transactions]({{< relref "/docs/roadmap/distributed-systems-concepts/transaction" >}}).
- **Secondary indexes**: an index on `email` when you shard by `user_id` is either local (every shard is searched) or global (writes touch another shard). See [Indexing]({{< relref "/docs/roadmap/distributed-systems-concepts/indexing" >}}).
- **Operations**: rebalancing, resharding and backups across many machines.

## Common mistakes

- **Sharding too early.** A single PostgreSQL server with good indexes, table partitioning and read replicas handles terabytes. Shard when one machine truly cannot keep up.
- **A monotonic shard key with range partitioning.** Creates a permanent hot shard.
- **Ignoring hot keys.** Even with hashing, one celebrity user or one huge tenant can overload a shard. Split or salt those keys.
- **`% N` routing in application code.** Makes adding a shard a full data migration.
- **Picking a key that does not match queries.** If most queries do not include the shard key, every query is scatter-gather.

## Learning Resources

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: the partitioning (sharding) chapter

### Docs and papers

- [Dynamo: Amazon's Highly Available Key-value Store](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf): consistent hashing and virtual nodes in practice
- [Vitess documentation: Sharding](https://vitess.io/docs/reference/features/sharding/): how YouTube-scale MySQL is sharded
- [Citus: Choosing the distribution column](https://docs.citusdata.com/en/stable/sharding/data_modeling.html): shard key design for PostgreSQL
- [Understanding Database Sharding](https://www.digitalocean.com/community/tutorials/understanding-database-sharding), DigitalOcean

### Videos

- [What is Database Sharding?](https://www.youtube.com/watch?v=5faMjKuB9bc)
- [Sharding | Horizontal Scaling | System Design Interview Basics](https://www.youtube.com/watch?v=0DzRdQ-sOTg)
