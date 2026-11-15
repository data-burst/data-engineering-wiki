---
title: "Scala"
description: "Scala in data engineering in 2026: its role in Apache Spark, functional programming on the JVM, Scala 2.13 vs 3, and when Scala still beats PySpark."
weight: 50
---

# Scala

**Scala** is a statically typed language for the JVM that combines object-oriented and functional programming: immutable values, pattern matching, powerful collections and a strong type system, with full access to Java libraries. Its place in data engineering comes mostly from one project: **Apache Spark is written in Scala**, and for years the Scala API was the first-class way to write Spark jobs.

## Where Scala stands in 2026

Scala is still important, but its role has narrowed:

- **Spark** remains Scala inside. Spark 4.0 (2025) builds on **Scala 2.13** only and dropped 2.12. Spark does not officially support Scala 3 yet.
- **PySpark and Spark SQL** are now the most common way to write new Spark jobs. The DataFrame API compiles to the same plans whatever the language, so performance is usually the same, except for Python UDFs.
- **Flink** removed its Scala APIs in Flink 2.0 (2025); Scala users call the Java API instead.
- **Kafka** has Scala in its broker history, but new code is Java.
- **Akka** moved to a commercial license in 2022; the open-source fork **Apache Pekko** carries on.

So: learn Scala if you work on an existing Scala Spark codebase, contribute to Spark itself, or need typed Datasets and fast JVM UDFs. For a new data team, PySpark is usually the more practical default.

## Why teams still choose Scala for Spark

| | Scala Spark | PySpark |
|---|---|---|
| Type safety | Typed `Dataset[T]`: many errors at compile time | Runtime errors only |
| UDF performance | Native JVM speed | Python UDFs cross a process boundary (Arrow-based pandas UDFs reduce the cost) |
| Access to internals | Full: custom data sources, catalyst rules, listeners | Through public APIs only |
| Hiring and ecosystem | Smaller pool | Large pool, rich Python libraries |
| DataFrame/SQL performance | Same | Same |

```scala
import spark.implicits._                 // encoders for case classes

case class Order(id: Long, city: String, amount: Double)

val revenueByCity = spark.read.parquet("s3://acme-lake/orders/")
  .as[Order]                             // typed Dataset: field typos fail at compile time
  .filter(_.amount > 0)
  .groupByKey(_.city)
  .mapValues(_.amount)
  .reduceGroups(_ + _)
```

## Scala 2 vs Scala 3

**Scala 3** (2021) simplified the language: cleaner syntax (optional braces), `given`/`using` instead of implicits, enums, and a new macro system. It is the version to learn for general Scala, but the data ecosystem, Spark above all, still lives on **2.13**. Scala 3 can consume 2.13 libraries, which eases mixing.

Build tools: **sbt** is the traditional one; **Mill** and **scala-cli** are simpler alternatives.

## Common mistakes

- **Mismatched Scala binary versions.** A library built for `_2.12` will not load on a `_2.13` Spark. Match the suffix in every dependency.
- **Over-clever code.** Heavy implicits and type-level tricks make pipelines hard for the next engineer to maintain.
- **Using RDDs for new code.** DataFrames and Datasets get Catalyst optimization; RDDs do not.
- **`collect()` on large datasets.** It pulls everything into the driver and kills it.

## Learning Resources

### Official

- [Scala 3 Book](https://docs.scala-lang.org/scala3/book/introduction.html)
- [Spark: Scala API and programming guide](https://spark.apache.org/docs/latest/sql-programming-guide.html)
- [Scala Exercises](https://www.scala-exercises.org/)

### Books

- *Programming in Scala*, 5th ed., Martin Odersky, Lex Spoon, Bill Venners and Frank Sommers (Artima)
- [Programming Scala, 3rd ed., Dean Wampler](https://deanwampler.github.io/books/programmingscala.html)
- [Scala for the Impatient, 3rd ed., Cay Horstmann](https://horstmann.com/scala/)
- *Spark: The Definitive Guide*, Bill Chambers and Matei Zaharia (O'Reilly)

### Courses

- [Functional Programming Principles in Scala (EPFL, Coursera)](https://www.coursera.org/learn/scala-functional-programming)
- [Scala Crash Course, Rock the JVM](https://www.youtube.com/watch?v=-xRfJcwhy7A)
