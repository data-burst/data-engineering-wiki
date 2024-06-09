---
weight: 19
title: "Data Processing"
---

# Data Processing

## Introduction

Data processing in the field of data engineering refers to the collection and manipulation of raw data to produce meaningful information. It involves the conversion of raw data into machine-readable form, flow of data through the CPU and memory, construction of output, and the interpretation of the output. Data processing functions include validation, sorting, summarization, aggregation, analysis, reporting, and classification.

## Tools

Data processing tools in data engineering can be categorized into three types: Batch, Hybrid, and Stream.

### Batch

Batch processing is a method where data is collected, processed in bulk, and then the results are produced. The tools used for batch processing include:

- **Apache Arrow**: A cross-language development platform for in-memory data.
- **Data Build Tool (dbt)**: A command-line tool that enables data analysts and engineers to transform data in their warehouses more effectively.

### Hybrid

Hybrid processing combines both batch and stream processing methods. The tools used for hybrid processing include:

- **Apache Spark**: An open-source, distributed computing system used for big data processing and analytics.
- **Apache Beam**: A model and set of language-specific SDKs for defining and executing data processing workflows.
- **Apache Flink**: An open-source stream processing framework for high-performance, reliable, and real-time data streaming applications.
- **Apache Nifi**: A software project from the Apache Software Foundation designed to automate the flow of data between software systems.

### Stream

Stream processing is a method where data is continuously processed, with new data affecting the computation as it arrives. The tools used for stream processing include:

- **Apache Kafka**: A distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications.
- **Apache Storm**: A free and open-source distributed real-time computation system.
- **Apache Samza**: A distributed stream processing framework that uses Apache Kafka for messaging, and Apache Hadoop YARN to provide fault tolerance, processor isolation, security, and resource management.
- **Amazon Kinesis**: A fully managed service for real-time processing of streaming data at a massive scale provided by Amazon Web Services (AWS).

## Learning resources

### Books

- [Spark in Action](https://www.manning.com/books/spark-in-action-second-edition)
- [Kafka: The Definitive Guide, 2nd Edition](https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/)
- [Event Streams in Action](https://www.amazon.com/dp/1617292346?linkCode=gs2&tag=uuid0a-21)
