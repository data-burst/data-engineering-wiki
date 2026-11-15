---
title: "Graph"
description: "How graph databases model nodes and relationships, why multi-hop queries are fast, Cypher and the GQL standard, and when Neo4j beats SQL joins."
weight: 6
---

# Graph Databases

A **graph database** stores data as **nodes** (people, accounts, products) and **relationships** between them (`FOLLOWS`, `PAID`, `BOUGHT`), and both can carry properties. Its strength is queries that walk many hops: "friends of friends who bought this", "accounts within 4 transfers of a known fraudster", "which services break if this one goes down". In a relational database each hop is another join; in a native graph database each node points directly at its neighbours ("index-free adjacency"), so a hop costs roughly the same no matter how big the whole graph is.

## A query, two ways

Find people within two `FOLLOWS` hops of Sam.

```sql
-- SQL: one query per hop depth, one more self-join per hop
SELECT followee FROM follows WHERE follower = 'sam'          -- 1 hop
UNION
SELECT f2.followee                                           -- 2 hops
FROM follows f1
JOIN follows f2 ON f2.follower = f1.followee
WHERE f1.follower = 'sam';
```

```cypher
// Cypher (Neo4j): the pattern is the query
MATCH (:Person {name: 'sam'})-[:FOLLOWS*1..2]->(p:Person)
RETURN DISTINCT p.name;
```

Changing "2 hops" to "up to 6 hops" is a one-character edit in Cypher and a rewrite (or a recursive CTE) in SQL.

## Two kinds of graph model

| | Property graph | RDF (triple store) |
|---|---|---|
| Unit | Nodes and edges with properties | Subject, predicate, object triples |
| Query language | Cypher, GQL, Gremlin | SPARQL |
| Typical use | Applications: fraud, recommendations, network analysis | Knowledge graphs, linked open data, ontologies |
| Examples | Neo4j, Memgraph, Amazon Neptune, TigerGraph | GraphDB, Stardog, Amazon Neptune |

**GQL** (ISO/IEC 39075), published in 2024, is the first ISO standard graph query language and is largely based on Cypher. **SQL/PGQ** (part of SQL:2023) adds graph pattern matching on top of ordinary relational tables.

## Popular graph databases

- **[Neo4j](https://neo4j.com/)**: the best-known native graph database; Cypher, a large ecosystem and a graph data science library.
- **[Amazon Neptune](https://aws.amazon.com/neptune/)**: managed; supports property graphs (openCypher, Gremlin) and RDF (SPARQL).
- **[Memgraph](https://memgraph.com/)**: in-memory, Cypher-compatible, aimed at streaming and real-time analysis.
- **[Azure Cosmos DB for Apache Gremlin](https://learn.microsoft.com/en-us/azure/cosmos-db/gremlin/)**: graph API on a multi-model, globally distributed service.
- **Graph analytics without a graph database:** for one-off analysis on a lake, libraries like Spark GraphFrames or NetworkX are often enough.

## When to use one

- **Good fit:** fraud and anti-money-laundering rings, recommendation by shared behaviour, identity resolution, network and IT dependency maps, knowledge graphs for search and LLM grounding (GraphRAG).
- **Poor fit:** mostly tabular data with one or two joins, large aggregations over all rows (a columnar warehouse is far faster), or very high write throughput of simple records.

## Common mistakes

- Using a graph database because the data "has relationships". All data does. Use one when queries **traverse** several hops of variable depth.
- **Supernodes:** a node with millions of edges (a celebrity, a default "unknown" category) makes every traversal through it slow. Model around it.
- Forgetting that graph databases are usually harder to shard than key-value stores; plan for one large machine or a carefully partitioned graph.

## Learning Resources

- [Neo4j documentation](https://neo4j.com/docs/) and [Neo4j GraphAcademy](https://graphacademy.neo4j.com/): free courses
- *Graph Databases* (2nd ed.), Ian Robinson, Jim Webber and Emil Eifrem (free from Neo4j)
- [GQL standard overview](https://www.gqlstandards.org/)
- [Amazon Neptune documentation](https://docs.aws.amazon.com/neptune/)
- [Neo4j (Graph Database) Crash Course](https://www.youtube.com/watch?v=8jNPelugC2s): video
