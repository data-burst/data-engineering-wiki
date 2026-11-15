---
title: "Kubernetes"
description: "Kubernetes for data engineers: Pods, Deployments, ReplicaSets, the scheduler and self-healing, animated, plus how Spark, Airflow and Kafka run on a cluster."
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ kubectl apply -f ingest.yaml</div>

# Kubernetes

**Kubernetes** (K8s) is an open-source platform that runs containers across a cluster of machines and keeps them in the state you declared. You write YAML that says "run three copies of this image", and Kubernetes places them on nodes, restarts them when they crash, replaces them when a node dies, and rolls out new versions. It grew out of Google's internal Borg system, was open-sourced in 2014, and is now the default way to run containerized platforms, including data platforms.

## The building blocks

| Object | What it is | Data-engineering example |
|---|---|---|
| **Pod** | One or more containers that share network and volumes; the unit Kubernetes schedules | A Spark executor, an Airflow task |
| **Deployment** | Keeps N identical, stateless Pods running and handles rolling updates | An ingestion API, a Kafka Connect worker |
| **ReplicaSet** | Created by a Deployment; owns the actual Pod count for one version | (Managed for you) |
| **StatefulSet** | Pods with stable names and their own persistent volumes | Kafka brokers and KRaft controllers, Postgres |
| **Job / CronJob** | Run Pods to completion, once or on a schedule | A nightly backfill, a dbt run |
| **Service** | Stable DNS name and virtual IP in front of a changing set of Pods | `trino.analytics.svc` |
| **ConfigMap / Secret** | Configuration and credentials injected into Pods | Warehouse connection strings |
| **PersistentVolumeClaim** | A request for durable storage | Broker log directories |
| **Namespace** | A folder for objects, with its own quotas and permissions | `team-ingest`, `airflow` |

The **control plane** (API server, etcd, scheduler, controller manager) stores the desired state and runs the reconciliation loops. Each **worker node** runs a **kubelet** that starts containers through a CRI runtime such as [containerd]({{< relref "../../containerization/containerd" >}}).

## Desired state in action

