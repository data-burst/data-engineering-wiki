---
weight: 1
description: "Linux for data engineers: processes, files and permissions, pipes, memory and the OOM killer, systemd, cgroups, namespaces and everyday commands."
---
# Linux

**Linux** is an open-source operating system kernel, packaged with tools into **distributions** such as Ubuntu, Debian, Red Hat Enterprise Linux, Rocky, Amazon Linux and Alpine. It runs nearly every server, cloud VM and container in the world, so it is where your databases, Kafka brokers, Spark executors and Airflow workers actually live. Knowing Linux means you can log into a box, find out why a job is slow or dead, and fix it.

## The ideas that matter

- **Everything is a file.** Regular files, directories, devices (`/dev/sda`), sockets and pipes are all opened, read and written the same way, through **file descriptors**.
- **Processes.** Every running program is a process with a PID, a parent, an owner, environment variables and open file descriptors. A process exits with a **status code**: 0 is success, anything else is failure. Schedulers like Airflow decide task success from that code.
- **Users and permissions.** Each file has an owner, a group and `rwx` bits for owner, group and others. `root` bypasses checks, which is why services should run as their own unprivileged user.
- **Small tools, joined by pipes.** `cmd1 | cmd2` streams the output of one program into the next, concurrently, without temp files.
- **The kernel isolates.** **Namespaces** give a process its own view of PIDs, network and mounts; **cgroups** cap its CPU and memory. Together they are what a [container]({{< relref "/docs/roadmap/containerization" >}}) is.

## The filesystem layout

| Path | Holds |
|---|---|
| `/etc` | System and service configuration (`/etc/postgresql/`, `/etc/hosts`) |
| `/var/log` | Logs, when not in the systemd journal |
| `/var/lib` | Service data (`/var/lib/postgresql`, `/var/lib/docker`) |
| `/home/<user>`, `/root` | User home directories |
| `/tmp` | Temporary files, often cleared on reboot |
| `/proc`, `/sys` | Live kernel and process information as files (`/proc/meminfo`, `/proc/<pid>/limits`) |
| `/opt`, `/usr/local` | Software installed outside the package manager |

## Commands you will use every week

| Task | Commands |
|---|---|
| Move around, inspect files | `ls -lah`, `cd`, `less`, `head`, `tail -f app.log`, `find . -name '*.parquet'` |
| Search and transform text | `grep -r`, `sed`, `awk`, `sort`, `uniq -c`, `wc -l`, `jq` for JSON |
| Disk | `df -h` (free space per filesystem), `du -sh *` (what is using it) |
| Processes and load | `ps aux`, `top` / `htop`, `kill`, `pgrep`, `uptime` |
| Memory | `free -h`, `dmesg -T \| grep -i oom` |
| Network | `ss -tlnp` (who listens on which port), `curl -v`, `dig`, `nc -vz host port` |
| Services and logs | `systemctl status airflow-scheduler`, `journalctl -u kafka -f` |
| Permissions | `chmod`, `chown`, `sudo`, `id` |
| Remote work | `ssh`, `scp`, `rsync -avz`, `tmux` (keep a session alive after you disconnect) |

A typical one-liner: the ten most frequent error messages in a log.

```bash
grep ERROR app.log | cut -d' ' -f4- | sort | uniq -c | sort -rn | head
```

## Where data jobs meet the kernel

- **The OOM killer.** When memory runs out, or a container hits its cgroup limit, the kernel kills a process. Your Spark executor or pod just vanishes with exit code **137** (128 + SIGKILL). Check `dmesg` or `kubectl describe pod`, then raise the limit or reduce memory use.
- **File descriptor limits.** Kafka, Elasticsearch and databases keep many files and sockets open. The default `ulimit -n` of 1024 is far too low; services set `LimitNOFILE` in their systemd unit.
- **The page cache.** Linux uses free RAM to cache disk reads. "Free" memory near zero is normal; look at `available` in `free -h`.
- **Signals.** `SIGTERM` asks a process to stop cleanly; `SIGKILL` cannot be caught. Orchestrators send SIGTERM, wait a grace period, then SIGKILL, so jobs should handle SIGTERM and checkpoint.
- **Cron and systemd timers.** The original schedulers. Still fine for a single box; use a real orchestrator once jobs depend on each other.

## Common mistakes

- **Running everything as root**, including containers. One bug becomes a full compromise.
- **Filling the disk with logs.** Configure log rotation (`logrotate`, journald limits) before it happens at 3 a.m.
- **`chmod 777` to fix a permission error.** Find the right owner and group instead.
- **Editing config on one server by hand.** It drifts and can't be rebuilt. Use [Infrastructure as Code]({{< relref "/docs/roadmap/infrastructure-as-code" >}}) or at least a container image.
- **Ignoring exit codes in shell scripts.** Start scripts with `set -euo pipefail` so a failed step stops the job instead of loading half the data.

## Learning Resources

### Books

- [How Linux Works, 3rd edition](https://nostarch.com/howlinuxworks3): Brian Ward
- [The Linux Command Line, 2nd edition](https://linuxcommand.org/tlcl.php): William Shotts, free PDF
- [Linux Pocket Guide, 4th edition](https://www.oreilly.com/library/view/linux-pocket-guide/9781098157951/): Daniel J. Barrett
- [Systems Performance, 2nd edition](https://www.brendangregg.com/systems-performance-2nd-edition-book.html): Brendan Gregg, for when you need to know why it's slow

### Courses and practice

- [The Missing Semester of Your CS Education](https://missing.csail.mit.edu/): MIT, shell, scripting and tools
- [Introduction to Linux: Full Course for Beginners](https://www.youtube.com/watch?v=sWbUDq4S6Y8): freeCodeCamp
- [OverTheWire: Bandit](https://overthewire.org/wargames/bandit/): learn the shell through a game
- [Linux Journey](https://linuxjourney.com/)

### Reference

- [Linux man pages online](https://man7.org/linux/man-pages/)
- [Linux Performance](https://www.brendangregg.com/linuxperf.html): Brendan Gregg's tools and checklists

See also: [SSH]({{< relref "/docs/roadmap/networking/protocols/ssh" >}}), [Networking]({{< relref "/docs/roadmap/networking" >}}).
