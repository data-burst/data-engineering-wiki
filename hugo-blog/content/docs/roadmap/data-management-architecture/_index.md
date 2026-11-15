---
bookCollapseSection: true
weight: 13
description: "Data management architectures compared: relational data warehouse, data lake, modern data warehouse, data mart, lakehouse, data fabric and data mesh."
---

# Data Management Architecture

A **data management architecture** is the overall plan for where analytical data lands, how it is stored and transformed, and who owns and serves it. The patterns below evolved over four decades, and each one answered a weakness of the previous. Most real platforms in 2026 combine several of them: a lakehouse for storage, star schemas and marts for consumption, and mesh-style ownership for the organization.

## The patterns at a glance

| Architecture | Core idea | Emerged | Strength | Weak spot |
|---|---|---|---|---|
| [Relational data warehouse]({{< relref "/docs/roadmap/data-management-architecture/relational-data-warehouse" >}}) | Clean, modeled, SQL tables in one database | 1990s | Trusted numbers, fast SQL | Rigid, expensive, structured data only |
| [Data lake]({{< relref "/docs/roadmap/data-management-architecture/data-lake" >}}) | Store raw files of any type cheaply | 2010s | Cheap, flexible, ML-friendly | No transactions, can become a swamp |
| [Modern data warehouse]({{< relref "/docs/roadmap/data-management-architecture/modern-data-warehouse" >}}) | Lake for raw data + warehouse for serving | Late 2010s | Best of both | Two copies, two systems |
| [Data mart]({{< relref "/docs/roadmap/data-management-architecture/data-mart" >}}) | Subject-specific slice for one team | 1990s | Simple, focused | Silos if not conformed |
| [Data lakehouse]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}}) | Warehouse features on open lake files | 2020s | One copy, open formats, ACID | Table maintenance, newer tooling |
| [Data fabric]({{< relref "/docs/roadmap/data-management-architecture/data-fabric" >}}) | Metadata-driven layer that connects all sources | 2020s | Unified access and governance | Vague term, vendor-heavy |
| [Data mesh]({{< relref "/docs/roadmap/data-management-architecture/data-mesh" >}}) | Domains own and publish data products | 2019+ | Scales with the organization | Needs maturity and a strong platform |

Note that the last two are different in kind. Warehouse, lake and lakehouse describe **technology**. Fabric describes an **integration and metadata layer**. Mesh describes an **organizational model**: who owns what.

## How to read this section

Start with the relational warehouse and the data lake: every later pattern is a mix of the two. Then read the lakehouse page, which is where most new platforms start today. Data mesh is worth reading once your platform team becomes a bottleneck for many domain teams.

## Learning Resources

- [Deciphering Data Architectures](https://www.oreilly.com/library/view/deciphering-data-architectures/9781098150754/): James Serra, covers every pattern in this section
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/): Joe Reis and Matt Housley
- [Lakehouse: A New Generation of Open Platforms (CIDR 2021)](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)
