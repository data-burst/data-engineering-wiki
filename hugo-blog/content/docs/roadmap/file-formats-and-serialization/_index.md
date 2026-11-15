---
bookCollapseSection: true
weight: 16
description: "How data is stored and sent: text formats (CSV, JSON, XML), columnar Parquet, and binary serialization (Avro, Protobuf), with a table to pick the right one."
---

# File Formats and Serialization

A **file format** is the agreed layout of bytes on disk: where one record ends, where one field ends, and what type each value has. **Serialization** is the act of turning an in-memory object (an order, a user) into such bytes so it can be stored or sent over the network, and **deserialization** turns the bytes back into an object.

Every pipeline does this at every hop. An API returns JSON, a nightly export lands as CSV, Kafka carries Avro or Protobuf, and the lakehouse stores Parquet. The format you pick decides how big the data is, how fast it can be queried, and what breaks when someone adds a column.

## The three questions that decide the format

1. **Who reads it?** A human or a spreadsheet wants text (CSV, JSON). A query engine wants columns (Parquet). A service in another language wants a schema and generated code (Protobuf, Avro).
2. **Row at a time or column at a time?** Writing and reading one record (an event, an API call) favors row formats. Scanning millions of rows for a few columns favors columnar formats.
3. **How will the schema change?** Text formats carry no schema, so changes break readers silently. Avro and Protobuf have explicit rules for adding and removing fields.

## At a glance

| Format | Encoding | Schema | Layout | Typical use |
|---|---|---|---|---|
| [CSV]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/csv" >}}) | Text | None (header row at best) | Row | Exports, spreadsheets, one-off loads |
| [JSON]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/json" >}}) | Text | Optional (JSON Schema) | Row, nested | REST APIs, logs, semi-structured events |
| [XML]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/xml" >}}) | Text | Optional (XSD) | Tree | Legacy enterprise, finance, SOAP, document formats |
| [Parquet]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats/parquet" >}}) | Binary | Embedded | Columnar | Analytics, data lakes, lakehouse tables |
| [Avro]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization/avro" >}}) | Binary | Required, JSON-defined | Row | Kafka events, data exchange, CDC |
| [Protobuf]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization/protobuf" >}}) | Binary | Required, `.proto` + codegen | Row | gRPC, service-to-service messages |

Other names you will meet: **ORC** (columnar, Hive-era cousin of Parquet), **Arrow** (columnar, but for memory and the wire, not long-term storage), and **table formats** such as Iceberg and Delta Lake, which are not file formats at all but metadata layers over Parquet files.

## What's in this section

- **[File Formats]({{< relref "/docs/roadmap/file-formats-and-serialization/file-formats" >}})**: CSV, JSON, XML and Parquet, how each one stores records and where each one hurts.
- **[Serialization]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization" >}})**: Avro and Protobuf, schema-first binary encodings and how they survive schema changes.

## Learning Resources

- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/), Chapter 4 "Encoding and Evolution": Martin Kleppmann
- [Schema evolution in Avro, Protocol Buffers and Thrift](https://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html): Martin Kleppmann
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/): Reis and Housley
