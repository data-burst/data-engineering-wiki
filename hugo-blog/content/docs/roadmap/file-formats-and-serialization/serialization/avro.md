---
title: "Avro"
description: "How Apache Avro works, animated: JSON schemas, compact binary records, writer vs reader schema resolution, schema registries and safe schema evolution."
bookToC: false
---
<div class="lx-kicker-line">$ avro-tools getschema orders.avro</div>

# Avro

**Apache Avro** is a binary serialization format whose schema is written in JSON. A record is encoded as just its values, in schema order, with no field names or tags, so Avro data is very compact. The catch: you can only decode the bytes if you know the exact schema they were written with. Avro's key feature is what it does with that: it **resolves the writer's schema against the reader's schema**, so old and new versions of a producer and consumer can keep talking.

Avro is a common format for Kafka events and CDC streams (Debezium, Confluent connectors), and it is also used as a row-oriented file format (`.avro` container files) for data exchange.

## The schema

```json
{
  "type": "record",
  "name": "Order",
  "namespace": "shop",
  "fields": [
    {"name": "id",     "type": "long"},
    {"name": "name",   "type": "string"},
    {"name": "coupon", "type": ["null", "string"], "default": null}
  ]
}
```

Primitive types are `null`, `boolean`, `int`, `long`, `float`, `double`, `bytes` and `string`. Complex types are `record`, `enum`, `array`, `map`, `union` and `fixed`. **Logical types** add meaning on top, for example `decimal`, `date`, `timestamp-millis`, `timestamp-micros` and `uuid`. An optional field is a union with `null`; list `null` first, because a union's default must match its first branch.

## Old reader, new writer

The producer team ships schema **v2**: it adds `email` and drops `city`. The consumer still runs code built for **v1**. Here is what happens to one record.

