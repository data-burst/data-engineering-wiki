---
weight: 7
title: Data Mesh
description: "Data mesh explained: domain ownership, data as a product, a self-serve platform and federated governance, plus when it helps and when it is overkill."
---

# Data Mesh

**Data mesh** is a way to organize analytical data around business **domains** instead of a central data team. Each domain (orders, payments, logistics) owns its data end to end and publishes it as **data products** that other teams can discover and trust, on top of a shared self-serve platform. Zhamak Dehghani introduced it in 2019 to fix a scaling problem: one central team cannot understand, clean and serve data for an entire company fast enough.

## The four principles

<div class="lx-cards">
  <div class="lx-card"><div class="lab">1 · Domain ownership</div><h4>The team that creates data owns it</h4><p>The payments team owns payment data, its quality and its schema, just as it owns the payments service.</p></div>
  <div class="lx-card"><div class="lab">2 · Data as a product</div><h4>Published, documented, reliable</h4><p>A data product has an owner, a contract (schema, freshness, quality SLOs), docs and versioning.</p></div>
  <div class="lx-card"><div class="lab">3 · Self-serve platform</div><h4>Paved roads for every domain</h4><p>A platform team provides storage, pipelines, catalog, access control and monitoring as a service.</p></div>
  <div class="lx-card"><div class="lab">4 · Federated governance</div><h4>Global rules, enforced by code</h4><p>Domains agree on standards (IDs, PII handling, interoperability) and the platform enforces them automatically.</p></div>
</div>

## What a data product contains

- **Data**: one or more tables or streams, for example `orders.daily_orders` as an Iceberg table and an `order_events` Kafka topic.
- **Contract**: schema, semantics, freshness and quality guarantees, and a versioning policy for breaking changes.
- **Metadata**: owner, description, lineage, classification, registered in the catalog.
- **Access**: SQL, files or API, with permissions managed by policy.
- **Observability**: tests and monitors that show whether the guarantees hold.

## Centralized platform vs data mesh

| | Central data team | Data mesh |
|---|---|---|
| Who builds pipelines | Central data engineers | Domain teams, using the platform |
| Bottleneck | Central team backlog | Domain skills and platform maturity |
| Domain knowledge | Second-hand | First-hand |
| Consistency | Easier | Requires strong federated governance |
| Good for | Small to mid-size companies | Many domains, many teams |

## When it helps and when it doesn't

Data mesh fits large organizations where the central team is a clear bottleneck, domains are well defined, and domain teams have (or can hire) data engineering skills. For a company with one data team of five people, it is mostly overhead: a well-run central platform with clear ownership per dataset gives most of the benefit.

## Common mistakes

- **Renaming without changing**: calling existing tables "data products" with no owner, contract or SLO.
- **Skipping the platform**: asking every domain to build its own pipelines and infrastructure from scratch.
- **Governance only on paper**: standards that are not enforced in CI, the catalog and access control.
- **Treating mesh as a technology** you can buy, rather than an operating model.

## Learning Resources

### Books
- [Data Mesh: Delivering Data-Driven Value at Scale](https://www.oreilly.com/library/view/data-mesh/9781492092384/): Zhamak Dehghani
- [Deciphering Data Architectures](https://www.oreilly.com/library/view/deciphering-data-architectures/9781098150754/): James Serra, includes a critical take on adopting mesh

### Articles
- [How to Move Beyond a Monolithic Data Lake to a Distributed Data Mesh](https://martinfowler.com/articles/data-monolith-to-mesh.html): the original article
- [Data Mesh Principles and Logical Architecture](https://martinfowler.com/articles/data-mesh-principles.html)
