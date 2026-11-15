---
title: "Tracing"
description: "Distributed tracing explained with an animated trace waterfall: spans, context propagation, sampling, OpenTelemetry, and Jaeger, Tempo and Zipkin compared."
weight: 3
bookToC: false
---
<div class="lx-kicker-line">$ curl -H "traceparent: 00-4bf92f35…-00f067aa…-01" /checkout</div>

# Tracing

**Distributed tracing** records the path of a single request or job as it moves through many services, with the timing of every step. One request produces one **trace**; each unit of work inside it (an HTTP call, a SQL query, a Kafka publish) is a **span** with a start time, a duration, a parent and attributes. Lined up on a timeline, the spans show exactly where the time went and which call failed, something neither logs nor metrics show on their own.

## Reading a trace

{{< fig kicker="$ open jaeger → trace 4bf92f35…" title="A slow checkout, span by span" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
<text x="16" y="34" class="m" font-size="11" fill="#5C5869">SERVICE · OPERATION</text>
<line x1="250" y1="42" x2="250" y2="300" stroke="#E7E7EF" stroke-dasharray="3 4"/><text x="250" y="34" text-anchor="middle" class="m" font-size="11" fill="#8C8899">0 ms</text>
<line x1="350" y1="42" x2="350" y2="300" stroke="#E7E7EF" stroke-dasharray="3 4"/><text x="350" y="34" text-anchor="middle" class="m" font-size="11" fill="#8C8899">100 ms</text>
<line x1="450" y1="42" x2="450" y2="300" stroke="#E7E7EF" stroke-dasharray="3 4"/><text x="450" y="34" text-anchor="middle" class="m" font-size="11" fill="#8C8899">200 ms</text>
<line x1="550" y1="42" x2="550" y2="300" stroke="#E7E7EF" stroke-dasharray="3 4"/><text x="550" y="34" text-anchor="middle" class="m" font-size="11" fill="#8C8899">300 ms</text>
<line x1="650" y1="42" x2="650" y2="300" stroke="#E7E7EF" stroke-dasharray="3 4"/><text x="650" y="34" text-anchor="middle" class="m" font-size="11" fill="#8C8899">400 ms</text>
<line x1="250" y1="42" x2="730" y2="42" stroke="#8C8899"/>
<text x="16" y="318" class="m" font-size="11" fill="#5C5869">trace_id 4bf92f3577b34da6a3ce929d0e0e4736 · 7 spans</text>
<g class="f" data-step="1"><text x="16" y="71" class="m" font-size="11" fill="#17151F"><tspan font-weight="700">api-gateway</tspan> GET /checkout</text><rect x="250" y="56" width="480" height="22" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="258" y="71" class="m" font-size="11" fill="#531A8A">480 ms</text></g>
<g class="f" data-step="1"><text x="28" y="107" class="m" font-size="11" fill="#17151F"><tspan font-weight="700">orders-svc</tspan> create_order</text><rect x="262" y="92" width="458" height="22" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="270" y="107" class="m" font-size="11" fill="#531A8A">458 ms</text></g>
<g class="f" data-step="2"><text x="40" y="143" class="m" font-size="11" fill="#17151F"><tspan font-weight="700">postgres</tspan> INSERT orders</text><rect x="275" y="128" width="45" height="22" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="326" y="143" class="m" font-size="11" fill="#3D3A49">45 ms</text></g>
<g class="f" data-step="3"><text x="40" y="179" class="m" font-size="11" fill="#17151F"><tspan font-weight="700">payment-svc</tspan> charge</text><rect x="335" y="164" width="335" height="22" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="343" y="179" class="m" font-size="11" fill="#531A8A">335 ms</text></g>
<g class="f" data-step="4"><text x="52" y="215" class="m" font-size="11" fill="#17151F"><tspan font-weight="700">bank-api</tspan> authorize #1</text><rect x="345" y="200" width="200" height="22" rx="4" fill="#FCEDEB" stroke="#C2382F" stroke-width="1.4"/><text x="353" y="215" class="m" font-size="11" fill="#C2382F">timeout · 200 ms</text></g>
<g class="f" data-step="4"><text x="52" y="251" class="m" font-size="11" fill="#17151F"><tspan font-weight="700">bank-api</tspan> authorize #2</text><rect x="555" y="236" width="105" height="22" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="563" y="251" class="m" font-size="11" fill="#531A8A">105 ms</text></g>
<g class="f" data-step="5"><text x="40" y="287" class="m" font-size="11" fill="#17151F"><tspan font-weight="700">kafka</tspan> produce order.created</text><rect x="682" y="272" width="16" height="22" rx="4" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="704" y="287" class="m" font-size="11" fill="#3D3A49">16 ms</text></g>
<g class="f" data-step="5"><text x="730" y="318" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#531A8A">200 of 480 ms spent waiting on one timeout</text></g>
</svg>
<ol class="lx-caps">
  <li>A checkout request took <b>480 ms</b>. The gateway created a <b>trace_id</b> and every service will attach its spans to it.</li>
  <li>The root span is the gateway's <b>GET /checkout</b>. Its child, <b>orders-svc create_order</b>, covers almost the same window: the work happens below it.</li>
  <li>The <b>postgres INSERT</b> takes 45 ms. Not our problem.</li>
  <li><b>payment-svc charge</b> takes 335 ms, most of the request. Drill into its children.</li>
  <li>The first call to the bank API <b>timed out after 200 ms</b>; a retry then succeeded in 105 ms. The trace shows the cause directly: a <b>timeout plus retry</b>, not a slow database.</li>
  <li>Finally the order event is <b>produced to Kafka</b>. Fix: lower the bank timeout or call it asynchronously, and this request drops to under 300 ms.</li>
</ol>
{{< /fig >}}

## How it works: context propagation

A trace only connects across services if each hop **passes the trace context along**. The W3C **Trace Context** standard defines a `traceparent` header:

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ver  trace-id (same for the whole trace) parent span-id   sampled
```

Instrumentation libraries read this header on incoming requests, create child spans, and inject it into outgoing HTTP calls, gRPC metadata or **Kafka message headers**. When any service in the chain drops the header, the trace breaks into pieces.

## OpenTelemetry

**OpenTelemetry (OTel)** is the standard way to produce traces. It provides SDKs and **auto-instrumentation** for most languages (Python, Java, Go, Node.js, .NET...) and popular libraries (HTTP clients, database drivers, Kafka clients), plus the **Collector** to batch, sample and export spans to any backend over **OTLP**. It replaced the earlier OpenTracing and OpenCensus projects, which are archived.

```python
from opentelemetry import trace
tracer = trace.get_tracer("orders-loader")

with tracer.start_as_current_span("load_partition") as span:
    span.set_attribute("table", "orders")
    span.set_attribute("partition", "2026-11-16")
    rows = load()                      # child spans from instrumented DB driver
    span.set_attribute("rows", rows)
```

## Sampling

Tracing every request in a high-traffic system is expensive. Two strategies:

- **Head sampling**: decide at the start (keep 1% of traces). Cheap, but you may throw away the rare slow or failing request.
- **Tail sampling**: buffer all spans in the Collector and decide after the trace completes (keep all errors, all requests over 1 s, and 1% of the rest). Better signal, more infrastructure.

## Tracing in data pipelines

Traces are not just for web requests. Useful data-engineering cases:

- Follow an event from the producer, through Kafka, into a stream processor and the sink, by propagating context in message headers.
- Wrap each Airflow task or Dagster op in a span to see which step of a DAG run is slow.
- Trace query engines: Trino and many databases can emit spans for query planning and execution stages.

## Backends

| Backend | Notes |
|---|---|
| **Jaeger** | CNCF graduated, created at Uber. Jaeger v2 is built on the OpenTelemetry Collector. |
| **Grafana Tempo** | Stores traces cheaply in object storage, indexes little; pairs with Grafana, Loki and Prometheus. |
| **Zipkin** | The original open-source tracer, inspired by Google's Dapper paper. Simple and stable. |
| **Honeycomb**, **Datadog APM**, **Splunk Observability**, **New Relic** | Commercial, with strong high-cardinality querying and analysis. |

## Common mistakes

- **Broken propagation.** Async queues, thread pools and custom HTTP clients often drop context. Check that one trace actually spans every service.
- **Spans for everything.** A span per row or per loop iteration explodes cost. Span the meaningful units: a request, a batch, a query.
- **No link to logs.** Put `trace_id` and `span_id` in every log line so you can jump from a slow span to its logs.
- **Sensitive attributes.** SQL with literal values, emails or tokens in span attributes leak data. Sanitize in the SDK or Collector.

## Learning Resources

### Papers and standards

- [Dapper, a Large-Scale Distributed Systems Tracing Infrastructure (Google, 2010)](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)

### Official

- [OpenTelemetry: traces concepts](https://opentelemetry.io/docs/concepts/signals/traces/) and [Collector](https://opentelemetry.io/docs/collector/)
- [Jaeger documentation](https://www.jaegertracing.io/docs/latest/)
- [Grafana Tempo documentation](https://grafana.com/docs/tempo/latest/)

### Books

- *Mastering Distributed Tracing*, Yuri Shkuro (Packt): by Jaeger's creator
- *Learning OpenTelemetry*, Ted Young and Austin Parker (O'Reilly)
- [Distributed Systems Observability, Cindy Sridharan (O'Reilly report)](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)

See also: [Logging]({{< relref "../logging" >}}), [Monitoring]({{< relref "../monitoring" >}}).
