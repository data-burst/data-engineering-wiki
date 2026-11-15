---
bookCollapseSection: true
weight: 2
description: "Operating systems for data engineers: why production data platforms run on Linux, the core skills to learn, and how to work effectively from Windows with WSL."
---
# Operating System

An **operating system** sits between programs and hardware. It schedules processes on CPUs, gives each one memory, manages files and disks, and owns the network stack. When a Spark executor is killed for using too much memory, a pipeline fails with "too many open files", or a disk fills up with logs, you are debugging the OS, not your code.

Almost every production data system (databases, Kafka, Spark, Airflow, Kubernetes nodes, cloud VMs) runs on **Linux**. Your laptop may run macOS or Windows, but the skills that pay off are Linux skills.

| Page | What you learn |
|---|---|
| [Linux]({{< relref "linux" >}}) | Processes, files and permissions, the shell, memory and the OOM killer, systemd, and the kernel features behind containers. |
| [Windows]({{< relref "windows" >}}) | Developing for Linux-based data platforms from Windows: WSL 2, Docker Desktop, PowerShell and common cross-platform pitfalls. |

## Learning Resources

- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/): Arpaci-Dusseau, free online, the best introduction to how an OS works
- [The Missing Semester of Your CS Education](https://missing.csail.mit.edu/): MIT, shell, editors and tools