{{< fig kicker="$ consumer --schema v1 < producer --schema v2" title="Avro schema resolution: writer v2, reader v1" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <defs><marker id="av-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g>
    <rect x="20" y="30" width="230" height="160" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="36" y="54" class="m" font-size="12" font-weight="600" fill="#17151F">WRITER · v2</text>
    <line x1="20" y1="66" x2="250" y2="66" stroke="#E7E7EF"/>
    <g class="m" font-size="13" fill="#3D3A49"><text x="36" y="96">id: long</text><text x="36" y="124">name: string</text><text x="36" y="152">email: string</text></g>
    <text x="234" y="152" text-anchor="end" class="m" font-size="11" fill="#8C8899">new</text>
  </g>
  <g>
    <rect x="510" y="30" width="230" height="160" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="526" y="54" class="m" font-size="12" font-weight="600" fill="#17151F">READER · v1</text>
    <line x1="510" y1="66" x2="740" y2="66" stroke="#E7E7EF"/>
    <g class="m" font-size="13" fill="#3D3A49"><text x="526" y="96">id: long</text><text x="526" y="124">name: string</text><text x="526" y="152">city: string</text></g>
    <text x="526" y="174" class="m" font-size="11" fill="#8C8899">default "unknown"</text>
  </g>
  <g class="f" data-step="1">
    <line x1="80" y1="190" x2="80" y2="224" stroke="#531A8A" stroke-width="1.4" marker-end="url(#av-ar)"/>
    <text x="90" y="212" class="m" font-size="11" fill="#8C8899">encode</text>
    <rect x="20" y="228" width="340" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <g class="m" font-size="13">
      <rect x="30" y="236" width="64" height="28" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="62" y="255" text-anchor="middle">42</text>
      <rect x="100" y="236" width="74" height="28" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="137" y="255" text-anchor="middle">"alice"</text>
      <rect x="180" y="236" width="170" height="28" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="265" y="255" text-anchor="middle">"alice@shop.com"</text>
    </g>
    <text x="20" y="290" class="m" font-size="11" fill="#5C5869">BYTES · values only, no names, no tags</text>
  </g>
  <g class="f" data-step="2">
    <rect x="400" y="228" width="340" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="570" y="249" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">SCHEMA REGISTRY</text>
    <text x="570" y="265" text-anchor="middle" class="m" font-size="11" fill="#5C5869">schema id 7 → writer v2</text>
    <line x1="625" y1="228" x2="625" y2="196" stroke="#531A8A" stroke-width="1.4" marker-end="url(#av-ar)"/>
  </g>
  <g class="f" data-step="3">
    <line x1="256" y1="92" x2="504" y2="92" stroke="#531A8A" stroke-width="1.4" marker-end="url(#av-ar)"/>
    <line x1="256" y1="120" x2="504" y2="120" stroke="#531A8A" stroke-width="1.4" marker-end="url(#av-ar)"/>
    <text x="380" y="84" text-anchor="middle" font-size="12" fill="#531A8A">matched by field name</text>
  </g>
  <g class="f" data-step="4">
    <line x1="256" y1="148" x2="300" y2="148" stroke="#8C8899" stroke-width="1.4" stroke-dasharray="4 4"/>
    <text x="308" y="152" font-size="12" fill="#5C5869">skipped (not in v1)</text>
  </g>
  <g class="f" data-step="5">
    <rect x="518" y="134" width="214" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/>
    <text x="526" y="152" class="m" font-size="13" fill="#531A8A">city = "unknown"</text>
    <rect x="20" y="300" width="720" height="34" rx="6" fill="#260246"/>
    <text x="380" y="322" text-anchor="middle" class="m" font-size="13" fill="#EEEAF5">consumer sees { id: 42, name: "alice", city: "unknown" }</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The producer writes with schema <b>v2</b>. The consumer reads with schema <b>v1</b>. Neither knows the other was upgraded.</li>
  <li>The writer <b>encodes</b> only the values, in v2 field order. On their own, these bytes can't be decoded.</li>
  <li>The reader looks up the <b>writer's schema</b>: from a schema registry (the message carries a schema ID) or from the header of an Avro file.</li>
  <li>Avro walks both schemas and <b>matches fields by name</b>, not by position. id and name decode as usual.</li>
  <li><b>email</b> exists only in the writer schema, so the reader decodes it and throws it away.</li>
  <li><b>city</b> is missing from the data, so the reader fills in its <b>default</b>. Without a default, this read would fail.</li>
</ol>
{{< /fig >}}

## Compatibility rules

A schema registry (Confluent Schema Registry, Apicurio, AWS Glue Schema Registry) stores every version of a schema and **rejects changes that break the compatibility mode** you set for the topic.

| Mode | Guarantee | Safe changes |
|---|---|---|
| **BACKWARD** (Confluent default) | New consumers can read old data | Delete a field; add a field **with a default** |
| **FORWARD** | Old consumers can read new data | Add a field; delete a field **that had a default** |
| **FULL** | Both directions | Add or delete fields **that have defaults** |
| `*_TRANSITIVE` | Same, against every past version, not just the last | Same rules, stricter check |

The practical rule: **give every field a default**, never rename a field (use `aliases` if you must), and never change a field's type except for Avro's allowed promotions (`int` → `long`, `float` or `double`; `long` → `float` or `double`; `float` → `double`; `string` ↔ `bytes`).

## Avro vs Protobuf vs JSON

| | Avro | Protobuf | JSON |
|---|---|---|---|
| Schema | Required, JSON | Required, `.proto` | Optional |
| Field identity on the wire | None (schema order) | Field number | Field name |
| Needs writer schema to read | Yes | No | No |
| Code generation | Optional (generic records work) | Usual | No |
| Typical home | Kafka, CDC, data files | gRPC, service APIs | REST APIs, logs |

## Common mistakes

- **Adding a required field** (no default) to a topic in BACKWARD mode. The registry will reject it; if you bypass the registry, consumers break.
- **Sending raw Avro without a schema ID.** Without the writer schema, the bytes are unreadable.
- **Using Avro files for analytics.** Avro is row-oriented. For scans, convert to [Parquet]({{< relref "../file-formats/parquet" >}}).

## Learning Resources

- [Apache Avro documentation and specification](https://avro.apache.org/docs/)
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/), Chapter 4: Martin Kleppmann
- [Schema evolution in Avro, Protocol Buffers and Thrift](https://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html): Martin Kleppmann
- [Confluent: Schema Evolution and Compatibility](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html)
- See also: [Protobuf]({{< relref "protobuf" >}}), [CDC]({{< relref "/docs/roadmap/data-integration/cdc" >}})
