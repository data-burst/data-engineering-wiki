---
title: "Parquet"
---
# Parquet

## Introduction

**Apache Parquet** is a columnar storage file format available to any project in the Hadoop ecosystem. It provides efficient data compression and encoding schemes with enhanced performance to handle complex data in bulk.

Parquet is optimized to work with complex data in bulk and features different ways for efficient data compression and encoding types. This approach is best especially for those queries that need to read certain columns from a large table.

## Structure

Parquet data is stored in columnar format, and is optimized for the write once, read many use case. Each data file contains the values for a set of rows. The values for each column in the row group are stored together, enabling good compression.

Parquet format is self-describing. That means the schema for the data is encoded in the data file itself; when data is read by a different system, that system doesn't need a separate schema definition.

Here is a basic example of a Parquet data structure:

```
message Document {
  required int64 DocId;
  optional group Links {
    repeated int64 Backward;
    repeated int64 Forward;
  }
  repeated group Name {
    repeated group Language {
      required binary Code;
      optional binary Country;
    }
    optional binary Url;
  }
}
```

## Usecase

Parquet is widely adopted because it supports a wide variety of query engines such as Hive, Pig, and Impala, as well as multiple data processing frameworks including MapReduce, Apache Beam, and Scalding.

It is especially good for queries scanning certain columns within a large table, providing better performance due to its columnar nature, and also allows for better data compression.

In summary, Parquet is a powerful, efficient, and scalable data storage format, which is widely used in the Hadoop ecosystem, and it excels when working with big data use cases.
