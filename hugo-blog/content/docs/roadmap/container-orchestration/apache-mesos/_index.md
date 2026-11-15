---
title: "Apache Mesos"
description: "Apache Mesos and two-level scheduling: resource offers, frameworks like Marathon and Spark, why everyone moved to Kubernetes, and its 2025 retirement."
weight: 3
---

# Apache Mesos

**Apache Mesos** is an open-source cluster manager that pools the CPU, memory and disk of many machines and shares them between several distributed systems (called **frameworks**) at once. It came out of UC Berkeley's AMPLab in 2009, the same lab that produced Spark, and powered large clusters at Twitter, Airbnb, Apple and Uber in the early 2010s.

> **Status in 2026:** Mesos is **retired**. The Apache Software Foundation voted to retire it in August 2025 for lack of activity and moved it to the **Apache Attic** in October 2025. The code, docs and downloads stay online read-only, but there is no further development or security fixes. An earlier retirement vote in 2021 was reversed when volunteers stepped up; the 2025 one took effect. Learn Mesos for its ideas and to maintain legacy systems, not for new platforms.

## How it works: two-level scheduling

Mesos split scheduling into two levels, which was its key idea:

1. The **Mesos master** tracks free resources on **agents** (worker machines) and sends **resource offers** to frameworks: "agent 7 has 4 CPUs and 8 GB free".
2. Each **framework's scheduler** decides whether to accept the offer and which of its own tasks to launch there. The agent's **executor** then runs the tasks.

| Component | Role |
|---|---|
| Master (plus standbys, elected through ZooKeeper) | Tracks resources, makes offers |
| Agent | Runs on each machine, reports resources, launches tasks |
| Framework scheduler | Accepts or rejects offers with its own logic |
| Executor | Runs a framework's tasks on an agent |

This let very different systems share one cluster: **Marathon** for long-running services, **Chronos** or **Aurora** for scheduled jobs, and **Spark**, **Hadoop** and **Kafka** for data processing, each with its own scheduling rules.

## Why the industry moved on

Kubernetes took the opposite approach: **one central scheduler** plus extensible controllers and custom resources (operators). That proved easier to operate and to extend, and the ecosystem followed it:

- Mesosphere, the main commercial backer, renamed itself D2iQ in 2019, shifted to Kubernetes and ended DC/OS; **Marathon** was archived.
- Twitter, Apple and others migrated their Mesos fleets to Kubernetes.
- Spark deprecated its Mesos support in 3.2 and removed it in Spark 4.0, in favour of Kubernetes, YARN and standalone mode.

| | Apache Mesos | Kubernetes |
|---|---|---|
| Scheduling | Two-level: master offers, frameworks decide | Single scheduler, pluggable scoring |
| Extending it | Write a framework | Write a custom resource + controller (operator) |
| Unit of work | Task (framework-specific) | Pod (uniform) |
| Status | Retired (Apache Attic) | Active, CNCF graduated |

## What is still worth knowing

The **resource-offer** model and the paper behind it shaped later systems. Kubernetes' multi-scheduler support, YARN's application masters and Spark's dynamic allocation all solve the same problem Mesos named: many frameworks sharing one cluster fairly. Its **Dominant Resource Fairness (DRF)** allocation algorithm is still taught and used.

If you inherit a Mesos cluster today, plan a migration to [Kubernetes]({{< relref "../kubernetes" >}}); the frameworks around it (Marathon, Chronos, Apache Aurora) are archived or retired too.

## Learning Resources

- [Apache Attic: Mesos](https://attic.apache.org/projects/mesos.html): official retirement notice
- [Mesos: A Platform for Fine-Grained Resource Sharing in the Data Center (NSDI 2011)](https://www.usenix.org/conference/nsdi11/mesos-platform-fine-grained-resource-sharing-data-center): the original paper
- [Dominant Resource Fairness (NSDI 2011)](https://www.usenix.org/conference/nsdi11/dominant-resource-fairness-fair-allocation-multiple-resource-types)
- [Apache Mesos documentation (archived)](https://mesos.apache.org/documentation/latest/)
- [Mesos in Action (Manning)](https://www.manning.com/books/mesos-in-action): historical, for legacy clusters
