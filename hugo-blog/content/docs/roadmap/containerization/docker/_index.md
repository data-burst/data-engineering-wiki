---
title: "Docker"
description: "Docker for data engineers: architecture, image layers and cache, ports and volumes, daily commands, troubleshooting, and a hands-on Postgres lab with Compose."
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ docker build -t etl:1.0 . &amp;&amp; docker run etl:1.0</div>

# Docker

**Docker** is the toolset that made containers mainstream: you describe an environment in a **Dockerfile**, `docker build` turns it into an **image**, and `docker run` starts a **container** from that image. Images are pushed to a **registry** (Docker Hub, GHCR, ECR) so any machine can pull and run exactly the same bits.

Under the hood, Docker Engine (`dockerd`) delegates to [containerd]({{< relref "../containerd" >}}) and `runc` to actually start containers. Docker itself is the friendly layer on top: the CLI, the builder (**BuildKit**, the default since Engine 23), networking, volumes and Compose.

## What happens when you type `docker run`

{{< fig kicker="$ docker run -d --name pg -e POSTGRES_PASSWORD=secret postgres:18" title="Client, daemon, registry: one docker run" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 378">
  <g class="m" font-size="11.5">
    <text x="20" y="50" font-size="11" fill="#5C5869">CLIENT</text>
    <rect x="20" y="60" width="190" height="52" rx="8" fill="#260246"/>
    <text x="32" y="91" font-size="11" fill="#EEEAF5">$ docker run postgres:18</text>
    <text x="20" y="134" fill="#5C5869">your terminal: only</text>
    <text x="20" y="150" fill="#5C5869">sends requests</text>
    <rect x="250" y="28" width="300" height="290" rx="10" fill="none" stroke="#3D3A49" stroke-width="1.2" stroke-dasharray="5 4"/>
    <text x="264" y="48" font-size="11" fill="#5C5869">DOCKER HOST · LINUX</text>
    <rect x="280" y="60" width="240" height="48" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="400" y="80" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">dockerd</text>
    <text x="400" y="98" text-anchor="middle" fill="#5C5869">images · networks · volumes</text>
    <rect x="600" y="60" width="140" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="670" y="82" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">REGISTRY</text>
    <text x="670" y="100" text-anchor="middle" fill="#5C5869">docker.io</text>
    <text x="670" y="118" text-anchor="middle" fill="#5C5869">GHCR · ECR · Quay</text>
  </g>
  <g class="f m" data-step="1" font-size="11">
    <line class="flow" x1="210" y1="86" x2="280" y2="86" stroke="#531A8A" stroke-width="1.6"/>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M210 86 H280"/></circle>
    <text x="20" y="176" fill="#531A8A">REST API over</text>
    <text x="20" y="192" fill="#531A8A">/var/run/docker.sock</text>
  </g>
  <g class="f m" data-step="2" font-size="11.5">
    <line class="flow" x1="600" y1="86" x2="520" y2="86" stroke="#531A8A" stroke-width="1.6"/>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M600 86 H520"/></circle>
    <text x="600" y="152" fill="#531A8A">image not local:</text>
    <text x="600" y="168" fill="#531A8A">pull missing layers</text>
  </g>
  <g class="f slide-r m" data-step="3" font-size="11.5">
    <line class="flow" x1="400" y1="108" x2="400" y2="136" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="280" y="136" width="240" height="48" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="400" y="156" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">containerd</text>
    <text x="400" y="174" text-anchor="middle" fill="#5C5869">unpacks, supervises</text>
  </g>
  <g class="f slide-r m" data-step="4" font-size="11.5">
    <line class="flow" x1="400" y1="184" x2="400" y2="212" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="280" y="212" width="240" height="48" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="400" y="232" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">runc</text>
    <text x="400" y="250" text-anchor="middle" fill="#5C5869">namespaces + cgroups, exits</text>
  </g>
  <g class="f pop m" data-step="5" font-size="11.5">
    <line x1="400" y1="260" x2="400" y2="276" stroke="#3D3A49" stroke-width="1.4"/>
    <rect class="pulse" x="300" y="276" width="200" height="30" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.6"/>
    <text x="400" y="295" text-anchor="middle" font-weight="700" fill="#531A8A">pg · postgres:18 · Up</text>
  </g>
  <g class="f pop m" data-step="6" font-size="11.5">
    <rect x="236" y="16" width="328" height="316" rx="12" fill="none" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="8 5"/>
    <text x="400" y="352" text-anchor="middle" font-weight="700" fill="#531A8A">macOS / Windows: this box is a hidden Linux VM</text>
    <text x="400" y="370" text-anchor="middle" fill="#5C5869">ports are forwarded to localhost · on Linux, no VM</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Three parts: the <b>client</b> (the <code>docker</code> CLI), the <b>daemon</b> on the Docker host, and a <b>registry</b> that stores images.</li>
  <li>The CLI sends the request to <code>dockerd</code> over a REST API on a Unix socket. "Cannot connect to the Docker daemon" means nobody is listening there.</li>
  <li>The daemon has no <code>postgres:18</code> locally, so it pulls the missing layers from Docker Hub.</li>
  <li><b>containerd</b> takes over the container's lifecycle: it unpacks the image and supervises the process.</li>
  <li><b>runc</b> asks the kernel for namespaces and cgroups, starts the process inside them, and exits.</li>
  <li>The container is running: a fenced-off postgres process on the host's kernel.</li>
  <li>On macOS and Windows, everything inside the dashed box runs in a <b>hidden Linux VM</b> (Docker Desktop, Podman machine, OrbStack, Colima, WSL 2). Only the CLI runs natively.</li>
</ol>
{{< /fig >}}

The hidden VM explains several laptop surprises: published ports are forwarded from the VM to your `localhost`, bind mounts cross the VM boundary and are slower for big folders, the VM has its own CPU and memory limit (check the Docker Desktop settings), and Apple Silicon wants `arm64` images while `amd64`-only images run emulated.

## Images are stacks of layers

Each instruction in a Dockerfile that changes the filesystem produces a **layer**: a read-only tarball of changes, identified by its content hash. An image is an ordered list of layers. A container adds one thin **writable layer** on top.

{{< fig kicker="$ docker build -t etl:1.0 ." title="From Dockerfile to image to running containers" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <rect x="20" y="20" width="280" height="150" rx="8" fill="#260246"/>
  <text x="34" y="44" class="m" font-size="11" fill="#B9A6D3">Dockerfile</text>
  <g font-size="11.5" fill="#EEEAF5">
    <text class="m" x="34" y="72">1 FROM python:3.12-slim</text>
    <text class="m" x="34" y="98">2 COPY requirements.txt .</text>
    <text class="m" x="34" y="124">3 RUN pip install -r requirements.txt</text>
    <text class="m" x="34" y="150">4 COPY etl.py .</text>
  </g>
  <text x="430" y="315" text-anchor="middle" class="m" font-size="11" fill="#5C5869">IMAGE etl:1.0 (READ-ONLY)</text>
  <g class="f" data-step="1"><rect x="320" y="262" width="220" height="34" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="332" y="284" class="m" font-size="12" fill="#17151F">L1 python:3.12-slim</text><text x="552" y="284" class="m" font-size="11" fill="#5C5869">~45 MB</text></g>
  <g class="f" data-step="2"><rect x="320" y="222" width="220" height="34" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="332" y="244" class="m" font-size="12" fill="#17151F">L2 requirements.txt</text><text x="552" y="244" class="m" font-size="11" fill="#5C5869">1 KB</text>
    <rect x="320" y="182" width="220" height="34" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="332" y="204" class="m" font-size="12" fill="#17151F">L3 pandas, pyarrow…</text><text x="552" y="204" class="m" font-size="11" fill="#5C5869">~180 MB</text></g>
  <g class="f" data-step="3"><rect x="320" y="142" width="220" height="34" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="332" y="164" class="m" font-size="12" fill="#17151F">L4 etl.py</text><text x="552" y="164" class="m" font-size="11" fill="#5C5869">6 KB</text>
    <path d="M312 142 h-6 v154 h6" fill="none" stroke="#531A8A" stroke-width="1.4"/></g>
  <g class="f" data-step="4"><rect x="320" y="88" width="104" height="40" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="4 3"/>
    <text x="372" y="104" text-anchor="middle" class="m" font-size="11" font-weight="600" fill="#531A8A">CONTAINER A</text><text x="372" y="120" text-anchor="middle" class="m" font-size="11" fill="#5C5869">rw layer</text></g>
  <g class="f" data-step="5"><rect x="436" y="88" width="104" height="40" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="4 3"/>
    <text x="488" y="104" text-anchor="middle" class="m" font-size="11" font-weight="600" fill="#531A8A">CONTAINER B</text><text x="488" y="120" text-anchor="middle" class="m" font-size="11" fill="#5C5869">rw layer</text>
    <text x="430" y="72" text-anchor="middle" font-size="12" fill="#3D3A49">both share L1 to L4 on disk</text></g>
  <g class="f" data-step="6"><text x="20" y="208" class="m" font-size="12" font-weight="600" fill="#531A8A">edit etl.py, rebuild:</text>
    <text x="20" y="232" class="m" font-size="12" fill="#3D3A49">L1 to L3: CACHED</text>
    <text x="20" y="256" class="m" font-size="12" fill="#531A8A">L4: REBUILT (6 KB)</text>
    <text x="20" y="280" class="m" font-size="12" fill="#3D3A49">push: only L4 uploads</text></g>
</svg>
<ol class="lx-caps">
  <li>A four-line <b>Dockerfile</b> for a small Python ETL job. Nothing is built yet.</li>
  <li><b>FROM</b> pulls the base image. Its layers become the bottom of our stack.</li>
  <li><b>COPY</b> and <b>RUN</b> each add a layer. The dependency layer is the big one.</li>
  <li><b>COPY etl.py</b> adds the last layer. Together, L1 to L4 are the read-only image <b>etl:1.0</b>.</li>
  <li><b>docker run</b> starts a container: the image plus a thin <b>writable layer</b>. Files the job writes go there and vanish with the container.</li>
  <li>A second container from the same image <b>shares every image layer</b>. Only its own writable layer is new, so starting it is near-instant.</li>
  <li>Change only <b>etl.py</b> and rebuild: layers above the change are rebuilt, the rest come from the <b>build cache</b>. That is why dependency installs go before code copies.</li>
</ol>
{{< /fig >}}

## Reading an image name

A full image reference has up to five parts. `postgres` on its own is shorthand for `docker.io/library/postgres:latest`.

| Part | In `docker.io/library/postgres:18-alpine@sha256:…` | Meaning |
|---|---|---|
| Registry | `docker.io` | Where the image lives. Default is Docker Hub; others: `ghcr.io`, `quay.io`, `<account>.dkr.ecr.<region>.amazonaws.com` |
| Namespace | `library` | The owner. `library` is Docker Hub's official images; otherwise a user or org |
| Repository | `postgres` | The image name |
| Tag | `18-alpine` | A human label for one version. Mutable: it can be moved to new bytes. Default `latest` means "default", not "newest" |
| Digest | `@sha256:…` | The hash of the image manifest. Immutable: always the exact same bytes |

Pin tags (`postgres:18`) everywhere and digests in production. `docker images --digests` shows the digest of what you pulled.

## A practical Dockerfile for a data job

```dockerfile
# Stage 1: build wheels in the full image, which has compilers
FROM python:3.12 AS build
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --wheel-dir /wheels -r requirements.txt

# Stage 2: small runtime image, no compilers
FROM python:3.12-slim
RUN useradd --create-home etl
WORKDIR /app
COPY --from=build /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY etl.py .
USER etl
ENTRYPOINT ["python", "etl.py"]
```

Two habits matter most: put rarely-changing steps (dependencies) **before** often-changing ones (code) so the cache works, and use a **multi-stage** build so build tools never reach the final image.

The cache rule in one line: when a layer changes, it **and every layer after it** rebuild. Compare:

```dockerfile
# Slow: any code edit invalidates COPY, so pip reinstalls everything
COPY . .
RUN pip install -r requirements.txt

# Fast: dependencies stay cached until requirements.txt changes
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
```

`docker build -t myapp:1.0 .` builds it; the trailing `.` is the **build context**, the folder sent to the builder (filtered by `.dockerignore`).

## Anatomy of `docker run`

```bash
docker run -d --name pg -e POSTGRES_PASSWORD=secret -p 5433:5432 -v pgdata:/var/lib/postgresql postgres:18
```

| Flag | Meaning |
|---|---|
| `-d` | Detached: run in the background and print the container ID |
| `--name pg` | A name to type instead of the random ID |
| `-e KEY=value` | Environment variable: configuration and passwords |
| `-p 5433:5432` | Publish a port: **host** 5433 → **container** 5432 |
| `-v pgdata:/var/lib/postgresql` | Mount the named volume `pgdata` at that path (created if missing) |
| `--network labnet` | Attach to a user-defined network, where containers find each other by name |
| `--rm` | Delete the container when it exits (good for one-off jobs) |
| `-it` | Interactive terminal, for shells and `psql` |
| `postgres:18` | The image. Everything after it is the command and its arguments, not Docker flags |

## Ports, volumes and networks

{{< fig kicker="$ docker rm -f pg && docker run ... -v pgdata:/var/lib/postgresql postgres:18" title="The container dies, the volume survives" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <g class="m" font-size="11.5">
    <text x="20" y="54" font-size="11" fill="#5C5869">YOUR LAPTOP</text>
    <rect x="20" y="64" width="170" height="72" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="105" y="92" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">psql</text>
    <text x="105" y="112" text-anchor="middle" fill="#5C5869">localhost:5432</text>
    <rect x="220" y="24" width="520" height="304" rx="10" fill="none" stroke="#3D3A49" stroke-width="1.2" stroke-dasharray="5 4"/>
    <text x="234" y="44" font-size="11" fill="#5C5869">DOCKER HOST</text>
    <rect x="290" y="64" width="200" height="72" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="390" y="92" text-anchor="middle" font-size="12.5" font-weight="700" fill="#17151F">pg</text>
    <text x="390" y="112" text-anchor="middle" fill="#5C5869">postgres on :5432</text>
  </g>
  <g class="f m" data-step="1" font-size="11">
    <line class="flow" x1="190" y1="100" x2="282" y2="100" stroke="#531A8A" stroke-width="1.6"/>
    <rect x="282" y="88" width="14" height="24" rx="2" fill="#531A8A"/>
    <text x="236" y="90" text-anchor="middle" fill="#531A8A">-p 5432:5432</text>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M190 100 H284"/></circle>
  </g>
  <g class="f m" data-step="2" font-size="11">
    <line class="flow" x1="390" y1="136" x2="390" y2="224" stroke="#531A8A" stroke-width="1.6"/>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M390 136 V222"/></circle>
    <text x="380" y="180" text-anchor="end" fill="#3D3A49">INSERT 2 rows</text>
    <text x="400" y="180" fill="#5C5869">-v pgdata:/var/lib/postgresql</text>
    <path d="M300 236 v50 a90 12 0 0 0 180 0 v-50" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <ellipse cx="390" cy="236" rx="90" ry="12" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="390" y="270" text-anchor="middle" font-size="12.5" font-weight="700" fill="#531A8A">volume pgdata</text>
    <text x="390" y="288" text-anchor="middle" font-size="11.5" fill="#5C5869">users: Alice, Sam</text>
  </g>
  <g class="f pop m" data-step="3" font-size="11.5">
    <rect x="196" y="56" width="302" height="88" rx="6" fill="#FDF4F3" stroke="#C2382F" stroke-width="1.6" stroke-dasharray="5 4"/>
    <text x="347" y="94" text-anchor="middle" font-size="12.5" font-weight="700" fill="#C2382F">docker rm -f pg</text>
    <text x="347" y="114" text-anchor="middle" fill="#C2382F">container + writable layer gone</text>
  </g>
  <g class="f slide-l m" data-step="4" font-size="11.5">
    <path class="flow" d="M480 262 H645 V136" fill="none" stroke="#531A8A" stroke-width="1.6"/>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.8s" repeatCount="indefinite" path="M480 262 H645 V136"/></circle>
    <rect x="560" y="64" width="170" height="72" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.6"/>
    <text x="645" y="92" text-anchor="middle" font-size="12.5" font-weight="700" fill="#531A8A">pg (new)</text>
    <text x="645" y="112" text-anchor="middle" fill="#5C5869">same -v pgdata</text>
  </g>
  <g class="f pop m" data-step="5" font-size="11.5">
    <text x="500" y="300" fill="#17151F">SELECT * FROM users;</text>
    <text x="500" y="318" font-weight="700" fill="#1F8A55">2 rows: the data survived</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>A Postgres container is running, but nothing on your laptop can reach it yet: containers are isolated by default.</li>
  <li><code>-p 5432:5432</code> opens a door: traffic to <b>localhost:5432</b> on the host is forwarded to port 5432 inside the container.</li>
  <li>Rows you insert are written to <code>/var/lib/postgresql</code>, which is the named volume <b>pgdata</b>, not the container's own layer.</li>
  <li><code>docker rm -f pg</code> destroys the container and its writable layer. The volume is not touched.</li>
  <li>Run the same command again: a brand-new container mounts the same <b>pgdata</b> volume.</li>
  <li>The rows are still there. Containers are disposable; volumes hold the state.</li>
</ol>
{{< /fig >}}

**Where data should live:**

| Mount | Example | Best for | Survives `docker rm`? |
|---|---|---|---|
| Named volume | `-v pgdata:/var/lib/postgresql` | Databases. Docker manages where it lives | Yes |
| Bind mount | `-v "$(pwd)/src":/app` | Live-editing code, passing input files | Yes, it is your folder |
| tmpfs | `--tmpfs /tmp` | Scratch space, secrets that must not touch disk | No, it lives in RAM |
| Nothing | | | No: writes go to the container layer |

Manage volumes with `docker volume ls`, `docker volume inspect pgdata`, `docker volume rm pgdata` and `docker volume prune` (unused volumes only).

**Postgres 18 changed the mount path.** For `postgres:18` and newer, mount the volume at `/var/lib/postgresql`; for `postgres:17` and older it is `/var/lib/postgresql/data`. Most tutorials still show the old path; on 18 it either fails to start or leaves your data outside the volume.

**Networks.** On a user-defined network (`docker network create labnet`), containers reach each other **by name**: a web app connects to `db:5432`. The default bridge network has no name resolution. Inside a container, `localhost` means **that container itself**, not your laptop and not the database container.

## Docker Compose for local stacks

`docker compose` (Compose v2, built into the CLI) starts several containers from one YAML file. It is the usual way to run a local data stack: Postgres as a source, Kafka, MinIO as fake S3, and Airflow, all on one private network where containers reach each other by service name.

```yaml
services:
  postgres:
    image: postgres:17
    environment: { POSTGRES_PASSWORD: dev }
    volumes: [pgdata:/var/lib/postgresql/data]
  minio:
    image: minio/minio
    command: server /data
    ports: ["9000:9000"]
volumes:
  pgdata:
```

MinIO stopped publishing community Docker images in late 2025, so `minio/minio` no longer gets updates; it is fine for a throwaway local stack, but for anything longer-lived consider an S3-compatible alternative such as SeaweedFS or Garage.

Compose is for development and single-host setups. For many hosts, use [Kubernetes]({{< relref "../../container-orchestration/kubernetes" >}}).

## Ten commands you'll use daily

A container moves through `created → running → stopped → removed`: `run` creates and starts it, `stop` halts it with its files intact, `start` brings it back, `rm` deletes it.

| Command | What it does |
|---|---|
| `docker run IMAGE` | Create and start a container |
| `docker ps -a` | List containers, including stopped ones |
| `docker logs -f NAME` | Follow its output |
| `docker exec -it NAME sh` | Open a shell inside a running container (debug only) |
| `docker stop NAME` | Stop it; its files stay |
| `docker start NAME` | Start a stopped container again |
| `docker rm -f NAME` | Delete it and its writable layer |
| `docker inspect NAME` | Every detail (IP, mounts, env, exit code) as JSON |
| `docker images` | List local images |
| `docker rmi IMAGE` | Delete an image |

And for building and shipping images:

| Command | What it does |
|---|---|
| `docker build -t etl:1.0 .` | Build an image from the Dockerfile in `.` |
| `docker image history etl:1.0` | Show the layers and their sizes |
| `docker tag etl:1.0 ghcr.io/acme/etl:1.0` | Give the image a registry name |
| `docker push ghcr.io/acme/etl:1.0` | Upload it to a registry |
| `docker system df`, `docker system prune` | See and reclaim disk used by stopped containers, unused images and cache |

## Hands-on lab: Postgres and a web UI in Docker

About an hour, no programming. You need Docker Desktop (macOS, Windows) or Docker Engine with the Compose plugin (Linux); `docker version` must show both a Client and a Server section. Pre-pull the images on a good connection: `docker pull postgres:18 adminer alpine`.

**1. Run Postgres.**

```bash
docker run -d --name pg \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql \
  postgres:18
docker ps            # pg should show as Up
docker logs pg       # look for: database system is ready to accept connections
```

Port 5432 already taken by a local Postgres? Use `-p 5433:5432`.

**2. Connect and query.**

```bash
docker exec -it pg psql -U postgres
```

```sql
CREATE TABLE users (id serial PRIMARY KEY, name text NOT NULL, city text);
INSERT INTO users (name, city) VALUES ('Alice', 'Berlin'), ('Sam', 'Lisbon');
SELECT * FROM users;
\q
```

Any SQL client on your laptop can also connect to `localhost:5432` as `postgres` / `secret`.

**3. Destroy the container, keep the data.**

```bash
docker rm -f pg
docker run -d --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 \
  -v pgdata:/var/lib/postgresql postgres:18          # same command as step 1
docker exec -it pg psql -U postgres -c "SELECT * FROM users;"
```

Alice and Sam are still there. Repeat with `-v pgdata2:/var/lib/postgresql` and the table is gone: a new volume is an empty database.

**4. Build your own image with seed data.** In an empty folder, create `init.sql`:

```sql
CREATE TABLE cities (id serial PRIMARY KEY, name text NOT NULL, country text);
INSERT INTO cities (name, country) VALUES ('Berlin', 'Germany'), ('Lisbon', 'Portugal');
```

and a `Dockerfile`:

```dockerfile
FROM postgres:18
# *.sql and *.sh files here run on the first start of an empty database
COPY init.sql /docker-entrypoint-initdb.d/
```

```bash
docker build -t cities-db:1.0 .
docker run -d --name cities -e POSTGRES_PASSWORD=secret -p 5433:5432 cities-db:1.0
docker exec -it cities psql -U postgres -c "SELECT * FROM cities;"
```

Init scripts run only when the data directory is empty, so they are skipped when you mount a volume that already holds a database.

**5. Connect a web server to the database.** Two containers on a user-defined network, finding each other by name. [Adminer](https://hub.docker.com/_/adminer) is a small web UI for databases.

```bash
docker rm -f pg cities                  # free port 5432 and the pgdata volume
docker network create labnet
docker run -d --name db  --network labnet -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql postgres:18
docker run -d --name web --network labnet -p 8080:8080 adminer
```

Open <http://localhost:8080> and log in with System **PostgreSQL**, Server **db**, user `postgres`, password `secret`. The server is the container **name**, not an IP and not `localhost`. Note that `db` publishes no port: only containers on `labnet` can reach it.

**6. The same with one Compose file.** Remove the two containers (`docker rm -f db web`), then save this as `compose.yaml`:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql
  web:
    image: adminer
    ports:
      - "8080:8080"
    depends_on: [db]
volumes:
  pgdata:
```

```bash
docker compose up -d       # creates a network; services reach each other by service name
docker compose ps
docker compose down        # removes containers and network, keeps the volume
docker compose down -v     # also deletes the volume and the data
```

Clean up afterwards with `docker volume rm pgdata pgdata2` and `docker system prune`.

## Troubleshooting

| You see | Check with | Fix |
|---|---|---|
| `Cannot connect to the Docker daemon` | `docker version` (no Server section) | Start Docker Desktop, or `sudo systemctl start docker` on Linux |
| `port is already allocated` / `address already in use` | `docker ps`, `lsof -i :5432` | Stop the other process, or map a different host port: `-p 5433:5432` |
| Postgres exits: `superuser password is not specified` | `docker logs pg` | Add `-e POSTGRES_PASSWORD=...` |
| Postgres 18 fails with a mount or data-directory error | `docker inspect pg` (Mounts) | Mount at `/var/lib/postgresql`, not `/var/lib/postgresql/data` |
| `init.sql` did not run | `docker volume ls` | The volume already held a database. Use a new volume, or `docker volume rm` it |
| App container cannot reach `localhost:5432` | `docker network inspect labnet` | Put both on one user-defined network and connect to `db:5432` |
| "It worked a minute ago" | `docker ps -a` | The container exited; read why with `docker logs NAME` |
| Pull is slow or blocked | `docker pull` output | Use a mirror, or `docker save -o images.tar postgres:18` on one machine and `docker load -i images.tar` on another |
| Anything else | `docker logs NAME` | Read the last lines first |

If you remember three words: an **image** is the recipe (read-only layers), a **container** is a running instance (an isolated process), and a **volume** is the data that outlives the container.

## Common mistakes

- **`latest` in production.** Tags are mutable. Pin a version, or better, the image digest (`@sha256:…`).
- **Secrets in layers.** A password in a `COPY`ed file or `ENV` stays in the image history even if a later step deletes it. Use BuildKit secrets (`RUN --mount=type=secret`) and runtime env vars.
- **Data in the container layer.** Without a volume, `docker rm` deletes your database. Mount a named volume for anything you want to keep.
- **`localhost` inside a container.** It is the container itself. Use the other container's name on a shared network.
- **No `.dockerignore`.** Without it, `.git`, local data dumps and virtualenvs are sent to the builder and may end up in the image.
- **Licensing surprise.** Docker Engine and CLI are open source, but **Docker Desktop** requires a paid subscription for larger companies. Check the current terms, or use Podman Desktop, Rancher Desktop, Colima or OrbStack.

## Learning Resources

### Official

- [Docker documentation and guides](https://docs.docker.com/guides/)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) and [build best practices](https://docs.docker.com/build/building/best-practices/)
- [Docker Compose documentation](https://docs.docker.com/compose/)

### Books

- [Docker Deep Dive, Nigel Poulton](https://nigelpoulton.com/books/)
- [Docker in Action, 2nd ed. (Manning)](https://www.manning.com/books/docker-in-action-second-edition)

### Courses and tutorials

- [Docker Curriculum](https://docker-curriculum.com/)
- [Complete Docker Course (YouTube)](https://www.youtube.com/watch?v=RqTEHSBrYFw)
- [Docker Tutorial for Beginners (YouTube)](https://www.youtube.com/watch?v=3c-iBn73dDE)
