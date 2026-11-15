---
title: "Container Orchestration"
description: "What container orchestrators do (scheduling, self-healing, scaling, rollouts), how desired-state reconciliation works, and Kubernetes vs Swarm vs Mesos."
bookCollapseSection: true
weight: 25
---

# Container Orchestration

A **container orchestrator** runs containers across a cluster of machines for you. You declare **what** should run ("three copies of the ingestion API, each with 1 CPU and 2 GB, reachable at `ingest:8080`"), and the orchestrator decides **where** to run them, restarts them when they crash, moves them when a machine dies, and rolls out new versions without downtime.

Running one container on one machine is easy (see [Containerization]({{< relref "../containerization" >}})). Running hundreds across dozens of machines, through failures and deploys, is what orchestrators exist for.

## The core idea: desired state

Every modern orchestrator runs a **reconciliation loop**:

1. You store a **desired state** (for example `replicas: 3`).
2. Controllers continuously **observe** the actual state of the cluster.
3. When they differ, controllers **act** to close the gap: start a container, kill one, reschedule one.

Because the loop never stops, the same mechanism handles a first deploy, a crashed process and a dead server. The [Kubernetes]({{< relref "kubernetes" >}}) page animates it.

## What an orchestrator handles

| Job | What it means |
|---|---|
| Scheduling | Pick a node with enough free CPU and memory, respecting constraints (GPU, zone, spread) |
| Self-healing | Restart failed containers; replace ones lost with a dead node |
| Scaling | Change replica counts by hand or automatically from metrics |
| Service discovery and load balancing | Give a stable name and IP to a changing set of containers |
| Rollouts and rollbacks | Replace versions gradually; stop and revert when health checks fail |
| Config and secrets | Inject settings and credentials without baking them into images |
| Storage | Attach persistent volumes that follow the workload |

## Comparing the options (2026)

| | Kubernetes | Docker Swarm | Apache Mesos |
|---|---|---|---|
| Status | De facto standard, CNCF graduated | Maintained (in Docker Engine; Mirantis supports it commercially), small ecosystem | **Retired** to the Apache Attic |
| Learning curve | Steep | Gentle: Docker CLI and Compose files | Steep (plus a framework like Marathon) |
| Managed offerings | EKS, GKE, AKS and many more | Few | None |
| Data ecosystem | Spark, Flink, Kafka (Strimzi), Airflow, Trino operators and Helm charts | Minimal | Historical (Spark 4.0 removed Mesos support) |
| Choose it when | Almost always, for new platforms | Small teams, a few hosts, simple services | Only to maintain an existing legacy cluster |

For data platforms the answer is almost always Kubernetes, often a managed one. Serverless container services (AWS Fargate, Google Cloud Run, Azure Container Apps) are a reasonable alternative when you do not want to run a cluster at all.

## What is in this section

- [Kubernetes]({{< relref "kubernetes" >}}): Pods, Deployments, the scheduler and self-healing, animated; plus how data workloads run on it.
- [Docker Swarm]({{< relref "docker-swarm" >}}): Docker's built-in clustering mode, and where it still fits.
- [Apache Mesos]({{< relref "apache-mesos" >}}): two-level scheduling, its history in big data, and why it was retired.

## Learning Resources

- [What is container orchestration? (Google Cloud)](https://cloud.google.com/discover/what-is-container-orchestration)
- [Borg, Omega, and Kubernetes (ACM Queue paper)](https://queue.acm.org/detail.cfm?id=2898444): lessons from a decade of Google's orchestrators
- [Container Orchestration Explained (IBM, YouTube)](https://www.youtube.com/watch?v=kBF6Bvth0zw)
