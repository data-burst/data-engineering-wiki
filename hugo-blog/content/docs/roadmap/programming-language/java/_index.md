---
title: "Java"
description: "Why Java runs the big-data engine room: Kafka, Flink, Trino, Iceberg on the JVM, modern Java features (LTS releases, virtual threads), GC and JVM tuning basics."
weight: 2
---

# Java

**Java** is a statically typed, object-oriented language that compiles to bytecode and runs on the **Java Virtual Machine (JVM)**. The JVM's just-in-time compiler, mature garbage collectors and decades of tooling made it the platform the big-data ecosystem was built on: **Kafka, Flink, Trino, Iceberg, Hadoop, Cassandra and Elasticsearch** are all Java (Spark runs on the JVM too, in Scala). Even when you drive these systems from Python or SQL, they run on a JVM you have to configure, monitor and debug.

## What Java is used for in data engineering

| Use | Examples |
|---|---|
| Stream processing | Kafka Streams, Flink DataStream jobs |
| Connectors and plugins | Kafka Connect connectors, Trino connectors, Flink sources/sinks, custom Hive or Spark UDFs |
| Table formats and catalogs | Iceberg's reference implementation, Apache Polaris, Nessie |
| High-throughput services | Ingestion APIs and consumers where latency and throughput matter |
| Operating JVM systems | Reading stack traces, tuning heap and GC for Kafka brokers and Trino workers |

## Modern Java (it is not 2010 Java)

Java ships a release every six months, with a **Long-Term Support (LTS)** version every two years: **17**, **21** and **25** (September 2025) are the LTS lines that matter. Current data systems require recent Java: Spark 4 and Kafka 4 brokers need Java 17 or newer.

Features worth knowing:

- **Records** (`record Order(long id, String city, BigDecimal amount) {}`) for concise immutable data classes.
- **Pattern matching** for `switch` and `instanceof`, plus **sealed** types.
- **Virtual threads** (Java 21): millions of cheap threads, making simple blocking I/O code scale like async code.
- **`var`** for local type inference, text blocks for embedded SQL.
- The **Foreign Function & Memory API** (Java 22): fast off-heap memory and native calls, used by engines for columnar data.

```java
record Order(long id, String city, double amount) {}

var revenueByCity = orders.stream()
    .filter(o -> o.amount() > 0)
    .collect(Collectors.groupingBy(Order::city, Collectors.summingDouble(Order::amount)));
```

## The JVM operator's checklist

- **Heap size**: set `-Xmx` deliberately; in containers, Java respects cgroup memory limits, and `-XX:MaxRAMPercentage` sizes the heap relative to the container.
- **Garbage collector**: **G1** is the default; **ZGC** (generational since Java 21) gives very low pause times for large heaps such as Trino workers.
- **Diagnostics**: `jcmd`, Java Flight Recorder and heap dumps explain most memory and latency problems.
- **Build tools**: Maven and Gradle; dependency conflicts ("jar hell") are a common source of connector failures, solved with shading or isolated plugin class loaders.

## Common mistakes

- **Ignoring GC pauses.** Long stop-the-world pauses look like network timeouts: consumers leave their group, nodes are marked dead.
- **Too-large heaps for Kafka brokers.** Kafka relies on the OS page cache; leave most memory to the OS, not the heap.
- **Using `double` for money.** Use `BigDecimal` or integer cents.
- **Old Java in containers.** Very old JVMs ignored container limits and got OOM-killed. Stay on a supported LTS.

## Learning Resources

### Official

- [Dev.java: learn Java](https://dev.java/learn/): the official, modern tutorial
- [JDK release notes and JEPs](https://openjdk.org/projects/jdk/)

### Books

- *Effective Java*, 3rd ed., Joshua Bloch (Addison-Wesley)
- *Head First Java*, 3rd ed., Kathy Sierra, Bert Bates and Trisha Gee (O'Reilly)
- *Optimizing Cloud Native Java*, 2nd ed., Benjamin Evans and James Gough (O'Reilly): JVM performance and GC

### Courses

- [Java Programming MOOC, University of Helsinki](https://java-programming.mooc.fi/)
- [Kafka Streams 101 (Confluent Developer)](https://developer.confluent.io/courses/kafka-streams/get-started/)
