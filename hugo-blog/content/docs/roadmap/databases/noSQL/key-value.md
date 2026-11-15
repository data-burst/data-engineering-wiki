---
title: "Key-Value"
description: "How key-value stores like Redis, Valkey and DynamoDB work: get/put by key, hash partitioning, in-memory vs durable stores, TTLs, and typical caching use cases."
weight: 3
---

# Key-Value Databases

A **key-value store** is the simplest database model: you `put(key, value)` and `get(key)`, and the database treats the value as an opaque blob or a small data structure. Because every operation names exactly one key, the store can hash the key to find the right machine and answer in well under a millisecond. Caches, user sessions, feature flags, rate limiters and shopping carts are classic uses.

## How it works

- **Lookup by key only.** There is no "find all users in Tehran" unless you build that index yourself. Design keys around how you read: `session:8f3a`, `cart:u-42`, `rate:ip:10.0.0.7:2026-11-16T09:30`.
- **Partitioning by hash.** In a cluster, `hash(key)` decides which node owns the key. Redis Cluster uses 16,384 hash slots; DynamoDB hashes the partition key. Adding nodes moves only some keys. See [Sharding]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}}).
- **In memory or on disk.** Redis and Valkey keep everything in RAM (with optional snapshots and an append-only file for durability). DynamoDB, RocksDB and FoundationDB store data on SSD and are fully durable.
- **Expiry.** A **TTL** deletes a key automatically after a time, which is what makes key-value stores natural caches.

## Popular key-value stores

| Store | Storage | Notes |
|---|---|---|
| **[Redis](https://redis.io/)** | In memory | Rich value types: strings, hashes, lists, sets, sorted sets, streams. Licensing changed in 2024 (RSAL/SSPL); Redis 8 (2025) added AGPLv3 as an open-source option. |
| **[Valkey](https://valkey.io/)** | In memory | BSD-licensed fork of Redis 7.2 under the Linux Foundation, created in 2024. Drop-in compatible; used by AWS ElastiCache and Google Memorystore. |
| **[Amazon DynamoDB](https://aws.amazon.com/dynamodb/)** | Durable, managed | Key-value and document. Partition key plus optional sort key, single-digit-millisecond latency at any scale, pay per request or provisioned capacity. |
| **[RocksDB](https://rocksdb.org/)** | Embedded, on disk | An LSM-tree library, not a server. The storage engine inside Kafka Streams, Flink state, CockroachDB and many others. |
| **[etcd](https://etcd.io/)** | Durable, Raft-replicated | Small, strongly consistent store for configuration and coordination (Kubernetes state). Not for bulk data. |

## When to use one

- **Good fit:** caching expensive query results, sessions, counters, leaderboards (Redis sorted sets), idempotency keys, deduplication in pipelines, lookups at very high request rates.
- **Poor fit:** anything that needs ad hoc queries, joins, or range scans over values. If you keep adding secondary indexes by hand, you want a different database.

## Common mistakes

- **Treating a cache as the source of truth.** Redis with default settings can lose recent writes on a crash. Keep the real data in a durable database.
- **Hot keys.** One key (a global counter, a celebrity's profile) receives most traffic and overloads a single node or DynamoDB partition. Spread it (`counter:{shard}`) or cache locally.
- **Huge values.** Multi-megabyte values block single-threaded Redis and waste network. Store large blobs in object storage and keep a pointer.
- **No TTL on cache keys,** so memory fills up and eviction starts dropping keys you needed.

## Learning Resources

- [Redis documentation](https://redis.io/docs/latest/) and [Redis University](https://redis.io/university/)
- [Valkey documentation](https://valkey.io/docs/)
- [Amazon DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- *The DynamoDB Book*, Alex DeBrie: single-table design and access-pattern modeling
- [Dynamo: Amazon's Highly Available Key-value Store](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) (2007)
- [Amazon DynamoDB: A Scalable, Predictably Performant, and Fully Managed NoSQL Database Service](https://www.usenix.org/conference/atc22/presentation/elhemali) (USENIX ATC 2022)