{{< fig kicker="$ kubectl apply -f ingest.yaml   # replicas: 3" title="Deployment → ReplicaSet → Pods, then a node dies" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <rect x="10" y="10" width="740" height="112" rx="10" fill="#F7F7FB" stroke="#E7E7EF"/>
  <text x="24" y="30" class="m" font-size="11" fill="#5C5869">CONTROL PLANE</text>
  <g class="f" data-step="1">
    <rect x="30" y="40" width="190" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="44" y="58" class="m" font-size="11" font-weight="700" fill="#531A8A">DEPLOYMENT</text>
    <text x="44" y="76" class="m" font-size="12" fill="#17151F">ingest · replicas: 3</text>
    <line x1="220" y1="62" x2="276" y2="62" stroke="#3D3A49" stroke-width="1.4"/><path d="M276 57 l8 5 l-8 5z" fill="#3D3A49"/>
    <rect x="286" y="40" width="190" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="300" y="58" class="m" font-size="11" font-weight="700" fill="#531A8A">REPLICASET</text>
    <text x="300" y="76" class="m" font-size="12" fill="#17151F">ingest-7d9f · want 3</text>
  </g>
  <rect x="540" y="40" width="196" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text x="554" y="58" class="m" font-size="11" font-weight="700" fill="#531A8A">SCHEDULER</text>
  <text x="554" y="76" font-size="12" fill="#17151F">fits Pods onto nodes</text>
  <g class="f" data-step="2">
    <g font-size="11" fill="#3D3A49">
      <rect x="286" y="92" width="58" height="22" rx="5" fill="#fff" stroke="#8C8899" stroke-dasharray="3 3"/><text class="m" x="315" y="107" text-anchor="middle">pod-a</text>
      <rect x="352" y="92" width="58" height="22" rx="5" fill="#fff" stroke="#8C8899" stroke-dasharray="3 3"/><text class="m" x="381" y="107" text-anchor="middle">pod-b</text>
      <rect x="418" y="92" width="58" height="22" rx="5" fill="#fff" stroke="#8C8899" stroke-dasharray="3 3"/><text class="m" x="447" y="107" text-anchor="middle">pod-c</text>
      <text class="m" x="486" y="107">Pending</text>
    </g>
  </g>
  <g class="f" data-step="3">
    <rect x="282" y="89" width="252" height="29" fill="#F7F7FB"/>
    <text x="300" y="107" class="m" font-size="11" fill="#5C5869">3 Pods bound to nodes</text>
    <g stroke="#531A8A" stroke-width="1.2" stroke-dasharray="4 4" fill="none">
      <path d="M600 84 L128 158"/><path d="M630 84 L380 158"/><path d="M660 84 L632 158"/>
    </g>
  </g>
  <g>
    <rect x="10" y="150" width="236" height="178" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="24" y="172" class="m" font-size="12" font-weight="700" fill="#17151F">NODE 1</text><text x="232" y="172" text-anchor="end" class="m" font-size="11" fill="#8C8899">4 CPU · 16 GB</text>
    <rect x="262" y="150" width="236" height="178" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="276" y="172" class="m" font-size="12" font-weight="700" fill="#17151F">NODE 2</text><text x="484" y="172" text-anchor="end" class="m" font-size="11" fill="#8C8899">4 CPU · 16 GB</text>
    <rect x="514" y="150" width="236" height="178" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="528" y="172" class="m" font-size="12" font-weight="700" fill="#17151F">NODE 3</text><text x="736" y="172" text-anchor="end" class="m" font-size="11" fill="#8C8899">4 CPU · 16 GB</text>
  </g>
  <g class="f" data-step="3">
    <rect x="28" y="186" width="200" height="50" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="42" y="206" class="m" font-size="12" font-weight="700" fill="#17151F">pod-a</text><text x="42" y="225" class="m" font-size="11" fill="#5C5869">ingest:2.4 · Running</text>
    <rect x="280" y="186" width="200" height="50" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="294" y="206" class="m" font-size="12" font-weight="700" fill="#17151F">pod-b</text><text x="294" y="225" class="m" font-size="11" fill="#5C5869">ingest:2.4 · Running</text>
    <rect x="532" y="186" width="200" height="50" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="546" y="206" class="m" font-size="12" font-weight="700" fill="#17151F">pod-c</text><text x="546" y="225" class="m" font-size="11" fill="#5C5869">ingest:2.4 · Running</text>
  </g>
  <g class="f" data-step="4">
    <rect x="514" y="150" width="236" height="178" rx="6" fill="#FCEDEB" fill-opacity=".97" stroke="#C2382F" stroke-width="1.6"/>
    <text x="632" y="230" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#C2382F">NODE 3 · NotReady</text>
    <text x="632" y="252" text-anchor="middle" class="m" font-size="11" fill="#C2382F">pod-c lost · 2 of 3 running</text>
  </g>
  <g class="f" data-step="5">
    <rect x="28" y="252" width="200" height="50" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="42" y="272" class="m" font-size="12" font-weight="700" fill="#17151F">pod-d (replacement)</text><text x="42" y="291" class="m" font-size="11" fill="#5C5869">ingest:2.4 · Running</text>
  </g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>COMPONENT</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>deployment-controller</td><td class="tag">CREATE</td><td>ReplicaSet ingest-7d9f (replicas 3)</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>replicaset-controller</td><td class="tag">CREATE</td><td>pod-a, pod-b, pod-c (Pending, no node yet)</td></tr>
<tr class="f" data-step="3"><td>3</td><td>03</td><td>scheduler</td><td class="tag">BIND</td><td>pod-a → node1, pod-b → node2, pod-c → node3 (spread)</td></tr>
<tr class="f" data-step="4"><td>4</td><td>04</td><td>node-controller</td><td class="err">NOTREADY</td><td>node3 missed heartbeats; its Pods are evicted</td></tr>
<tr class="f" data-step="5"><td>5</td><td>05</td><td>replicaset-controller</td><td class="tag">CREATE</td><td>have 2, want 3 → pod-d</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>scheduler</td><td class="tag">BIND</td><td>pod-d → node1 (most free capacity)</td></tr>
</table>
<ol class="lx-caps">
  <li>A cluster with three empty worker nodes. The <b>scheduler</b> is waiting for Pods to place.</li>
  <li>You apply a <b>Deployment</b> asking for 3 replicas. Its controller creates a <b>ReplicaSet</b> for this version of the image.</li>
  <li>The ReplicaSet creates <b>3 Pods</b>. They are <b>Pending</b>: they exist in etcd but have no node yet.</li>
  <li>The <b>scheduler</b> filters nodes that fit the Pods' CPU and memory requests, scores them, and <b>binds</b> one Pod per node. Kubelets start the containers.</li>
  <li><b>Node 3 dies</b>. After missed heartbeats it is marked NotReady and pod-c is gone. Actual state (2) no longer matches desired state (3).</li>
  <li>Nobody gets paged: the ReplicaSet creates <b>pod-d</b> and the scheduler places it on Node 1. This is <b>self-healing</b>: the same reconcile loop as the first deploy.</li>
</ol>
{{< /fig >}}

The manifest behind the figure:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: ingest }
spec:
  replicas: 3
  selector: { matchLabels: { app: ingest } }
  template:
    metadata: { labels: { app: ingest } }
    spec:
      containers:
        - name: ingest
          image: registry.example.com/ingest:2.4
          resources:
            requests: { cpu: "500m", memory: "1Gi" }   # what the scheduler reserves
            limits:   { memory: "1Gi" }                # exceeding it = OOMKilled
          readinessProbe: { httpGet: { path: /health, port: 8080 } }
```

A **rolling update** is the same machinery: change the image tag and the Deployment creates a second ReplicaSet, scaling the new one up and the old one down a few Pods at a time while readiness probes pass.

## Kubernetes for data workloads

- **Spark**: `spark-submit --master k8s://...` runs the driver and executors as Pods; the **Spark Operator** (Kubeflow) adds a `SparkApplication` resource.
- **Airflow**: the official Helm chart, with the **KubernetesExecutor** (one Pod per task) or `KubernetesPodOperator` for running any image as a task. See [Pipeline Orchestration]({{< relref "../../pipeline-orchestration" >}}).
- **Flink**: the **Flink Kubernetes Operator** manages jobs, savepoints and upgrades.
- **Kafka**: **Strimzi** runs brokers as StatefulSets and manages topics and users as resources.
- **Trino**, **ClickHouse**, **Postgres** (CloudNativePG): operators or Helm charts for each.

The pattern is the **operator**: a custom resource plus a controller that encodes how to run one system, extending the same reconciliation idea.

## Trade-offs

Kubernetes is powerful and heavy. Running the control plane yourself, upgrading every few months (minor versions get about 14 months of support), networking, storage classes and security policies are real work. Most teams should use a managed service (**EKS**, **GKE**, **AKS**) or a lightweight distribution (**k3s**) and stay on stateless workloads first. Stateful systems such as databases and Kafka run well on Kubernetes today, but only with a mature operator and tested backups.

## Common mistakes

- **No resource requests.** The scheduler then packs Pods blindly and noisy neighbours starve each other. Always set CPU and memory requests; set a memory limit.
- **Running one-off scripts in Deployments.** If it finishes, it is a **Job**; a Deployment will restart it forever.
- **`latest` image tags.** Nodes cache images, so different Pods can run different code. Use immutable tags or digests.
- **Storing state in a Pod's filesystem.** Pods are cattle; use a PersistentVolumeClaim or object storage.
- **Secrets as plain env vars in Git.** Use an external secrets manager (External Secrets Operator, Vault, cloud KMS) or sealed secrets.

## Learning Resources

### Official

- [Kubernetes concepts](https://kubernetes.io/docs/concepts/) and [interactive tutorials](https://kubernetes.io/docs/tutorials/)
- [Running Spark on Kubernetes](https://spark.apache.org/docs/latest/running-on-kubernetes.html)
- [Kubernetes training and certifications (CKA, CKAD)](https://kubernetes.io/training/)

### Papers

- [Large-scale cluster management at Google with Borg (EuroSys 2015)](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/)

### Books

- [Kubernetes in Action, 2nd ed., Marko Lukša (Manning)](https://www.manning.com/books/kubernetes-in-action-second-edition)
- [Kubernetes: Up and Running, 3rd ed. (O'Reilly)](https://www.oreilly.com/library/view/kubernetes-up-and/9781098110192/)
- [Production Kubernetes (O'Reilly)](https://www.oreilly.com/library/view/production-kubernetes/9781492092292/)

### Courses

- [Kubernetes Course: Full Beginners Tutorial (freeCodeCamp)](https://www.youtube.com/watch?v=d6WC5n9G_sM)
- [Kubernetes Tutorial for Beginners, TechWorld with Nana](https://www.youtube.com/watch?v=X48VuDVv0do)
- [Kubernetes the Hard Way, Kelsey Hightower](https://github.com/kelseyhightower/kubernetes-the-hard-way): build a cluster by hand to understand every part
