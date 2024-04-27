---
title: "NewSQL"
weight: 7
---

# NewSQL 

## Introduction

NewSQL databases represent a new generation of relational databases that aim to combine the best of both worlds: the scalability of NoSQL databases and the ACID properties of traditional SQL databases. In this blog post, we'll explore what NewSQL databases are, their advantages, and some popular tools in this space.

## What are NewSQL Databases?

NewSQL databases are designed to address the limitations of traditional relational databases when it comes to scalability. They provide horizontal scalability by distributing data across multiple nodes while maintaining strong consistency and transaction support. Unlike NoSQL databases, NewSQL databases adhere to the relational data model and SQL query language.

## Google Spanner

**[Google Spanner](https://cloud.google.com/spanner)** is a globally distributed NewSQL database developed by Google. It combines the scalability of NoSQL databases with the consistency guarantees of traditional SQL databases. Spanner uses a combination of TrueTime (a synchronized global clock) and two-phase commit to achieve strong consistency across data centers. It's an excellent choice for applications that require high availability and global scalability.

## CockroachDB

**[CockroachDB](https://www.cockroachlabs.com/)** is an open-source NewSQL database inspired by Google Spanner. It provides distributed SQL capabilities, automatic sharding, and strong consistency. CockroachDB is designed to be resilient to failures, and it can automatically rebalance data across nodes. Developers can use familiar SQL queries to interact with CockroachDB, making it an attractive option for modern applications.

## Learning Resources

### Courses

- [Coursera: "Databases and SQL for Data Science"](https://www.coursera.org/learn/sql-data-science%29): This free course introduces SQL and relational databases, including NewSQL concepts.

### Miscellaneous
- [Introduction of NewSQL](https://www.geeksforgeeks.org/introduction-of-newsql-set-2/)
- [CockroachDB Docs](https://www.cockroachlabs.com/docs/stable/)
- [Spanner documentation](https://cloud.google.com/spanner/docs)
- [Introduction to CockroachDB](https://www.youtube.com/playlist?list=PL_QaflmEF2e9TOGdLzU388Kt77HyW0as5)