---
title: "Containerization"
description: "What containers are, how they differ from virtual machines, how images and OCI runtimes fit together, and why data teams ship pipelines in them."
bookCollapseSection: true
weight: 24
---
<div class="lx-kicker-line">$ docker run --rm alpine ps</div>

# Containerization

**Containerization** means packaging an application together with everything it needs to run (interpreter, libraries, system packages, config) into one **image**, and running that image as an isolated process called a **container**. The same image runs the same way on a laptop, a CI runner and a production cluster, which ends the "works on my machine" problem.

For data engineers this is daily work: an Airflow task, a Spark driver, a dbt run or a Kafka connector is usually a container image pulled from a registry and started by an orchestrator.

## How a container works

A container is **not** a small virtual machine. It is a normal Linux process that the kernel fences off with two features:

- **Namespaces** give the process its own view of the system: its own process IDs, network interfaces, hostname, mount points and users.
- **cgroups** cap what it may consume: CPU, memory, I/O. A Spark executor limited to 4 GB is killed by the kernel if it tries to use 5 GB.

The files the process sees come from the **image**: a stack of read-only, content-addressed layers, plus a thin writable layer per container. See [Docker]({{< relref "docker" >}}) for an animated walk-through.

{{< fig kicker="$ docker run --memory=256m --cpus=0.5 postgres:18" title="A container is just a Linux process" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 350">
  <g class="m" font-size="11.5">
    <rect x="20" y="40" width="150" height="76" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="95" y="68" text-anchor="middle" font-size="12.5" font-weight="700" fill="#531A8A">postgres</text>
    <text x="95" y="86" text-anchor="middle" fill="#5C5869">host PID 4812</text>
    <text x="95" y="104" text-anchor="middle" fill="#5C5869">a plain process</text>
    <text x="200" y="34" font-size="11" fill="#5C5869">NAMESPACE</text>
    <text x="290" y="34" font-size="11" fill="#5C5869">WITHOUT IT, THE PROCESS SEES</text>
    <text x="510" y="34" font-size="11" fill="#5C5869">WITH IT, THE PROCESS SEES</text>
    <g stroke="#3D3A49" stroke-opacity=".18">
      <line x1="194" y1="42" x2="745" y2="42"/><line x1="194" y1="74" x2="745" y2="74"/><line x1="194" y1="106" x2="745" y2="106"/>
      <line x1="194" y1="138" x2="745" y2="138"/><line x1="194" y1="170" x2="745" y2="170"/><line x1="194" y1="202" x2="745" y2="202"/><line x1="194" y1="234" x2="745" y2="234"/>
    </g>
    <g fill="#17151F">
      <text x="200" y="62">pid</text><text x="290" y="62">all 312 host processes</text>
      <text x="200" y="94">net</text><text x="290" y="94">host NICs and every port</text>
      <text x="200" y="126">mnt</text><text x="290" y="126">the host's whole disk</text>
      <text x="200" y="158">uts</text><text x="290" y="158">hostname host-01</text>
      <text x="200" y="190">ipc</text><text x="290" y="190">host shared memory</text>
      <text x="200" y="222">user</text><text x="290" y="222">UID 0 is host root</text>
    </g>
  </g>
  <g class="f slide-r m" data-step="1" font-size="11.5">
    <rect x="194" y="46" width="70" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="200" y="62" font-weight="700" fill="#531A8A">pid</text>
    <rect x="284" y="46" width="210" height="24" fill="#fff" opacity=".6"/><line x1="288" y1="58" x2="442" y2="58" stroke="#5C5869"/>
    <text x="510" y="62" fill="#531A8A">only its own: postgres is PID 1</text>
  </g>
  <g class="f slide-r m" data-step="2" font-size="11.5">
    <rect x="194" y="78" width="70" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="200" y="94" font-weight="700" fill="#531A8A">net</text>
    <rect x="284" y="78" width="210" height="24" fill="#fff" opacity=".6"/><line x1="288" y1="90" x2="456" y2="90" stroke="#5C5869"/>
    <text x="510" y="94" fill="#531A8A">own eth0, IP 172.17.0.2</text>
    <rect x="194" y="142" width="70" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="200" y="158" font-weight="700" fill="#531A8A">uts</text>
    <rect x="284" y="142" width="210" height="24" fill="#fff" opacity=".6"/><line x1="288" y1="154" x2="400" y2="154" stroke="#5C5869"/>
    <text x="510" y="158" fill="#531A8A">hostname 3f2a9c1d7b4e</text>
  </g>
  <g class="f slide-r m" data-step="3" font-size="11.5">
    <rect x="194" y="110" width="70" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="200" y="126" font-weight="700" fill="#531A8A">mnt</text>
    <rect x="284" y="110" width="210" height="24" fill="#fff" opacity=".6"/><line x1="288" y1="122" x2="435" y2="122" stroke="#5C5869"/>
    <text x="510" y="126" fill="#531A8A">image layers mounted as /</text>
  </g>
  <g class="f slide-r m" data-step="4" font-size="11.5">
    <rect x="194" y="174" width="70" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="200" y="190" font-weight="700" fill="#531A8A">ipc</text>
    <rect x="284" y="174" width="210" height="24" fill="#fff" opacity=".6"/><line x1="288" y1="186" x2="414" y2="186" stroke="#5C5869"/>
    <text x="510" y="190" fill="#531A8A">private shared memory</text>
    <rect x="194" y="206" width="70" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="200" y="222" font-weight="700" fill="#531A8A">user</text>
    <rect x="284" y="206" width="210" height="24" fill="#fff" opacity=".6"/><line x1="288" y1="218" x2="414" y2="218" stroke="#5C5869"/>
    <text x="510" y="222" fill="#531A8A">root inside, UID 100000 outside</text>
  </g>
  <line x1="20" y1="248" x2="740" y2="248" stroke="#3D3A49" stroke-opacity=".25"/>
  <g class="f pop m" data-step="5" font-size="11.5">
    <text x="20" y="276" font-size="12.5" font-weight="700" fill="#531A8A">cgroups</text>
    <text x="20" y="296" fill="#3D3A49">--memory=256m</text>
    <text x="20" y="314" fill="#3D3A49">--cpus=0.5</text>
    <text x="200" y="276" fill="#5C5869">memory used</text>
    <rect x="200" y="284" width="500" height="22" rx="4" fill="#fff" stroke="#3D3A49"/>
    <rect x="200" y="284" width="281" height="22" rx="4" fill="#531A8A" opacity=".3"/>
    <text x="210" y="299" fill="#17151F">180 MB</text>
    <line x1="600" y1="282" x2="600" y2="312" stroke="#3D3A49" stroke-width="1.6" stroke-dasharray="4 3"/>
    <text x="600" y="328" text-anchor="middle" fill="#3D3A49">limit 256 MB</text>
    <text x="200" y="328" fill="#5C5869">CPU over 0.5 core: slowed, not killed</text>
  </g>
  <g class="f pop m" data-step="6" font-size="11.5">
    <rect x="481" y="284" width="188" height="22" fill="#C2382F" opacity=".85"/>
    <text x="660" y="299" text-anchor="end" fill="#fff" font-weight="700">300 MB</text>
    <text class="pulse" x="740" y="276" text-anchor="end" font-weight="700" fill="#C2382F">OOM-killed · exit 137</text>
    <rect x="20" y="40" width="150" height="76" rx="6" fill="#fff" fill-opacity=".97" stroke="#C2382F" stroke-width="1.6"/>
    <text x="95" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#C2382F">killed</text>
    <text x="95" y="92" text-anchor="middle" fill="#C2382F">by the kernel</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Start with an ordinary process on the host. Without any fences it sees every process, every network port, the whole disk and the real hostname.</li>
  <li>A <b>pid</b> namespace gives it its own process tree. Inside, postgres is PID 1 and sees no other processes.</li>
  <li>A <b>net</b> namespace gives it its own network interface and IP; <b>uts</b> gives it its own hostname (the container ID).</li>
  <li>A <b>mnt</b> namespace swaps the filesystem: the image's layers are mounted as <code>/</code>, so the host disk is invisible.</li>
  <li><b>ipc</b> isolates shared memory; a <b>user</b> namespace can map root inside to an unprivileged UID outside. These are the blinders.</li>
  <li><b>cgroups</b> are the budget: at most 256 MB of memory and half a CPU core. Too much CPU only slows it down.</li>
  <li>Cross the memory limit and the kernel's OOM killer ends the process. The container exits with code 137.</li>
</ol>
{{< /fig >}}

Try it: `docker run --rm alpine ps` lists a single process, and `docker run --rm alpine hostname` prints a random ID. With no `--memory` or `--cpus` flags there is no ceiling, so one runaway container can starve the whole machine. `--pids-limit` caps the number of processes, which stops fork bombs.

## Containers vs virtual machines

{{< fig kicker="$ time docker run --rm alpine true" title="Two ways to isolate the same apps" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 370">
  <g class="m" font-size="11.5">
    <text x="195" y="30" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">VIRTUAL MACHINES</text>
    <text x="565" y="30" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">CONTAINERS</text>
    <line x1="380" y1="16" x2="380" y2="352" stroke="#3D3A49" stroke-opacity=".2"/>
    <rect x="30" y="318" width="330" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="195" y="338" text-anchor="middle" fill="#17151F">hardware</text>
    <rect x="400" y="318" width="330" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="565" y="338" text-anchor="middle" fill="#17151F">hardware</text>
  </g>
  <g class="f slide-r m" data-step="1" font-size="11.5">
    <rect x="30" y="280" width="330" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="195" y="300" text-anchor="middle" fill="#17151F">hypervisor</text>
    <rect x="400" y="280" width="330" height="32" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="565" y="300" text-anchor="middle" fill="#531A8A" font-weight="700">host OS · one shared Linux kernel</text>
  </g>
  <g class="f slide-r m" data-step="2" font-size="11.5">
    <rect x="30" y="226" width="102" height="48" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <rect x="144" y="226" width="102" height="48" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <rect x="258" y="226" width="102" height="48" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <g text-anchor="middle"><text x="81" y="246" fill="#531A8A" font-weight="700">guest OS</text><text x="81" y="263" fill="#5C5869">own kernel</text>
    <text x="195" y="246" fill="#531A8A" font-weight="700">guest OS</text><text x="195" y="263" fill="#5C5869">own kernel</text>
    <text x="309" y="246" fill="#531A8A" font-weight="700">guest OS</text><text x="309" y="263" fill="#5C5869">own kernel</text></g>
    <rect x="400" y="242" width="330" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="565" y="262" text-anchor="middle" fill="#17151F">container engine (Docker / Podman)</text>
    <text x="195" y="150" text-anchor="middle" fill="#3D3A49">3 kernels to boot, patch and feed RAM</text>
    <text x="565" y="150" text-anchor="middle" fill="#3D3A49">1 kernel, shared by every container</text>
  </g>
  <g class="f slide-r m" data-step="3" font-size="11.5">
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4">
      <rect x="30" y="176" width="102" height="44" rx="6"/><rect x="144" y="176" width="102" height="44" rx="6"/><rect x="258" y="176" width="102" height="44" rx="6"/>
      <rect x="400" y="196" width="102" height="40" rx="6"/><rect x="514" y="196" width="102" height="40" rx="6"/><rect x="628" y="196" width="102" height="40" rx="6"/>
    </g>
    <g text-anchor="middle" fill="#17151F">
      <text x="81" y="195">App A</text><text x="81" y="211" fill="#5C5869">+ libs</text>
      <text x="195" y="195">App B</text><text x="195" y="211" fill="#5C5869">+ libs</text>
      <text x="309" y="195">App C</text><text x="309" y="211" fill="#5C5869">+ libs</text>
      <text x="451" y="213">App A</text><text x="451" y="228" fill="#5C5869">+ libs</text>
      <text x="565" y="213">App B</text><text x="565" y="228" fill="#5C5869">+ libs</text>
      <text x="679" y="213">App C</text><text x="679" y="228" fill="#5C5869">+ libs</text>
    </g>
  </g>
  <g class="f pop m" data-step="4" font-size="11.5">
    <text x="30" y="72" fill="#5C5869">size</text>
    <rect x="80" y="61" width="220" height="14" rx="3" fill="#3D3A49" opacity=".7"/>
    <text x="308" y="72" fill="#17151F" font-weight="700">GBs</text>
    <text x="30" y="104" fill="#5C5869">boot</text>
    <rect x="80" y="93" width="220" height="14" rx="3" fill="#3D3A49" opacity=".7"/>
    <text x="308" y="104" fill="#17151F" font-weight="700">~30 s+</text>
    <text x="400" y="72" fill="#5C5869">size</text>
    <rect x="450" y="61" width="14" height="14" rx="3" fill="#531A8A"/>
    <text x="472" y="72" fill="#531A8A" font-weight="700">MBs</text>
    <text x="400" y="104" fill="#5C5869">start</text>
    <rect x="450" y="93" width="8" height="14" rx="3" fill="#531A8A"/>
    <text x="466" y="104" fill="#531A8A" font-weight="700">under 1 s</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Same hardware on both sides. The question is what sits between it and the apps.</li>
  <li>VMs run a <b>hypervisor</b> that fakes whole machines. Containers run on the normal <b>host OS</b> and its single Linux kernel.</li>
  <li>Every VM boots its <b>own guest OS and kernel</b>. Containers only need a <b>container engine</b> to set up namespaces and cgroups.</li>
  <li>The same three apps on top. In a VM each one carries a full OS; in a container it carries only its libraries.</li>
  <li>The result: VM images are gigabytes and boot in tens of seconds; container images are megabytes and start like a process.</li>
</ol>
{{< /fig >}}

| | Virtual machine | Container |
|---|---|---|
| What is isolated | A whole guest OS on virtual hardware | A process tree on the host kernel |
| Kernel | One per VM | Shared with the host |
| Start time | Tens of seconds (boots an OS) | Milliseconds to a second |
| Typical size | GBs | Tens to hundreds of MBs |
| Isolation strength | Strong (hypervisor boundary) | Weaker (kernel is shared) |
| Runs | Any OS, e.g. Windows on a Linux host | Needs a compatible kernel: Linux containers need Linux |
| Good for | Different OSes, hard multi-tenancy | Packaging and scaling apps |

They are not rivals. On macOS and Windows, Docker Desktop and Podman run your Linux containers inside a small hidden Linux VM, and cloud Kubernetes nodes are VMs that run many containers. When you need VM-grade isolation for untrusted code, sandboxed runtimes such as **gVisor** or **Kata Containers** sit between the two.

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
