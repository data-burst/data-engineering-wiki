---
title: "Protocol Buffers"
description: "How Protocol Buffers work, animated: .proto schemas, field numbers on the wire, how old readers skip new fields, and the rules that keep schema changes safe."
bookToC: false
---
<div class="lx-kicker-line">$ protoc --python_out=. order.proto</div>

# Protocol Buffers

**Protocol Buffers (Protobuf)** is Google's language-neutral binary serialization format. You describe messages in a `.proto` file, a compiler (`protoc` or `buf`) generates classes for Go, Java, Python, Rust and a dozen other languages, and those classes encode objects into compact bytes. Each field is identified on the wire by a **field number**, not by its name, which is what lets services upgrade one at a time. Protobuf is the payload format of **gRPC** and is common on Kafka topics alongside Avro.

## The schema

```protobuf
syntax = "proto3";
package shop.v1;

message Order {
  int64  id           = 1;
  string city         = 2;
  int32  amount_cents = 3;
  repeated Item items = 4;
  optional string coupon = 5;   // optional: lets you tell "unset" from ""
}

message Item {
  string sku = 1;
  int32  qty = 2;
}
```

The numbers (`= 1`, `= 2`, ...) are the contract. Names can be renamed freely in code; **numbers can never be changed or reused**. Numbers 1–15 take one byte on the wire, so give them to the most frequent fields.

Since 2023, Google is moving from `syntax = "proto2"/"proto3"` to **Editions** (`edition = "2023"`, then `"2024"`), which turn the old syntax differences into per-file and per-field feature flags. The wire format does not change.

## How the bytes look, and why old readers survive

