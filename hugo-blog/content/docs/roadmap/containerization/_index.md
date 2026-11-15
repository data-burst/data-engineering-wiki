---
title: "Containerization"
description: "What containers are, how they differ from virtual machines, how images and OCI runtimes fit together, and why data teams ship pipelines in them."
bookCollapseSection: true
weight: 24
---

# Containerization

**Containerization** means packaging an application together with everything it needs to run (interpreter, libraries, system packages, config) into one **image**, and running that image as an isolated process called a **container**. The same image runs the same way on a laptop, a CI runner and a production cluster, which ends the "works on my machine" problem.

For data engineers this is daily work: an Airflow task, a Spark driver, a dbt run or a Kafka connector is usually a container image pulled from a registry and started by an orchestrator.

## How a container works

A container is **not** a small virtual machine. It is a normal Linux process that the kernel fences off with two features:

- **Namespaces** give the process its own view of the system: its own process IDs, network interfaces, hostname, mount points and users.
- **cgroups** cap what it may consume: CPU, memory, I/O. A Spark executor limited to 4 GB is killed by the kernel if it tries to use 5 GB.

The files the process sees come from the **image**: a stack of read-only, content-addressed layers, plus a thin writable layer per container. See [Docker]({{< relref "docker" >}}) for an animated walk-through.

## Containers vs virtual machines

| | Virtual machine | Container |
|---|---|---|
| What is isolated | A whole guest OS on virtual hardware | A process tree on the host kernel |
| Kernel | One per VM | Shared with the host |
| Start time | Tens of seconds | Milliseconds to a second |
| Typical size | GBs | Tens to hundreds of MBs |
| Isolation strength | Strong (hypervisor boundary) | Weaker (kernel is shared) |
| Good for | Different OSes, hard multi-tenancy | Packaging and scaling apps |

In practice they are combined: cloud Kubernetes nodes are VMs that run many containers. When you need VM-grade isolation for untrusted code, sandboxed runtimes such as **gVisor** or **Kata Containers** sit between the two.

## The standards: OCI

The **Open Container Initiative (OCI)** defines three specs: the **image** format, the **runtime** (how to start a container from an unpacked image) and the **distribution** API that registries speak. Because of OCI, an image built with Docker runs under Podman, containerd or Kubernetes unchanged, and can be stored in Docker Hub, GitHub Container Registry, Amazon ECR or Harbor.

| Layer | Examples | Who uses it directly |
|---|---|---|
| Build and developer CLI | Docker, Podman, Buildah | You |
| High-level runtime | containerd, CRI-O | Docker Engine, Kubernetes |
| Low-level runtime | runc, crun | containerd, Podman |

## What is in this section

- [Docker]({{< relref "docker" >}}): the tool that popularized containers. Images, layers, Dockerfiles and Compose.
- [Podman]({{< relref "podman" >}}): a daemonless, rootless, Docker-compatible alternative from Red Hat.
- [containerd]({{< relref "containerd" >}}): the runtime underneath Docker and most Kubernetes clusters.

Once you can run one container, [Container Orchestration]({{< relref "../container-orchestration" >}}) covers running thousands of them across a cluster.

## Common mistakes

- **Treating a container like a server.** Do not SSH in and patch it. Change the image and redeploy.
- **Storing data in the container's writable layer.** It disappears with the container. Use volumes or object storage.
- **Running as root inside the image.** Add a `USER` line; a kernel bug plus root in the container is a host compromise.
- **Huge images.** Use slim base images and multi-stage builds so CI and node start-up stay fast.

## Learning Resources

- [Open Container Initiative specifications](https://opencontainers.org/)
- [What is a container? (Docker)](https://www.docker.com/resources/what-container/)
- [Linux namespaces man page](https://man7.org/linux/man-pages/man7/namespaces.7.html) and [cgroups man page](https://man7.org/linux/man-pages/man7/cgroups.7.html)
- [Containers from scratch, Liz Rice (talk)](https://www.youtube.com/watch?v=8fi7uSYlOdc): builds a container in a few lines of Go
- [What is Containerization? (IBM)](https://www.ibm.com/topics/containerization)
