---
title: "Podman"
description: "Podman explained: a daemonless, rootless, Docker-compatible container engine with pods, Quadlet systemd units and Kubernetes YAML. When to pick it over Docker."
weight: 2
---
<div class="lx-kicker-line">$ alias docker=podman</div>

# Podman

**Podman** is an open-source container engine from Red Hat that builds, runs and manages OCI containers **without a central daemon**. Its CLI is deliberately Docker-compatible: most `docker ...` commands work as `podman ...`, and many people simply `alias docker=podman`.

It is the default container tool on RHEL, Fedora and CentOS Stream, and **Podman Desktop** is a free GUI alternative to Docker Desktop on macOS and Windows.

## How it differs from Docker

With Docker, the CLI talks to `dockerd`, a long-running daemon that usually runs as root and is the parent of every container. With Podman, each `podman run` **forks the container directly** (through `conmon` and a low-level runtime such as `crun` or `runc`). There is no daemon to crash, upgrade or secure.

{{< fig kicker="$ podman run -d --name pg docker.io/library/postgres:18" title="Root daemon versus fork/exec" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 320">
  <g class="m" font-size="11.5">
    <text x="190" y="30" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">DOCKER</text>
    <text x="570" y="30" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">PODMAN</text>
    <line x1="380" y1="16" x2="380" y2="310" stroke="#3D3A49" stroke-opacity=".2"/>
    <rect x="100" y="50" width="180" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="190" y="77" text-anchor="middle" fill="#17151F">alice $ docker run</text>
    <rect x="420" y="50" width="180" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="510" y="77" text-anchor="middle" fill="#17151F">alice $ podman run</text>
  </g>
  <g class="f m" data-step="1" font-size="11.5">
    <line class="flow" x1="190" y1="94" x2="190" y2="134" stroke="#531A8A" stroke-width="1.6"/>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.2s" repeatCount="indefinite" path="M190 94 V134"/></circle>
    <text x="198" y="118" font-size="11" fill="#5C5869">docker.sock</text>
    <rect x="100" y="134" width="180" height="50" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="190" y="155" text-anchor="middle" font-size="12.5" font-weight="700" fill="#531A8A">dockerd</text>
    <text x="190" y="173" text-anchor="middle" fill="#5C5869">root · always running</text>
  </g>
  <g class="f slide-r m" data-step="2" font-size="11.5">
    <path class="flow" d="M190 184 V204 H120 V224 M190 204 H260 V224" fill="none" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="60" y="224" width="120" height="36" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="120" y="247" text-anchor="middle" fill="#17151F">pg</text>
    <rect x="200" y="224" width="120" height="36" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="260" y="247" text-anchor="middle" fill="#17151F">web</text>
    <text x="190" y="290" text-anchor="middle" font-size="11" fill="#3D3A49">one root daemon owns every container</text>
    <text x="190" y="306" text-anchor="middle" font-size="11" fill="#5C5869">socket access = root on the host</text>
  </g>
  <g class="f m" data-step="3" font-size="11.5">
    <line class="flow" x1="510" y1="94" x2="510" y2="134" stroke="#531A8A" stroke-width="1.6"/>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.2s" repeatCount="indefinite" path="M510 94 V134"/></circle>
    <text x="518" y="118" font-size="11" fill="#5C5869">fork/exec</text>
    <rect x="420" y="134" width="180" height="50" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="510" y="155" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">conmon</text>
    <text x="510" y="173" text-anchor="middle" fill="#5C5869">uid 1000 · per container</text>
    <line x1="510" y1="184" x2="510" y2="224" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="420" y="224" width="180" height="36" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="510" y="247" text-anchor="middle" fill="#531A8A" font-weight="700">pg · started by crun</text>
    <text x="510" y="290" text-anchor="middle" font-size="11" fill="#3D3A49">no daemon: a child of your session</text>
    <text x="510" y="306" text-anchor="middle" font-size="11" fill="#5C5869">podman exits, conmon stays</text>
  </g>
  <g class="f pop m" data-step="4" font-size="11">
    <line x1="600" y1="242" x2="620" y2="242" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="3 3"/>
    <rect x="620" y="220" width="120" height="46" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="4 3"/>
    <text x="680" y="239" text-anchor="middle" fill="#531A8A">root in pg</text>
    <text x="680" y="257" text-anchor="middle" fill="#531A8A">= uid 1000 host</text>
  </g>
  <g class="f pop m" data-step="5" font-size="11.5">
    <rect x="620" y="50" width="120" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="680" y="69" text-anchor="middle" font-weight="700" fill="#531A8A">systemd</text>
    <text x="680" y="86" text-anchor="middle" font-size="11" fill="#5C5869">pg.container</text>
    <path class="flow" d="M680 94 V159 H600" fill="none" stroke="#531A8A" stroke-width="1.6"/>
    <text x="688" y="130" font-size="11" fill="#531A8A">Quadlet</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The same user, Alice, starts a container with each tool. The commands look identical.</li>
  <li>The Docker CLI only sends a request over a socket to <b>dockerd</b>, a long-running daemon that usually runs as root.</li>
  <li>Every container is a child of that daemon. Whoever can write to the socket can effectively act as root on the host.</li>
  <li>Podman has no daemon: it forks a small <b>conmon</b> monitor, <b>crun</b> starts the container under it, and the podman command exits.</li>
  <li><b>Rootless</b> by default: a user namespace maps root inside the container to Alice's own UID on the host.</li>
  <li>For services that must start on boot, a <b>Quadlet</b> <code>.container</code> file lets <b>systemd</b> launch and restart the container like any other unit.</li>
</ol>
{{< /fig >}}

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

## Same labs with Podman

Every `docker` command from the [Docker hands-on lab]({{< relref "../docker" >}}) works with `podman` in its place. The differences you will hit:

```bash
podman machine init        # macOS / Windows only, once: creates the Linux VM
podman machine start
podman run -d --name pg -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 -v pgdata:/var/lib/postgresql \
  docker.io/library/postgres:18
podman exec -it pg psql -U postgres
```

- **Full image names.** `docker.io/library/postgres:18` skips the "which registry?" prompt for short names.
- **Rootless ports.** On Linux, host ports below 1024 need extra setup. Publish 8080, not 80.
- **Networks.** `podman network create labnet` gives the same name-based discovery as Docker; or put both containers in one **pod** and use `localhost`.
- **Compose.** `podman compose up -d` reads the same `compose.yaml` (it calls `docker-compose` or `podman-compose`, whichever is installed).
- **Alias.** `alias docker=podman` covers nearly all day-to-day commands; Podman Desktop can also expose a Docker-compatible socket for tools that expect one.

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