{{< fig kicker="$ protoc --decode_raw < order.bin" title="Field numbers on the wire: v2 writer, v1 reader" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <g>
    <rect x="20" y="30" width="350" height="130" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="36" y="52" class="m" font-size="12" font-weight="600" fill="#17151F">WRITER · order.proto v2</text>
    <g class="m" font-size="12.5" fill="#3D3A49"><text x="36" y="80">int64 id = 1;</text><text x="36" y="102">string city = 2;</text><text x="36" y="124">int32 amount_cents = 3;</text><text x="36" y="146">string coupon = 4;</text></g>
    <text x="354" y="146" text-anchor="end" class="m" font-size="11" fill="#8C8899">new</text>
  </g>
  <g>
    <rect x="390" y="30" width="350" height="130" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="406" y="52" class="m" font-size="12" font-weight="600" fill="#17151F">READER · order.proto v1</text>
    <g class="m" font-size="12.5" fill="#3D3A49"><text x="406" y="80">int64 id = 1;</text><text x="406" y="102">string city = 2;</text><text x="406" y="124">int32 amount_cents = 3;</text></g>
  </g>
  <g class="f" data-step="1">
    <text x="20" y="186" class="m" font-size="11" fill="#5C5869">BYTES · each field = tag (number + wire type) + value</text>
    <g class="m" font-size="13">
      <rect x="20" y="194" width="170" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="219" fill="#531A8A" font-weight="700">1</text><text x="112" y="219" text-anchor="middle">42</text>
      <rect x="200" y="194" width="170" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="214" y="219" fill="#531A8A" font-weight="700">2</text><text x="292" y="219" text-anchor="middle">"TEH"</text>
      <rect x="380" y="194" width="170" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="394" y="219" fill="#531A8A" font-weight="700">3</text><text x="472" y="219" text-anchor="middle">2500</text>
      <rect x="560" y="194" width="180" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="574" y="219" fill="#531A8A" font-weight="700">4</text><text x="657" y="219" text-anchor="middle">"NOV10"</text>
    </g>
  </g>
  <g class="f" data-step="2">
    <rect x="16" y="190" width="538" height="48" rx="8" fill="none" stroke="#531A8A" stroke-width="2"/>
    <text x="20" y="260" class="m" font-size="12" fill="#531A8A">v1 knows 1, 2, 3 → id=42 city=TEH amount_cents=2500</text>
  </g>
  <g class="f" data-step="3">
    <rect x="556" y="190" width="188" height="48" rx="8" fill="none" stroke="#8C8899" stroke-width="1.6" stroke-dasharray="4 4"/>
    <text x="740" y="260" text-anchor="end" class="m" font-size="12" fill="#5C5869">unknown 4 → skipped, kept</text>
  </g>
  <g class="f" data-step="4">
    <rect x="20" y="280" width="720" height="48" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/>
    <text x="36" y="300" class="m" font-size="12" fill="#C2382F">v3 deletes amount_cents and reuses 3 for "string note"</text>
    <text x="36" y="318" font-size="12" fill="#3D3A49">v1 now decodes note's bytes as amount_cents: wrong data. Write <tspan class="m">reserved 3;</tspan> instead.</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>A service writes orders with <b>v2</b>, which added <b>coupon = 4</b>. Another service still reads with <b>v1</b>.</li>
  <li>On the wire, every field is a <b>tag</b> (field number + wire type) followed by its value. Field names are never sent.</li>
  <li>The v1 reader decodes the field numbers it knows: <b>1, 2 and 3</b>.</li>
  <li>Field <b>4</b> is unknown to v1. The wire type says how long it is, so the reader <b>skips</b> it and keeps it as an unknown field.</li>
  <li>The one fatal mistake: <b>reusing a field number</b>. Old readers decode the new field with the old meaning. Mark deleted numbers <b>reserved</b>.</li>
</ol>
{{< /fig >}}

There are only a handful of wire types (`VARINT`, `I64`, `LEN`, `I32`), and that is all a reader needs to skip a field it has never seen. Unlike [Avro]({{< relref "avro" >}}), a Protobuf reader does **not** need the writer's schema to decode a message.

## Rules for changing a .proto

| Change | Safe? | Why |
|---|---|---|
| Add a field with a new number | Yes | Old readers skip it; new readers see the default when it's missing |
| Delete a field | Yes, if you `reserve` its number and name | Prevents accidental reuse |
| Rename a field | Yes for binary, **no** for JSON | Binary uses numbers; the JSON mapping uses names |
| Change a field's number | **No** | It's a different field to every reader |
| Change a type | Mostly **no** | A few are compatible (`int32` ↔ `int64` ↔ `uint32` ↔ `bool` share VARINT), but values can be truncated |
| Move a field into or out of a `oneof` | **No** | Can lose data |

Tools like [`buf breaking`](https://buf.build/docs/breaking/) check these rules in CI, and a schema registry can enforce them for Kafka topics.

## Common mistakes

- **Relying on default values.** In proto3, a missing `int32` reads as `0` and a missing `string` as `""`. If "not set" is meaningful, mark the field `optional` or use a wrapper type.
- **Using `required`** (proto2). It makes removing a field impossible without breaking readers; it was dropped in proto3 for that reason.
- **Treating Protobuf as a storage format for analytics.** It's row-oriented and not splittable. Land messages, then write [Parquet]({{< relref "../file-formats/parquet" >}}).
- **Serializing maps and expecting stable bytes.** Map ordering is not guaranteed, so don't hash or deduplicate on raw Protobuf bytes.

## Learning Resources

- [protobuf.dev: Language Guide (proto3)](https://protobuf.dev/programming-guides/proto3/)
- [protobuf.dev: Encoding](https://protobuf.dev/programming-guides/encoding/)
- [protobuf.dev: Proto Best Practices](https://protobuf.dev/best-practices/dos-donts/)
- [protobuf.dev: Editions overview](https://protobuf.dev/editions/overview/)
- [Buf documentation](https://buf.build/docs/)
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/), Chapter 4: Martin Kleppmann
- See also: [Avro]({{< relref "avro" >}}), [JSON]({{< relref "../file-formats/json" >}})
