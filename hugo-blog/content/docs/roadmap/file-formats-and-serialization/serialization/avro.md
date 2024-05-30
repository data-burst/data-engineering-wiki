---
title: "Avro"
---
# Avro

## Introduction

**Avro** is a data serialization system developed by Apache that provides rich data structures and a compact, fast, binary data format. It uses JSON for defining data types and protocols, and serializes data in a compact binary format.

Avro is designed to be resilient to structure changes. When Avro data is read, its schema is always present. This allows any datum to be written in the schema used when the data was written, and for it to be read in the schema the reader expects.

## Structure

Avro data is always serialized with its schema. Schemas are defined with JSON, which makes it easier to comprehend. The Avro schema is defined using JSON, and it is composed of a set of primitive types (null, boolean, int, long, float, double, bytes, and string) and complex types (record, enum, array, map, union, and fixed).

Here is a basic example of an Avro schema:

```json
{
  "type": "record",
  "name": "User",
  "fields": [
    {"name": "name", "type": "string"},
    {"name": "favorite_number",  "type": ["int", "null"]},
    {"name": "favorite_color", "type": ["string", "null"]}
  ]
}
```

## Usecase

Avro is widely used in the Hadoop ecosystem, including by Kafka, HBase, and Cassandra for data storage. It's also used in RPC (Remote Procedure Call) systems where it provides a compact, fast, binary data format for data serialization.

The schema evolution mechanism in Avro is both powerful and useful. It allows old software to read new data, and new software to read old data. This is a critical feature for data storage systems that need to manage large amounts of historical data, and for systems that require long-term data compatibility.

In summary, Avro is a versatile data serialization system that allows for efficient, schema-evolved data storage and retrieval, with robust support for a wide variety of programming languages.
