---
bookCollapseSection: true
weight: 2
title: "Serialization"
description: "Schema-first binary serialization for data engineers: how Avro and Protobuf encode records compactly and let producers and consumers evolve schemas safely."
---

# Serialization

Serialization turns an in-memory object into bytes; deserialization turns the bytes back. JSON can do this, but it repeats every field name in every message and has no schema, so a renamed field breaks consumers silently.

**Schema-first binary formats** fix both problems. The schema is defined once, the bytes carry only values (plus small tags), and there are written rules for which schema changes are safe.

| Page | One-line summary |
|---|---|
| [Avro]({{< relref "avro" >}}) | Schema in JSON, no field tags in the data. Reader and writer schemas are resolved by field name. Default for Kafka and CDC. |
| [Protobuf]({{< relref "protobuf" >}}) | Schema in `.proto` files compiled to code. Every field has a number on the wire. Default for gRPC. |

The key idea in both: **the producer and the consumer upgrade at different times**, so every message must be readable by both older and newer code. That property is called **schema compatibility**.
