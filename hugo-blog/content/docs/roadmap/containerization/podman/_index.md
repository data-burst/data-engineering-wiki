---
title: "Podman"
description: "Podman explained: a daemonless, rootless, Docker-compatible container engine with pods, Quadlet systemd units and Kubernetes YAML. When to pick it over Docker."
weight: 2
---

# Podman

**Podman** is an open-source container engine from Red Hat that builds, runs and manages OCI containers **without a central daemon**. Its CLI is deliberately Docker-compatible: most `docker ...` commands work as `podman ...`, and many people simply `alias docker=podman`.

It is the default container tool on RHEL, Fedora and CentOS Stream, and **Podman Desktop** is a free GUI alternative to Docker Desktop on macOS and Windows.

## How it differs from Docker

With Docker, the CLI talks to `dockerd`, a long-running daemon that usually runs as root and is the parent of every container. With Podman, each `podman run` **forks the container directly** (through `conmon` and a low-level runtime such as `crun` or `runc`). There is no daemon to crash, upgrade or secure.

| | Docker | Podman |
|---|---|---|
| Architecture | Client + `dockerd` daemon | Daemonless, fork/exec per container |
| Default privileges | Daemon runs as root (rootless mode optional) | **Rootless** by default for normal users |
| Pods | No | Yes: groups of containers sharing a network namespace, like Kubernetes |
| Kubernetes YAML | No | `podman kube generate` / `podman kube play` |
| Run as a service | Restart policies in the daemon | **Quadlet**: `.container` files become systemd units |
| Compose | `docker compose` | `podman compose` (wraps a Compose provider) or the Docker-compatible API socket |
| Image format | OCI / Docker | OCI / Docker (same images, same registries) |

## Rootless containers

In rootless mode, "root" inside the container is mapped to your normal user ID on the host through **user namespaces**. If an attacker escapes the container, they land as an unprivileged user, not as host root. This is the main reason security-sensitive teams and shared build machines prefer Podman.

Trade-offs: ports below 1024 need extra config, and some storage and networking paths are slower than rootful mode (newer kernels and `pasta` networking have closed most of the gap).

## Pods: a small Kubernetes on one host

```bash
podman pod create --name pipeline -p 5432:5432
podman run -d --pod pipeline --name db -e POSTGRES_PASSWORD=dev postgres:17
podman run -d --pod pipeline --name loader my-registry/loader:1.4   # reaches db at localhost:5432
podman kube generate pipeline > pipeline.yaml                        # Kubernetes-ready YAML
```

Containers in a pod share `localhost`, exactly like containers in a Kubernetes Pod. That makes Podman a handy way to prototype a Pod locally.

## When to use Podman

- **Linux servers and CI runners** where you want no root daemon.
- **Long-running services on a single host**: Quadlet lets systemd start, restart and log containers like any other service.
- **Teams avoiding Docker Desktop licensing** on laptops (Podman Desktop is Apache-2.0).

Stick with Docker when your tooling assumes the Docker socket and you do not want to test compatibility, or when you rely heavily on Docker-specific features such as Docker Build Cloud or Docker Scout.

## Common mistakes

- **Expecting `--restart=always` to survive reboots.** Without a daemon, nothing restarts containers on boot unless systemd does it. Use Quadlet, or enable `podman-restart.service`.
- **Short image names.** `podman pull postgres` may prompt for or resolve a registry differently than Docker. Use full names like `docker.io/library/postgres:17`.
- **Mixing rootful and rootless storage.** Images pulled with `sudo podman` are not visible to your user, and vice versa.

## Learning Resources

### Official

- [Podman documentation](https://docs.podman.io/en/latest/) and [tutorials](https://docs.podman.io/en/latest/Tutorials.html)
- [Quadlet: podman-systemd.unit](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html)
- [Podman Desktop](https://podman-desktop.io/)

### Books

- [Podman in Action, Daniel Walsh (Manning)](https://www.manning.com/books/podman-in-action)

### Videos

- [Podman Tutorial Zero to Hero (YouTube)](https://www.youtube.com/watch?v=YXfA5O5Mr18)
- [How To Use Podman Containers (YouTube)](https://www.youtube.com/watch?v=piwcpd_hWn0)

Most Docker learning material applies directly; see [Docker]({{< relref "../docker" >}}).
