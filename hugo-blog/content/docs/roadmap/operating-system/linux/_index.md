---
title: "Linux"
weight: 1
description: "Linux for data engineers: the shell, pipes, sed and awk, permissions, processes and signals, environment variables, shell scripts, memory and the OOM killer."
---
<div class="lx-kicker-line">$ grep ' 500 ' access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head</div>

# Linux

**Linux** is an open-source operating system kernel, packaged with tools into **distributions** such as Ubuntu, Debian, Red Hat Enterprise Linux, Rocky, Amazon Linux and Alpine. It runs nearly every server, cloud VM and container in the world, so it is where your databases, Kafka brokers, Spark executors and Airflow workers actually live. Knowing Linux means you can log into a box, find out why a job is slow or dead, and fix it, usually with a handful of small commands joined by pipes.

## Small tools, joined by pipes

Each command does one thing and writes plain text. The pipe `|` connects the **stdout** of one command to the **stdin** of the next. All stages run at the same time and stream line by line, so this works on a 50 GB log without temp files. Below: which endpoints fail most often, from a web server access log where each line looks like `203.0.113.7 - - [17/Oct/2026:18:30:01 +0000] "GET /cart HTTP/1.1" 500 512`.

{{< fig kicker="$ grep ' 500 ' access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -2 > top.txt" title="A log shrinks into an answer, one stage at a time" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 412">
  <g font-size="11">
    <rect x="20" y="16" width="200" height="32" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="34" y="37" font-size="12" font-weight="700" fill="#531A8A">access.log</text>
    <text class="m" x="210" y="37" text-anchor="end" fill="#5C5869">9 lines</text>
    <rect x="240" y="16" width="50" height="32" rx="4" fill="#fff" stroke="#C9C6D3"/><text class="m" x="265" y="29" text-anchor="middle" fill="#5C5869">200</text><text class="m" x="265" y="43" text-anchor="middle" fill="#5C5869">/home</text>
    <rect x="295" y="16" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="320" y="29" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="320" y="43" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="350" y="16" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="375" y="29" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="375" y="43" text-anchor="middle" fill="#17151F">/pay</text>
    <rect x="405" y="16" width="50" height="32" rx="4" fill="#fff" stroke="#C9C6D3"/><text class="m" x="430" y="29" text-anchor="middle" fill="#5C5869">404</text><text class="m" x="430" y="43" text-anchor="middle" fill="#5C5869">/img</text>
    <rect x="460" y="16" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="485" y="29" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="485" y="43" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="515" y="16" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="540" y="29" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="540" y="43" text-anchor="middle" fill="#17151F">/api</text>
    <rect x="570" y="16" width="50" height="32" rx="4" fill="#fff" stroke="#C9C6D3"/><text class="m" x="595" y="29" text-anchor="middle" fill="#5C5869">200</text><text class="m" x="595" y="43" text-anchor="middle" fill="#5C5869">/pay</text>
    <rect x="625" y="16" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="650" y="29" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="650" y="43" text-anchor="middle" fill="#17151F">/pay</text>
    <rect x="680" y="16" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="705" y="29" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="705" y="43" text-anchor="middle" fill="#17151F">/cart</text>
  </g>
  <g class="f slide-r" data-step="1" font-size="11">
    <line class="flow" x1="120" y1="48" x2="120" y2="66" stroke="#531A8A" stroke-width="1.6"/>
    <text class="m" x="130" y="61" fill="#5C5869">| stdout → stdin</text>
    <rect x="20" y="66" width="200" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="87" font-size="12" font-weight="700" fill="#17151F">grep ' 500 '</text>
    <text class="m" x="210" y="87" text-anchor="end" fill="#5C5869">6 lines</text>
    <rect x="240" y="66" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="265" y="79" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="265" y="93" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="295" y="66" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="320" y="79" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="320" y="93" text-anchor="middle" fill="#17151F">/pay</text>
    <rect x="350" y="66" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="375" y="79" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="375" y="93" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="405" y="66" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="430" y="79" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="430" y="93" text-anchor="middle" fill="#17151F">/api</text>
    <rect x="460" y="66" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="485" y="79" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="485" y="93" text-anchor="middle" fill="#17151F">/pay</text>
    <rect x="515" y="66" width="50" height="32" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text class="m" x="540" y="79" text-anchor="middle" font-weight="700" fill="#531A8A">500</text><text class="m" x="540" y="93" text-anchor="middle" fill="#17151F">/cart</text>
  </g>
  <g class="f slide-r" data-step="2" font-size="11">
    <line class="flow" x1="120" y1="98" x2="120" y2="116" stroke="#531A8A" stroke-width="1.6"/>
    <text class="m" x="130" y="111" fill="#5C5869">|</text>
    <rect x="20" y="116" width="200" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="137" font-size="12" font-weight="700" fill="#17151F">awk '{print $7}'</text>
    <text class="m" x="210" y="137" text-anchor="end" fill="#5C5869">6 lines</text>
    <rect x="240" y="120" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="265" y="136" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="295" y="120" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="320" y="136" text-anchor="middle" fill="#17151F">/pay</text>
    <rect x="350" y="120" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="375" y="136" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="405" y="120" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="430" y="136" text-anchor="middle" fill="#17151F">/api</text>
    <rect x="460" y="120" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="485" y="136" text-anchor="middle" fill="#17151F">/pay</text>
    <rect x="515" y="120" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="540" y="136" text-anchor="middle" fill="#17151F">/cart</text>
  </g>
  <g class="f slide-r" data-step="3" font-size="11">
    <line class="flow" x1="120" y1="148" x2="120" y2="166" stroke="#531A8A" stroke-width="1.6"/>
    <text class="m" x="130" y="161" fill="#5C5869">|</text>
    <rect x="20" y="166" width="200" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="187" font-size="12" font-weight="700" fill="#17151F">sort</text>
    <text class="m" x="210" y="187" text-anchor="end" fill="#5C5869">6 lines</text>
    <rect x="240" y="170" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="265" y="186" text-anchor="middle" fill="#17151F">/api</text>
    <rect x="295" y="170" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="320" y="186" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="350" y="170" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="375" y="186" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="405" y="170" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="430" y="186" text-anchor="middle" fill="#17151F">/cart</text>
    <rect x="460" y="170" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="485" y="186" text-anchor="middle" fill="#17151F">/pay</text>
    <rect x="515" y="170" width="50" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="540" y="186" text-anchor="middle" fill="#17151F">/pay</text>
    <line class="flow" x1="120" y1="198" x2="120" y2="216" stroke="#531A8A" stroke-width="1.6"/>
    <text class="m" x="130" y="211" fill="#5C5869">|</text>
    <rect x="20" y="216" width="200" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="237" font-size="12" font-weight="700" fill="#17151F">uniq -c</text>
    <text class="m" x="210" y="237" text-anchor="end" fill="#5C5869">3 lines</text>
    <rect x="240" y="220" width="66" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="273" y="236" text-anchor="middle" fill="#17151F">1 /api</text>
    <rect x="311" y="220" width="66" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="344" y="236" text-anchor="middle" fill="#17151F">3 /cart</text>
    <rect x="382" y="220" width="66" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="415" y="236" text-anchor="middle" fill="#17151F">2 /pay</text>
  </g>
  <g class="f slide-r" data-step="4" font-size="11">
    <line class="flow" x1="120" y1="248" x2="120" y2="266" stroke="#531A8A" stroke-width="1.6"/>
    <text class="m" x="130" y="261" fill="#5C5869">|</text>
    <rect x="20" y="266" width="200" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="287" font-size="12" font-weight="700" fill="#17151F">sort -rn</text>
    <text class="m" x="210" y="287" text-anchor="end" fill="#5C5869">3 lines</text>
    <rect x="240" y="270" width="66" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="273" y="286" text-anchor="middle" fill="#17151F">3 /cart</text>
    <rect x="311" y="270" width="66" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="344" y="286" text-anchor="middle" fill="#17151F">2 /pay</text>
    <rect x="382" y="270" width="66" height="24" rx="4" fill="#fff" stroke="#531A8A"/><text class="m" x="415" y="286" text-anchor="middle" fill="#17151F">1 /api</text>
    <line class="flow" x1="120" y1="298" x2="120" y2="316" stroke="#531A8A" stroke-width="1.6"/>
    <text class="m" x="130" y="311" fill="#5C5869">|</text>
    <rect x="20" y="316" width="200" height="32" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="34" y="337" font-size="12" font-weight="700" fill="#17151F">head -2</text>
    <text class="m" x="210" y="337" text-anchor="end" fill="#5C5869">2 lines</text>
    <g class="pulse">
      <rect x="240" y="320" width="66" height="24" rx="4" fill="#531A8A"/><text class="m" x="273" y="336" text-anchor="middle" font-weight="700" fill="#fff">3 /cart</text>
      <rect x="311" y="320" width="66" height="24" rx="4" fill="#531A8A"/><text class="m" x="344" y="336" text-anchor="middle" font-weight="700" fill="#fff">2 /pay</text>
    </g>
  </g>
  <g class="f pop" data-step="5" font-size="11">
    <line class="flow" x1="120" y1="348" x2="120" y2="366" stroke="#531A8A" stroke-width="1.6"/>
    <text class="m" x="130" y="361" fill="#5C5869">&gt;</text>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.4s" repeatCount="indefinite" path="M120 348 L120 366"/></circle>
    <rect x="20" y="366" width="200" height="32" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="34" y="387" font-size="12" font-weight="700" fill="#531A8A">top.txt</text>
    <text class="m" x="210" y="387" text-anchor="end" fill="#5C5869">file</text>
    <text class="m" x="240" y="379" fill="#17151F">stdout (fd 1) → top.txt, overwritten on every run</text>
    <text class="m" x="240" y="395" fill="#5C5869">stderr (fd 2) never enters the pipe: it still hits the screen</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The raw log: one line per request. We want the endpoints that return <b>HTTP 500</b> most often.</li>
  <li><code>grep ' 500 '</code> keeps only matching lines. Its stdout becomes the next command's stdin.</li>
  <li><code>awk '{print $7}'</code> splits each line on spaces and keeps field 7, the request path.</li>
  <li><code>sort</code> puts equal lines next to each other, so <code>uniq -c</code> can collapse them into counts. <code>uniq</code> only merges <b>adjacent</b> duplicates.</li>
  <li><code>sort -rn</code> ranks by the number, biggest first, and <code>head -2</code> keeps the top two.</li>
  <li><code>&gt; top.txt</code> sends the final stdout to a file. Error messages travel on <b>stderr</b>, which skips both the pipe and the file unless you redirect it with <code>2&gt;</code>.</li>
</ol>
{{< /fig >}}

Every process starts with three open file descriptors. Redirection rewires them:

| Syntax | Meaning |
|---|---|
| `cmd > out.txt` | stdout (fd 1) to a file, **overwriting** it |
| `cmd >> out.txt` | stdout appended to the end of the file |
| `cmd 2> err.txt` | stderr (fd 2) to a file |
| `cmd > all.log 2>&1` | stdout to the file, then stderr to wherever stdout points (order matters) |
| `cmd > /dev/null 2>&1` | discard everything |
| `cmd < in.txt` | stdin (fd 0) from a file |
| `cmd1 \| cmd2` | stdout of `cmd1` into stdin of `cmd2` |
| `cmd \| tee out.txt` | write to a file **and** keep passing it down the pipe |

By default, a pipeline's exit status is the status of its **last** command, so `grep ... missing.log | sort` "succeeds" even when grep failed. `set -o pipefail` fixes that (see [shell scripts](#shell-scripts)).

## The ideas that matter

- **A kernel, not a whole OS.** The kernel shares CPU, memory, disks and the network between programs. A distribution adds the shell, tools and a package manager (`apt`, `dnf`, `apk`).
- **Everything is a file.** Regular files, directories, devices (`/dev/sda`), sockets and pipes are all opened, read and written the same way, through **file descriptors**.
- **Processes.** Every running program is a process with a PID, a parent, an owner, environment variables and open file descriptors. A process exits with a **status code**: 0 is success, anything else is failure. Schedulers like Airflow decide task success from that code.
- **Users and permissions.** Each file has an owner, a group and `rwx` bits for owner, group and others. `root` bypasses checks, which is why services should run as their own unprivileged user.
- **The kernel isolates.** **Namespaces** give a process its own view of PIDs, network and mounts; **cgroups** cap its CPU and memory. Together they are what a [container]({{< relref "/docs/roadmap/containerization" >}}) is.

## Directory structure

There are no drive letters. Everything hangs off one tree that starts at `/`, and extra disks are **mounted** somewhere inside it (`/mnt/data`, `/var/lib/postgresql`).

| Path | Holds |
|---|---|
| `/` | The root of the tree |
| `/home/<user>` (`~`), `/root` | User home directories; `~` is a shortcut for yours |
| `/etc` | System and service configuration as plain text (`/etc/hosts`, `/etc/postgresql/`, `/etc/os-release`) |
| `/var/log`, `/var/lib` | Data that changes: logs, and service data (`/var/lib/docker`) |
| `/tmp` | Scratch space for anyone, often wiped on reboot |
| `/usr/bin`, `/usr/local/bin`, `/opt` | Installed programs; `/usr/local` and `/opt` for software outside the package manager |
| `/dev` | Devices as files: disks, terminals, and `/dev/null`, which swallows anything written to it |
| `/proc`, `/sys` | Live kernel and process information, generated on the fly (`/proc/meminfo`, `/proc/<pid>/limits`) |

Paths starting with `/` are **absolute**; anything else is **relative** to where you are. `.` is the current folder, `..` the parent.

## Anatomy of a command

```text
alice@etl-01:~$  ls      -la       /var/log
└── prompt ───┘  command options   argument
user@host:folder         (flags)
```

The **terminal** is the window; the **shell** (`bash`, `zsh`) is the program inside it that parses the line, expands `~`, `*` and `$VAR`, and starts the command. Short options can be combined (`-l -a` = `-la`); long options are spelled out (`--all`). Quote arguments that contain spaces or `*`: `grep "connection reset" app.log`.

## Commands you will use every week

| Task | Commands |
|---|---|
| Move around | `pwd`, `ls -lah`, `cd dir`, `cd ..`, `cd -` (back to the previous folder) |
| Manage files | `mkdir -p a/b/c`, `touch`, `cp -r`, `mv` (move or rename), `rm -r` (no trash can) |
| Read files | `cat`, `less` (`/` to search, `q` to quit), `head -n 5`, `tail -n 20`, `tail -f app.log` |
| Search | `grep -rn "TODO" .`, `grep -i` / `-v` / `-c`, `find . -name '*.parquet'` |
| Transform text | `sed`, `awk`, `cut`, `sort`, `uniq -c`, `wc -l`, `jq` for JSON |
| Disk | `df -h` (free space per filesystem), `du -sh *` (what is using it) |
| Processes and load | `ps aux`, `top` / `htop`, `kill`, `pgrep -a`, `uptime` |
| Memory | `free -h`, `dmesg -T \| grep -i oom` |
| Network | `ss -tlnp` (who listens on which port), `curl -v`, `dig`, `nc -vz host port` |
| Services and logs | `systemctl status airflow-scheduler`, `journalctl -u kafka -f` |
| Remote work | `ssh`, `scp`, `rsync -avz`, `tmux` (keep a session alive after you disconnect) |

## sed and awk one-liners

`sed` edits streams of text; `awk` treats each line as columns (`$1`, `$2`, … split on whitespace, or on `-F`).

```bash
sed 's/http:/https:/g' urls.txt         # replace every match, print the result
sed -i 's/8080/9090/' app.conf          # edit the file in place (GNU sed; macOS needs -i '')
sed -n '10,20p' big.log                 # print only lines 10 to 20

awk '{print $1}' access.log             # first column: client IPs
awk -F: '{print $1}' /etc/passwd        # split on ':' and list every username
awk '$9 == 404' access.log              # only rows whose 9th field is 404
awk -F, '{s += $3} END {print s}' sales.csv   # sum a CSV column (no quoted commas)
```

For real CSV with quoted fields, reach for `csvkit`, `duckdb` or Python instead of `awk -F,`.

## History and shortcuts

| Key or command | Does |
|---|---|
| `Tab` (twice) | Complete commands and paths (show all options) |
| `↑` / `↓` | Previous / next command |
| `Ctrl-R` | Search history as you type; press again for older matches |
| `Ctrl-A` / `Ctrl-E` | Jump to start / end of the line |
| `Ctrl-C` | Stop the running command (not copy) |
| `Ctrl-L` | Clear the screen |
| `history`, `!42` | Numbered list of past commands; rerun number 42 |
| `!!` | The previous command: `sudo !!` reruns it as root |

## Getting help and installing software

```bash
man ls                 # the full manual; q quits, / searches
ls --help              # short summary
tldr tar               # community examples (install tldr first)
type cd                # builtin, alias or file?
which python3          # which file runs when you type python3

sudo apt update                 # refresh the package list (Debian, Ubuntu)
apt search htop
sudo apt install htop
sudo apt remove htop
```

Red Hat family distributions use `dnf install`, Alpine (common in container images) uses `apk add`. `sudo` runs one command as root: read the whole line before you press Enter.

## File permissions

{{< fig kicker="$ ls -l etl.sh" title="Reading a permission string, then changing it" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 380">
  <text class="m" x="40" y="28" font-size="12" fill="#5C5869">$ ls -l etl.sh</text>
  <g class="m" font-size="22" fill="#17151F" text-anchor="middle">
    <text x="70" y="62">-</text>
    <text x="140" y="62">r</text><text x="165" y="62">w</text><text x="190" y="62">x</text>
    <text x="250" y="62">r</text><text x="275" y="62">-</text><text x="300" y="62">x</text>
    <text x="360" y="62">-</text><text x="385" y="62">-</text><text x="410" y="62">-</text>
  </g>
  <text class="m" x="470" y="62" font-size="18" fill="#17151F">alice</text>
  <text class="m" x="555" y="62" font-size="18" fill="#17151F">data</text>
  <text class="m" x="630" y="62" font-size="18" font-weight="700" fill="#17151F">etl.sh</text>
  <g class="f slide-r" data-step="1">
    <g fill="none" stroke="#531A8A" stroke-width="1.4">
      <path d="M60 74v6h20v-6"/><path d="M128 74v6h74v-6"/><path d="M238 74v6h74v-6"/><path d="M348 74v6h74v-6"/>
    </g>
    <g class="m" font-size="12" text-anchor="middle">
      <text x="70" y="102" font-weight="700" fill="#531A8A">type</text><text x="70" y="118" fill="#5C5869">- file</text>
      <text x="165" y="102" font-weight="700" fill="#531A8A">owner · u</text><text x="165" y="118" fill="#5C5869">alice</text>
      <text x="275" y="102" font-weight="700" fill="#531A8A">group · g</text><text x="275" y="118" fill="#5C5869">data</text>
      <text x="385" y="102" font-weight="700" fill="#531A8A">others · o</text><text x="385" y="118" fill="#5C5869">everyone else</text>
    </g>
  </g>
  <g class="f pop" data-step="2">
    <g class="m" text-anchor="middle">
      <text x="165" y="152" font-size="12" fill="#5C5869">4+2+1</text><text x="275" y="152" font-size="12" fill="#5C5869">4+0+1</text><text x="385" y="152" font-size="12" fill="#5C5869">0+0+0</text>
      <text x="165" y="184" font-size="24" font-weight="700" fill="#531A8A">7</text><text x="275" y="184" font-size="24" font-weight="700" fill="#531A8A">5</text><text x="385" y="184" font-size="24" font-weight="700" fill="#531A8A">0</text>
    </g>
    <text class="m" x="480" y="152" font-size="12" fill="#5C5869">r=4 · w=2 · x=1</text>
    <text class="m pulse" x="480" y="184" font-size="24" font-weight="700" fill="#531A8A">octal 750</text>
  </g>
  <g class="f slide-r" data-step="3" font-size="12">
    <g class="m" fill="#5C5869" text-anchor="middle"><text x="330" y="222">read</text><text x="410" y="222">write</text><text x="490" y="222">run</text></g>
    <line x1="40" y1="230" x2="720" y2="230" stroke="#DCDAE6"/>
    <text class="m" x="60" y="250" fill="#17151F">owner</text>
    <g class="m" text-anchor="middle" font-weight="700" fill="#17151F"><text x="330" y="250">yes</text><text x="410" y="250">yes</text><text x="490" y="250">yes</text></g>
    <line x1="40" y1="258" x2="720" y2="258" stroke="#EEECF3"/>
    <text class="m" x="60" y="274" fill="#17151F">group members</text>
    <g class="m" text-anchor="middle"><text x="330" y="274" font-weight="700" fill="#17151F">yes</text><text x="410" y="274" fill="#8C8899">no</text><text x="490" y="274" font-weight="700" fill="#17151F">yes</text></g>
    <line x1="40" y1="282" x2="720" y2="282" stroke="#EEECF3"/>
    <text class="m" x="60" y="298" fill="#17151F">everyone else</text>
    <g class="m" text-anchor="middle" fill="#8C8899"><text x="330" y="298">no</text><text x="410" y="298">no</text><text x="490" y="298">no</text></g>
    <text class="m" x="560" y="298" fill="#C2382F">Permission denied</text>
  </g>
  <g class="f pop" data-step="4">
    <rect x="349" y="40" width="22" height="30" fill="#FBFBFE"/>
    <text class="m" x="360" y="62" font-size="22" font-weight="700" fill="#531A8A" text-anchor="middle">r</text>
    <rect x="358" y="140" width="54" height="16" fill="#FBFBFE"/>
    <text class="m" x="385" y="152" font-size="12" fill="#531A8A" text-anchor="middle">4+0+0</text>
    <rect x="373" y="162" width="24" height="28" fill="#FBFBFE"/>
    <text class="m" x="385" y="184" font-size="24" font-weight="700" fill="#531A8A" text-anchor="middle">4</text>
    <rect x="476" y="162" width="150" height="28" fill="#FBFBFE"/>
    <text class="m" x="480" y="184" font-size="24" font-weight="700" fill="#531A8A">octal 754</text>
    <rect x="312" y="285" width="36" height="17" fill="#FBFBFE"/>
    <text class="m" x="330" y="298" font-size="12" font-weight="700" fill="#531A8A" text-anchor="middle">yes</text>
    <rect x="556" y="285" width="160" height="17" fill="#FBFBFE"/>
    <text class="m" x="560" y="298" font-size="12" fill="#531A8A">read only</text>
    <text class="m" x="40" y="336" font-size="12.5" font-weight="700" fill="#531A8A">$ chmod 754 etl.sh</text>
    <text class="m" x="300" y="336" font-size="12" fill="#5C5869"># same as: chmod o+r etl.sh</text>
  </g>
  <g class="f pop" data-step="5">
    <rect x="466" y="42" width="80" height="28" fill="#FBFBFE"/>
    <text class="m" x="470" y="62" font-size="18" font-weight="700" fill="#531A8A">sam</text>
    <rect x="551" y="42" width="60" height="28" fill="#FBFBFE"/>
    <text class="m" x="555" y="62" font-size="18" font-weight="700" fill="#531A8A">etl</text>
    <rect x="138" y="107" width="54" height="15" fill="#FBFBFE"/>
    <text class="m" x="165" y="118" font-size="12" fill="#531A8A" text-anchor="middle">sam</text>
    <rect x="252" y="107" width="46" height="15" fill="#FBFBFE"/>
    <text class="m" x="275" y="118" font-size="12" fill="#531A8A" text-anchor="middle">etl</text>
    <text class="m" x="40" y="362" font-size="12.5" font-weight="700" fill="#531A8A">$ sudo chown sam:etl etl.sh</text>
    <text class="m" x="300" y="362" font-size="12" fill="#5C5869"># new owner and group, same bits</text>
  </g>
</svg>
<ol class="lx-caps">
  <li><code>ls -l</code> shows a 10-character mode, then the file's owner (<b>alice</b>), its group (<b>data</b>) and its name.</li>
  <li>Character 1 is the type (<code>-</code> file, <code>d</code> directory, <code>l</code> symlink). Then three <b>rwx</b> triplets: owner, group, others.</li>
  <li>Each triplet is a sum: <b>r=4, w=2, x=1</b>. <code>rwx</code> = 7, <code>r-x</code> = 5, <code>---</code> = 0, so the mode is <b>750</b>.</li>
  <li>The owner can read, edit and run the script; members of the group can read and run it; everyone else gets <b>Permission denied</b>.</li>
  <li><code>chmod</code> changes the bits. <code>754</code> adds read for others: they can now see the script but still not run it.</li>
  <li><code>chown</code> changes who the triplets apply to. The bits stay the same, but now <b>sam</b> is the owner and group <b>etl</b> gets r-x. Only root may give a file away.</li>
</ol>
{{< /fig >}}

| Command | Effect |
|---|---|
| `chmod +x deploy.sh` | Make a script runnable: `./deploy.sh` |
| `chmod 600 secrets.env` | `rw-------`: only the owner can read it. SSH refuses private keys that are more open |
| `chmod 755 dir` | Typical for directories: everyone can enter and list, only the owner can write |
| `chmod u+x,g-w,o-r file` | Symbolic form: add or remove bits per class |
| `sudo chown sam:etl report.csv` | New owner and group |
| `id`, `groups` | Which user and groups you are |

On a **directory**, `r` lets you list names, `w` lets you create and delete files inside it, and `x` lets you enter it (`cd`) and reach files by path.

## Symbolic and hard links

A **symbolic link** is a tiny file that holds a path to another file or folder. A filename itself is only a pointer to an **inode**, the record that holds the data location and metadata; a **hard link** is a second name for the same inode.

```bash
ln -s releases/v2.3 current        # current -> releases/v2.3
ls -l current                      # lrwxrwxrwx ... current -> releases/v2.3
ln -sfn releases/v2.4 current      # repoint it: an instant "deploy"
readlink current                   # releases/v2.4
ln data.csv data-backup.csv        # hard link: two names, one inode (ls -i shows the number)
```

| | Symbolic link | Hard link |
|---|---|---|
| Points to | A path | The inode itself |
| Target deleted | Link breaks ("dangling") | Data survives until the last name is removed |
| Directories, other filesystems | Yes | No |
| Typical use | `current -> releases/v2.4`, config switching | Rare; backups and deduplication tools |

## Processes and signals

```bash
ps aux                      # snapshot of every process: user, PID, CPU, memory, command
ps aux | grep airflow       # or: pgrep -a airflow
top                         # live view (htop is nicer); q quits
kill 1234                   # send SIGTERM: please stop
kill -9 1234                # send SIGKILL: stop now, last resort
sudo ss -tlnp | grep 8080   # which process is listening on port 8080?
```

A **signal** is a small message the kernel delivers to a process.

| Signal | Number | Sent by | Can the process handle it? |
|---|---|---|---|
| `SIGINT` | 2 | `Ctrl-C` | Yes |
| `SIGTERM` | 15 | `kill`, systemd, Kubernetes on shutdown | Yes: flush, checkpoint, close connections, exit |
| `SIGKILL` | 9 | `kill -9`, the OOM killer | No: the process vanishes mid-write |
| `SIGHUP` | 1 | Terminal closed; many daemons reload config on it | Yes |

Orchestrators send **SIGTERM**, wait a grace period, then **SIGKILL**, so long-running jobs should catch SIGTERM and stop cleanly. A process killed by a signal exits with **128 + signal number**: 137 means SIGKILL, 143 means SIGTERM.

## Environment variables

Every process has an **environment**: a list of `NAME=value` strings it inherits from its parent. A plain shell variable stays in the current shell; `export` puts it into the environment so every child process gets a copy.

```bash
NAME=alice
bash -c 'echo $NAME'      # empty line: the child cannot see it
export NAME
bash -c 'echo $NAME'      # alice
export PORT=8080          # set and export in one go
PORT=9090 python app.py   # set only for this one command
echo $PATH                # /usr/local/bin:/usr/bin:/bin
```

- **Inheritance flows one way.** A child gets a copy; changes it makes never reach the parent. That is why a script cannot change your shell's directory or variables unless you `source` it.
- **`PATH`** is the list of folders searched for commands, left to right. "command not found" means the program is not in any of them; `which` shows which one wins.
- **`~/.bashrc`** (or `~/.zshrc`) runs in every new interactive shell: keep exports and aliases there and reload with `source ~/.bashrc`.
- **Configuration and secrets** such as `DATABASE_URL` are passed to apps as environment variables instead of being hard-coded. Locally they often live in a `.env` file, loaded by your tool or with `set -a; source .env; set +a`. Keep `.env` out of Git.

## Shell scripts

A script is commands saved in a file. This one backs up a folder:

```bash
#!/usr/bin/env bash
set -euo pipefail                 # stop on errors, unset variables and failed pipes

SRC="${1:-$HOME/workshop}"        # first argument, with a default
DEST="$HOME/backups"
STAMP=$(date +%F_%H%M)            # command substitution: 2026-10-17_1830

mkdir -p "$DEST"
tar -czf "$DEST/$STAMP.tar.gz" "$SRC"
echo "Backup saved: $STAMP"
```

```bash
chmod +x backup.sh
./backup.sh ~/workshop/notes
echo $?                           # exit code of the last command: 0 = success
```

| Piece | Why |
|---|---|
| `#!/usr/bin/env bash` | The **shebang**: which interpreter runs the file, found through `PATH` |
| `set -e` | Exit at the first failing command instead of carrying on with half the data |
| `set -u` | Using an unset variable is an error, not an empty string (no accidental `rm -rf "$DIR/"`) |
| `set -o pipefail` | A pipeline fails if **any** stage fails, not only the last |
| `$1`, `$2`, `$@`, `$#` | Arguments, all arguments, how many |
| `"$VAR"` | Always quote variables so spaces in file names do not split them |
| `exit 1` | Report failure to whatever called the script: cron, Airflow, CI |

Run `shellcheck` on every script; it catches most quoting and logic bugs. Once a script grows past a page or needs real data structures, rewrite it in Python.

## Where data jobs meet the kernel

- **The OOM killer.** When memory runs out, or a container hits its cgroup limit, the kernel kills a process. Your Spark executor or pod just vanishes with exit code **137** (128 + SIGKILL). Check `dmesg` or `kubectl describe pod`, then raise the limit or reduce memory use.
- **File descriptor limits.** Kafka, Elasticsearch and databases keep many files and sockets open. The default `ulimit -n` of 1024 is far too low; services set `LimitNOFILE` in their systemd unit.
- **The page cache.** Linux uses free RAM to cache disk reads. "Free" memory near zero is normal; look at `available` in `free -h`.
- **Cron and systemd timers.** The original schedulers. Still fine for a single box; use a real orchestrator once jobs depend on each other.

## Practice

Try these in a terminal (a Linux VM, WSL, or a Docker container: `docker run -it ubuntu bash`):

1. Create `~/workshop/logs` and `~/workshop/notes` with one command. *Hint: `mkdir -p` and `{a,b}`.*
2. Which distribution and version are you running? *Hint: `/etc/os-release`.*
3. How many user accounts exist on the machine? *Hint: `/etc/passwd`, `wc -l`.*
4. List every `.conf` file directly inside `/etc`. *Hint: `find -maxdepth 1 -name`.*
5. Save the listing of `/etc` into `~/workshop/notes/etc.txt`. *Hint: `>`.*
6. From that file, show only the names containing "net". *Hint: `grep`.*
7. Find your five most-used commands. *Hint: `history | awk '{print $2}' | sort | uniq -c | sort -rn | head -5`.*
8. Bonus: the five biggest items in `/var/log`. *Hint: `du -ah`, `sort -rh`.*

## Common mistakes

- **Running everything as root**, including containers. One bug becomes a full compromise.
- **Filling the disk with logs.** Configure log rotation (`logrotate`, journald limits) before it happens at 3 a.m.
- **`chmod 777` to fix a permission error.** Find the right owner and group instead.
- **`>` when you meant `>>`.** One character truncates the file you were trying to append to.
- **`kill -9` first.** SIGKILL skips cleanup, leaving lock files, half-written output and uncommitted offsets. Send SIGTERM and wait.
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
- [GNU Bash manual](https://www.gnu.org/software/bash/manual/)
- [ShellCheck](https://www.shellcheck.net/): finds bugs in shell scripts
- [Linux Performance](https://www.brendangregg.com/linuxperf.html): Brendan Gregg's tools and checklists

See also: [SSH]({{< relref "/docs/roadmap/networking/protocols/ssh" >}}), [Networking]({{< relref "/docs/roadmap/networking" >}}), [Git]({{< relref "/docs/roadmap/version-control-system/git" >}}).
