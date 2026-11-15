---
title: "Docker Swarm"
description: "Docker Swarm mode explained: managers, workers, services and tasks, Raft consensus, overlay networks and the routing mesh, and when Swarm still fits."
weight: 2
---

# Docker Swarm

**Docker Swarm mode** is the clustering and orchestration feature built into Docker Engine. Run `docker swarm init` on one machine, `docker swarm join` on the others, and a group of Docker hosts becomes one cluster that runs replicated **services** from familiar Compose files. No extra software is needed.

Do not confuse it with the original standalone "Docker Swarm" (2014–2017), a separate product that is long deprecated. Everything here is about Swarm **mode**, which has shipped inside Docker Engine since 1.12 and is still maintained (Mirantis, which acquired Docker's enterprise business, has committed to supporting it).

## How it works

| Concept | Meaning |
|---|---|
| **Manager node** | Stores cluster state and schedules work. Managers agree on state with the **Raft** consensus protocol. |
| **Worker node** | Runs containers it is assigned. Managers can also run workloads. |
| **Service** | Desired state: image, replica count, ports, networks, update policy. |
| **Task** | One scheduled container of a service. If it dies, the manager creates a new task. |
| **Stack** | A group of services deployed from one Compose file (`docker stack deploy`). |

Like [Kubernetes]({{< relref "../kubernetes" >}}), Swarm reconciles desired state: if a node disappears, its tasks are rescheduled elsewhere. Because managers use Raft, run **3 or 5** managers; a cluster stays writable only while a majority (2 of 3, 3 of 5) is reachable. See [Replication]({{< relref "../../distributed-systems-concepts/replication" >}}) for why majorities matter.

Networking is built in: **overlay networks** connect containers across hosts, every service gets a DNS name and virtual IP, and the **routing mesh** makes a published port answer on every node and forwards to a healthy replica.

```bash
docker swarm init --advertise-addr 10.0.0.1
docker service create --name ingest --replicas 3 -p 8080:8080 registry.example.com/ingest:2.4
docker service scale ingest=5
docker service update --image registry.example.com/ingest:2.5 --update-parallelism 1 ingest
docker stack deploy -c compose.yaml pipeline
```

## Swarm vs Kubernetes

| | Docker Swarm | Kubernetes |
|---|---|---|
| Setup | Two commands | A project (or a managed service) |
| Config format | Compose YAML | Kubernetes manifests, Helm charts |
| Autoscaling | None built in | Horizontal Pod Autoscaler, cluster autoscaler |
| Stateful workloads | Basic volumes | StatefulSets, CSI drivers, operators |
| Ecosystem | Small | Huge: operators for Spark, Kafka, Flink, Airflow |
| Managed cloud offering | Practically none | EKS, GKE, AKS and others |

**Use Swarm** for a small team running a handful of stateless services on a few VMs, where Kubernetes would be overkill. **Use Kubernetes** for anything that needs autoscaling, operators, managed hosting or a hiring pool that already knows it, which covers most data platforms.

## Common mistakes

- **Even number of managers.** Two managers tolerate zero failures, same as one. Use 3 or 5.
- **Expecting Compose features to carry over.** `build:` is ignored by `docker stack deploy`; images must be pre-built and pushed. Some keys behave differently under `deploy:`.
- **Local volumes for stateful services.** A rescheduled task lands on another node with an empty volume. Pin with placement constraints or use shared storage.

## Learning Resources

- [Swarm mode overview (Docker docs)](https://docs.docker.com/engine/swarm/) and [Swarm tutorial](https://docs.docker.com/engine/swarm/swarm-tutorial/)
- [Raft consensus algorithm](https://raft.github.io/)
- [Docker Swarm Rocks](https://dockerswarm.rocks/): practical recipes (some are dated, check versions)
- [Docker Swarm Tutorial for Beginners (YouTube)](https://www.youtube.com/watch?v=YYfefejSgWY)
- [The DevOps 2.1 Toolkit: Docker Swarm, Viktor Farcic](https://leanpub.com/the-devops-2-1-toolkit)
