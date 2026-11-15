---
weight: 1
description: "Data engineering from a Windows machine: WSL 2 for a real Linux environment, Docker Desktop, PowerShell, and fixes for line-ending, path and encoding pitfalls."
---
# Windows

**Windows** is the most common desktop operating system in companies, so many data engineers write code on it, even though the pipelines they build run on Linux servers and containers. The goal on Windows is to get a development environment that behaves like production. Since 2019 the answer has been **WSL 2**: a real Linux kernel running in a lightweight VM, tightly integrated with Windows.

Windows Server also still runs in data platforms: SQL Server, SSIS packages, Power BI gateways and Active Directory are common in enterprise environments you will integrate with.

## Setting up for data work

| Tool | What it gives you |
|---|---|
| **WSL 2** (`wsl --install`) | Ubuntu or another distro with a real Linux kernel. Run Python, Spark, dbt and the CLI tools exactly as on a server. |
| **Docker Desktop** or **Podman Desktop** | Linux containers, backed by WSL 2. Run PostgreSQL, Kafka or Airflow locally with Docker Compose. |
| **VS Code + WSL extension** | Edit in Windows, run everything inside Linux. |
| **Windows Terminal** | Tabs for PowerShell, WSL shells and SSH sessions. |
| **PowerShell 7** | Windows' own scripting shell, object-based rather than text-based. Useful for Windows and Azure administration. |
| **winget** | Command-line package manager for Windows apps. |

## Common pitfalls

- **Line endings.** Windows uses `CRLF`, Linux `LF`. A shell script saved with CRLF fails in a container with `/bin/bash^M: bad interpreter`. Set `git config --global core.autocrlf input` (or use a `.gitattributes` file) and configure your editor for LF.
- **Slow file access across systems.** Keep your project inside the WSL filesystem (`~/projects`), not on `/mnt/c/...`. Cross-filesystem I/O is many times slower.
- **Paths.** `C:\data\orders.csv` vs `/home/me/data/orders.csv`. In Python use `pathlib`, never string concatenation with `\`.
- **Encoding.** Older Windows tools write CSVs in a legacy code page (Windows-1252) or UTF-8 with a BOM. Read with an explicit `encoding=` and write UTF-8.
- **Case-insensitive filenames.** `Orders.csv` and `orders.csv` are the same file on Windows but not on Linux, which breaks code once it is deployed.
- **Memory.** WSL 2 can grow to use much of your RAM. Cap it in `%UserProfile%\.wslconfig` if Docker plus Spark make Windows sluggish.

## Learning Resources

- [Windows Subsystem for Linux documentation](https://learn.microsoft.com/en-us/windows/wsl/)
- [Set up a WSL development environment](https://learn.microsoft.com/en-us/windows/wsl/setup/environment)
- [Docker Desktop WSL 2 backend](https://docs.docker.com/desktop/features/wsl/)
- [PowerShell documentation](https://learn.microsoft.com/en-us/powershell/)
- [Windows Terminal](https://learn.microsoft.com/en-us/windows/terminal/)

See also: [Linux]({{< relref "../linux" >}}).
