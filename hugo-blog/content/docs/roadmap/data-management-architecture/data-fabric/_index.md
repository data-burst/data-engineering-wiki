---
weight: 4
title: Data Fabric
description: "What a data fabric is: a metadata-driven layer that connects, catalogs, governs and serves data across many systems, and how it differs from data mesh."
---

# Data Fabric

A **data fabric** is an architecture that connects data across many systems (warehouses, lakes, databases, SaaS apps, clouds) through a shared layer of **metadata, governance and access services**, instead of first copying everything into one place. Users and tools find data in one catalog, get one set of access rules, and query or move it through common integration services. The term was popularized by Gartner and is used mostly by vendors and large enterprises; it describes a set of capabilities rather than one product.

## The building blocks

- **Active metadata and a catalog**: technical metadata (schemas, lineage, usage statistics) collected automatically from every system, plus business metadata (glossary terms, owners).
- **Knowledge graph**: links datasets, columns, terms, people and policies so the platform can recommend related data or detect sensitive columns.
- **Integration services**: batch [ETL/ELT]({{< relref "/docs/roadmap/data-integration" >}}), streaming, [CDC]({{< relref "/docs/roadmap/data-integration/cdc" >}}) and **data virtualization** (query data where it lives through engines like [Trino]({{< relref "/docs/roadmap/query-engine/trino" >}}) or Denodo).
- **Unified governance**: one place to define access policies, masking and classification that is enforced across systems.
- **Delivery**: SQL, APIs and data products for BI, ML and applications.

## Data fabric vs data mesh

| | Data fabric | [Data mesh]({{< relref "/docs/roadmap/data-management-architecture/data-mesh" >}}) |
|---|---|---|
| Nature | Technology and metadata architecture | Organizational and ownership model |
| Who owns data | Often a central data team | Domain teams |
| Main lever | Automation through metadata | Accountability through data products |
| Can they coexist? | Yes: a fabric can be the self-serve platform a mesh needs | |

Note: **Microsoft Fabric** is a specific SaaS product (OneLake plus Spark, warehouse and Power BI workloads). It shares the name but is closer to a managed [lakehouse]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}}) platform than to the general architecture described here.

## When it fits

- Large organizations with data spread across many platforms and clouds that cannot be consolidated soon.
- Strong regulatory pressure for consistent classification, access control and lineage everywhere.

## Common mistakes

- Buying a "data fabric" product and expecting it to fix ownership and data quality problems on its own.
- Virtualizing everything: federated queries over slow operational databases can be expensive and fragile. Copy hot data, virtualize the long tail.
- Treating the catalog as a one-off documentation project instead of metadata collected automatically and kept current.

## Learning Resources

- [Deciphering Data Architectures (Chapter: Data Fabric)](https://www.oreilly.com/library/view/deciphering-data-architectures/9781098150754/): James Serra
- [Gartner: Data Fabric](https://www.gartner.com/en/data-analytics/topics/data-fabric)
- [IBM: What is a data fabric?](https://www.ibm.com/topics/data-fabric)
- [OpenMetadata](https://open-metadata.org/) and [DataHub](https://datahubproject.io/): open-source metadata platforms often used as the catalog layer
