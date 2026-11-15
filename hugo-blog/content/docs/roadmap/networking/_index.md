---
bookCollapseSection: true
weight: 3
description: "Networking for data engineers: how DNS, TCP, UDP, HTTP, TLS and SSH move your data, plus the firewalls and VPNs that guard pipelines and databases."
---
# Networking

Every pipeline is a network program. A Spark job reads from S3 over HTTPS, an Airflow worker opens a TCP connection to PostgreSQL, Kafka clients resolve broker names through DNS, and you reach the production box over SSH through a VPN. When a job "hangs", the cause is very often a DNS lookup, a firewall rule or a TLS certificate, not your code.

This section teaches the handful of protocols and controls you meet every day, each with a step-by-step animation of what actually goes over the wire.

## Protocols

| Page | What you learn |
|---|---|
| [TCP/IP]({{< relref "protocols/tcp" >}}) | The layer model, IP addressing and ports, and how TCP's handshake, acknowledgments and teardown make a reliable byte stream. |
| [UDP]({{< relref "protocols/udp" >}}) | Datagrams without a connection, why DNS, video and QUIC use it, and a side-by-side comparison with TCP. |
| [DNS]({{< relref "protocols/dns" >}}) | How a name becomes an IP: resolvers, root, TLD and authoritative servers, record types and TTL caching. |
| [HTTP]({{< relref "protocols/http" >}}) | Requests, responses, methods, status codes, headers and caching, plus what changed in HTTP/2 and HTTP/3. |
| [HTTPS]({{< relref "protocols/https" >}}) | TLS 1.3: the one-round-trip handshake, certificates and chains of trust. |
| [SSH]({{< relref "protocols/ssh" >}}) | Encrypted remote shells, public-key login, `known_hosts`, and tunnels to private databases. |

## Concepts

| Page | What you learn |
|---|---|
| [Firewalls]({{< relref "concepts/firewalls" >}}) | Stateless vs stateful filtering, security groups, default deny and egress rules. |
| [VPN]({{< relref "concepts/vpn" >}}) | Tunnels and encapsulation, WireGuard and IPsec, site-to-site vs remote access, and zero-trust alternatives. |

## Learning Resources

- *Computer Networking: A Top-Down Approach* (8th ed.), Kurose and Ross: the standard textbook
- [High Performance Browser Networking](https://hpbn.co/): Ilya Grigorik, free online
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/): sockets from first principles
