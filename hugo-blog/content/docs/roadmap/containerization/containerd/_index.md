---
title: "containerd"
description: "What containerd is, where it sits between Docker, Kubernetes and runc, how the CRI works since dockershim's removal, and which CLIs to use (ctr, nerdctl)."
weight: 3
---

# containerd

**containerd** is the industry-standard **container runtime daemon**: it pulls images, stores them, unpacks their layers into snapshots, and asks a low-level runtime (normally `runc`) to start and stop containers. It has no friendly build tooling of its own. You rarely use it directly, but it is almost certainly running your containers: Docker Engine uses it, and so do most Kubernetes clusters (EKS, GKE, AKS, k3s).

containerd started inside Docker, was donated to the CNCF in 2017 and **graduated** in 2019. Version 2.0 (late 2024) removed long-deprecated APIs and is the current major line.

## Where it sits

```text
 you ──► docker CLI ──► dockerd ──┐
                                  ├──► containerd ──► containerd-shim ──► runc ──► container process
 kubelet ──── CRI (gRPC) ─────────┘
```

- **runc** (or `crun`) is the **low-level** runtime: it reads an OCI bundle and makes the namespaces and cgroups. It exits once the container is running.
- **containerd** is the **high-level** runtime: images, snapshots, content store, lifecycle, events.
- A **shim** process per container keeps the container alive and holds its stdio, so containerd itself can be restarted without killing workloads.

## containerd and Kubernetes

Kubernetes talks to runtimes through the **Container Runtime Interface (CRI)**, a gRPC API. containerd implements CRI with a built-in plugin. Docker Engine never implemented CRI, so Kubernetes carried an adapter called **dockershim**; it was removed in **Kubernetes 1.24** (2022). Images built with Docker still run fine, because they are OCI images. Only clusters that used Docker as the node runtime had to switch, mostly to containerd or **CRI-O**.

| Runtime | Scope | Typical home |
|---|---|---|
| containerd | General-purpose, many plugins | Docker Engine, most managed Kubernetes |
| CRI-O | Kubernetes only, minimal | OpenShift |
| runc / crun | Low-level, starts one container | Underneath both |

## Which CLI to use

| CLI | For | Notes |
|---|---|---|
| `ctr` | containerd debugging | Ships with containerd; low-level, not user-friendly |
| `nerdctl` | Day-to-day use | Docker-compatible commands, Compose, rootless, lazy pulling |
| `crictl` | Kubernetes nodes | Talks CRI; shows what the kubelet sees (pods, containers) |

```bash
sudo crictl ps                       # containers the kubelet started on this node
sudo ctr -n k8s.io images ls         # Kubernetes images live in the k8s.io namespace
nerdctl run --rm -it alpine sh       # docker-like UX on plain containerd
```

## Common mistakes

- **Looking for Kubernetes containers with `ctr` in the default namespace.** containerd namespaces separate clients; Kubernetes uses `k8s.io`, Docker uses `moby`.
- **Thinking "Kubernetes dropped Docker" means Docker images stopped working.** It only dropped Docker as a node runtime.
- **Editing `config.toml` without restarting containerd.** Changes such as registry mirrors or the systemd cgroup driver need a restart, and the cgroup driver must match the kubelet's.

## Learning Resources

- [containerd documentation](https://containerd.io/docs/) and [getting started guide](https://github.com/containerd/containerd/blob/main/docs/getting-started.md)
- [nerdctl](https://github.com/containerd/nerdctl) and [crictl user guide](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/)
- [Kubernetes: Don't Panic, Kubernetes and Docker](https://kubernetes.io/blog/2020/12/02/dont-panic-kubernetes-and-docker/)
- [containerd: a secret hero of the cloud native world (talk)](https://www.youtube.com/watch?v=3_jUWW2j_TI)
- [Introduction and deep dive into containerd (KubeCon talk)](https://www.youtube.com/watch?v=HFEZq2YddPU)
