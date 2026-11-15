---
title: "Document Based"
description: "How document databases like MongoDB store JSON documents, when to embed vs reference, how they scale, and what to watch for when pipelines read them."
weight: 2
---

# Document Databases

A **document database** stores each record as a self-contained **document**, usually JSON or a binary form of it (MongoDB's BSON), grouped into **collections**. A document can nest objects and arrays, and two documents in the same collection may have different fields. The idea: data that the application reads together is **stored together**, so one lookup returns a whole order with its items and shipping address, without joins.

## How it looks

The same order, modeled relationally, needs three tables (`orders`, `order_items`, `addresses`) and two joins. As a document it is one object:

```json
{
  "_id": "order-9812",
  "customer_id": "u-42",
  "created_at": "2026-11-16T09:30:00Z",
  "status": "paid",
  "shipping": { "city": "New York", "zip": "10001" },
  "items": [
    { "sku": "MUG-01", "qty": 2, "price": 9.5 },
    { "sku": "TEE-07", "qty": 1, "price": 19.0 }
  ]
}
```

Queries filter and index on fields inside the document, including nested ones (`items.sku`), and an aggregation pipeline handles grouping and reshaping.

## Embed or reference?

The central modeling decision:

| Embed (nest inside the document) | Reference (store an id, look up separately) |
|---|---|
| Data is read together with the parent (order items) | Data is shared by many parents (a product, a customer) |
| Child list is bounded (a few hundred items) | Child list grows without limit (all events of a user) |
| Updated together with the parent | Updated independently and often |

MongoDB documents are capped at 16 MB, so unbounded arrays eventually break. "Model for your queries" is the rule, much like wide-column stores.

## Scaling and consistency

Document stores scale out by **sharding** collections on a shard key and keep copies with **replica sets** (one primary, several secondaries). MongoDB has supported multi-document ACID transactions since 4.0 (2018), but they cost more than single-document writes, which are always atomic. See [Sharding]({{< relref "/docs/roadmap/distributed-systems-concepts/sharding" >}}) and [Replication]({{< relref "/docs/roadmap/distributed-systems-concepts/replication" >}}).

## Popular document databases

- **[MongoDB](https://www.mongodb.com/)**: the most widely used document database. Server Side Public License (source-available) since 2018; managed as MongoDB Atlas.
- **[Couchbase](https://www.couchbase.com/)**: documents plus a built-in memory cache and a SQL-like language (SQL++). Strong in mobile sync.
- **[Amazon DocumentDB](https://aws.amazon.com/documentdb/)** and **Azure Cosmos DB**: managed services with MongoDB-compatible APIs.
- **PostgreSQL `jsonb`**: JSON columns with GIN indexes inside a relational database. Often enough when only part of the data is flexible.
- **[Elasticsearch](https://www.elastic.co/elasticsearch) / [OpenSearch](https://opensearch.org/)**: store JSON documents, but they are **search engines** first (inverted indexes, full-text relevance). Use them as a search or log index fed from a primary database, not as the source of truth. Elasticsearch added an AGPL license option in 2024; OpenSearch is the Apache-2.0 fork, now under the Linux Foundation.

## For data engineers: reading documents downstream

- **Schema drift.** A new field appears, or `price` is a string in old documents and a number in new ones. Validate with JSON Schema in the database (MongoDB supports `$jsonSchema` validators) or in the pipeline.
- **Flattening.** Warehouses want columns. Decide how to unnest arrays (one row per item?) and where to keep the raw document (a `VARIANT`/`JSON` column is common).
- **Change streams.** Use MongoDB change streams or a CDC tool such as Debezium instead of repeated full exports. See [CDC]({{< relref "/docs/roadmap/data-integration/cdc" >}}).

## Common mistakes

- Choosing a document store "because there's no schema", then rebuilding joins in application code.
- Unbounded arrays inside a document (comments, events), which grow until they hit the size limit.
- Indexing nothing and letting every query scan the collection.

## Learning Resources

- [MongoDB manual: data modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- [MongoDB University](https://learn.mongodb.com/): free courses
- *MongoDB: The Definitive Guide* (3rd ed.), Shannon Bradshaw, Eoin Brazil and Kristina Chodorow
- [Couchbase tutorials](https://developer.couchbase.com/tutorials/)
- [PostgreSQL: JSON types](https://www.postgresql.org/docs/current/datatype-json.html)
