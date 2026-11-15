---
title: "JSON"
description: "JSON for data engineers: objects and arrays, JSON Lines for big files, JSON Schema, number and date pitfalls, and how to flatten nested JSON into tables."
---

# JSON

**JSON (JavaScript Object Notation)** is a text format for structured data built from two shapes: **objects** (`{"key": value}`) and **arrays** (`[v1, v2]`), with strings, numbers, `true`, `false` and `null` as values. It is defined by [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259), it's what nearly every REST API returns, and it's the usual shape of application logs and webhook events.

```json
{
  "order_id": 7,
  "user": {"id": 42, "name": "Alice"},
  "city": "New York",
  "items": [
    {"sku": "TEA-01", "qty": 2, "price": 3.5},
    {"sku": "CUP-07", "qty": 1, "price": 12.0}
  ],
  "paid": true,
  "created_at": "2026-11-16T09:30:00Z"
}
```

## How it differs from CSV

JSON is **nested** and **self-describing**: every record carries its own field names, and a field can hold another object or a list. That makes it a natural fit for events whose shape varies, and an awkward fit for tables, because an order with three items does not map to one row.

## JSON Lines: the format for big JSON data

A single JSON array of a million records must be parsed as one document. **JSON Lines** (also called NDJSON) puts **one JSON object per line** instead, so files can be streamed, split across workers and appended to:

```text
{"order_id": 7, "city": "New York", "amount": 250}
{"order_id": 8, "city": "Toronto", "amount": 120}
```

Spark, DuckDB, BigQuery, Snowflake and most log shippers read JSON Lines natively. If you control the producer, prefer it over one large array.

## Trade-offs

| Good at | Bad at |
|---|---|
| Nested and variable-shape data | Large analytical scans (every byte is parsed) |
| Human-readable, universal tooling | Size: field names repeat in every record |
| No schema needed to start | Types: only one number type, no dates, no binary |
| APIs, configs, event payloads | Schema drift goes unnoticed until something breaks |

## Common mistakes

- **Large integers.** JSON has one number type. JavaScript and many parsers read numbers as 64-bit floats, so IDs above 2^53 (about 9×10^15) silently lose precision. Send big IDs as strings.
- **Money as floats.** `0.1 + 0.2` is not `0.3`. Use integer cents or decimal strings.
- **Dates.** JSON has no date type. Agree on ISO 8601 with a timezone (`2026-11-16T09:30:00Z`).
- **Missing vs null.** `{"coupon": null}` and `{}` can mean different things. Decide which one you emit.
- **Querying raw JSON forever.** Land it as-is, then flatten it into typed columns (or Parquet) in the next step.

## Working with nested JSON

Most engines can unnest arrays into rows:

```sql
-- DuckDB: one row per order item
SELECT o.order_id, i.sku, i.qty, i.price
FROM read_json('orders.jsonl') AS o, UNNEST(o.items) AS t(i);
```

To validate shape before loading, describe it with [JSON Schema](https://json-schema.org/) and reject or quarantine records that don't match. For high-volume service-to-service traffic, a schema-first binary format such as [Avro]({{< relref "../serialization/avro" >}}) or [Protobuf]({{< relref "../serialization/protobuf" >}}) is smaller and safer.

## Learning Resources

- [RFC 8259: The JSON Data Interchange Format](https://www.rfc-editor.org/rfc/rfc8259)
- [JSON Lines](https://jsonlines.org/)
- [JSON Schema](https://json-schema.org/learn/getting-started-step-by-step)
- [DuckDB: Loading JSON](https://duckdb.org/docs/data/json/overview)
- [jq manual](https://jqlang.org/manual/): the command-line tool for slicing JSON
- See also: [CSV]({{< relref "csv" >}}), [XML]({{< relref "xml" >}}), [Parquet]({{< relref "parquet" >}})
