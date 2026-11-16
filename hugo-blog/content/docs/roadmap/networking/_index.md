---
title: "Networking"
bookCollapseSection: true
weight: 3
description: "Networking for data engineers: the layer model, IP and MAC addresses, ports, DHCP, DNS, TCP, UDP, HTTP, TLS and SSH, plus firewalls and VPNs."
---
<div class="lx-kicker-line">$ ip -br addr && curl -v https://api.shop.com/orders</div>

# Networking

Every pipeline is a network program. A Spark job reads from S3 over HTTPS, an Airflow worker opens a TCP connection to PostgreSQL, Kafka clients resolve broker names through DNS, and you reach the production box over SSH through a VPN. When a job "hangs", the cause is very often a DNS lookup, a firewall rule, a subnet route or a TLS certificate, not your code. This section teaches the handful of layers, addresses and protocols you meet every day, each with a step-by-step animation of what actually goes over the wire.

## One request, down and up the stack

Networking software is built in **layers**. Each layer solves one problem and hands the result to the layer below, wrapping the data in its own header, like putting a letter in an envelope and that envelope in a bigger one.

{{< fig kicker="$ curl https://api.shop.com/orders" title="One request down and up the stack" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 352">
<g class="m">
<text x="76" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">OSI</text>
<text x="76" y="46" text-anchor="middle" font-size="11" fill="#5C5869">7 layers, on paper</text>
<text x="196" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">SENDER</text>
<text x="196" y="46" text-anchor="middle" font-size="11" fill="#5C5869">TCP/IP · 4</text>
<text x="472" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">WHAT EACH LAYER ADDS</text>
<text x="692" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">RECEIVER</text>
<text x="692" y="46" text-anchor="middle" font-size="11" fill="#5C5869">TCP/IP · 4</text>
<rect x="16" y="58" width="120" height="30" rx="4" fill="#fff" stroke="#DCDAE6"/><text x="26" y="77" font-size="11" fill="#3D3A49">7 Application</text>
<rect x="16" y="92" width="120" height="30" rx="4" fill="#fff" stroke="#DCDAE6"/><text x="26" y="111" font-size="11" fill="#3D3A49">6 Presentation</text>
<rect x="16" y="126" width="120" height="30" rx="4" fill="#fff" stroke="#DCDAE6"/><text x="26" y="145" font-size="11" fill="#3D3A49">5 Session</text>
<rect x="16" y="160" width="120" height="30" rx="4" fill="#fff" stroke="#DCDAE6"/><text x="26" y="179" font-size="11" fill="#3D3A49">4 Transport</text>
<rect x="16" y="194" width="120" height="30" rx="4" fill="#fff" stroke="#DCDAE6"/><text x="26" y="213" font-size="11" fill="#3D3A49">3 Network</text>
<rect x="16" y="228" width="120" height="30" rx="4" fill="#fff" stroke="#DCDAE6"/><text x="26" y="247" font-size="11" fill="#3D3A49">2 Data link</text>
<rect x="16" y="262" width="120" height="30" rx="4" fill="#fff" stroke="#DCDAE6"/><text x="26" y="281" font-size="11" fill="#3D3A49">1 Physical</text>
<rect x="146" y="58" width="100" height="98" rx="5" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="196" y="111" text-anchor="middle" font-size="11" font-weight="600" fill="#531A8A">Application</text>
<rect x="146" y="160" width="100" height="30" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="196" y="179" text-anchor="middle" font-size="11" font-weight="600" fill="#17151F">Transport</text>
<rect x="146" y="194" width="100" height="30" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="196" y="213" text-anchor="middle" font-size="11" font-weight="600" fill="#17151F">Internet</text>
<rect x="146" y="228" width="100" height="64" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="196" y="264" text-anchor="middle" font-size="11" font-weight="600" fill="#17151F">Link</text>
<rect x="636" y="58" width="112" height="98" rx="5" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="644" y="98" font-size="11" font-weight="600" fill="#531A8A">Application</text>
<rect x="636" y="160" width="112" height="30" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="644" y="179" font-size="11" font-weight="600" fill="#17151F">Transport</text>
<rect x="636" y="194" width="112" height="30" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="644" y="213" font-size="11" font-weight="600" fill="#17151F">Internet</text>
<rect x="636" y="228" width="112" height="64" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="644" y="264" font-size="11" font-weight="600" fill="#17151F">Link</text>
</g>
<g class="f slide-r m" data-step="1">
<text x="466" y="111" text-anchor="end" font-size="11" fill="#5C5869">data</text>
<rect x="474" y="96" width="116" height="22" fill="#F4EEFA" stroke="#531A8A"/><text x="532" y="111" text-anchor="middle" font-size="11" fill="#17151F">GET /orders</text>
</g>
<g class="f slide-r m" data-step="2">
<text x="414" y="179" text-anchor="end" font-size="11" fill="#5C5869">segment</text>
<rect x="422" y="164" width="52" height="22" fill="#fff" stroke="#3D3A49"/><text x="448" y="179" text-anchor="middle" font-size="11" font-weight="600" fill="#17151F">TCP</text>
<rect x="474" y="164" width="116" height="22" fill="#F4EEFA" stroke="#531A8A"/><text x="532" y="179" text-anchor="middle" font-size="11" fill="#17151F">GET /orders</text>
</g>
<g class="f slide-r m" data-step="3">
<text x="362" y="213" text-anchor="end" font-size="11" fill="#5C5869">packet</text>
<rect x="370" y="198" width="52" height="22" fill="#fff" stroke="#3D3A49"/><text x="396" y="213" text-anchor="middle" font-size="11" font-weight="600" fill="#17151F">IP</text>
<rect x="422" y="198" width="52" height="22" fill="#fff" stroke="#3D3A49"/><text x="448" y="213" text-anchor="middle" font-size="11" fill="#5C5869">TCP</text>
<rect x="474" y="198" width="116" height="22" fill="#F4EEFA" stroke="#531A8A"/><text x="532" y="213" text-anchor="middle" font-size="11" fill="#17151F">GET /orders</text>
</g>
<g class="f slide-r m" data-step="4">
<text x="310" y="264" text-anchor="end" font-size="11" fill="#5C5869">frame</text>
<rect x="318" y="249" width="52" height="22" fill="#fff" stroke="#3D3A49"/><text x="344" y="264" text-anchor="middle" font-size="11" font-weight="600" fill="#17151F">ETH</text>
<rect x="370" y="249" width="52" height="22" fill="#fff" stroke="#3D3A49"/><text x="396" y="264" text-anchor="middle" font-size="11" fill="#5C5869">IP</text>
<rect x="422" y="249" width="52" height="22" fill="#fff" stroke="#3D3A49"/><text x="448" y="264" text-anchor="middle" font-size="11" fill="#5C5869">TCP</text>
<rect x="474" y="249" width="116" height="22" fill="#F4EEFA" stroke="#531A8A"/><text x="532" y="264" text-anchor="middle" font-size="11" fill="#17151F">GET /orders</text>
<rect x="590" y="249" width="36" height="22" fill="#fff" stroke="#3D3A49"/><text x="608" y="264" text-anchor="middle" font-size="11" font-weight="600" fill="#17151F">FCS</text>
</g>
<g class="f m" data-step="5">
<path class="flow" d="M196 292 V318 H692 V292" fill="none" stroke="#531A8A" stroke-width="1.6"/>
<text x="444" y="340" text-anchor="middle" font-size="11" fill="#5C5869">bits on the wire: copper, fiber or radio</text>
<circle class="pkt-dot" r="5"><animateMotion dur="2.6s" repeatCount="indefinite" path="M196 292 V318 H692 V292"/></circle>
</g>
<g class="f pop m" data-step="6">
<text x="740" y="264" text-anchor="end" font-size="11" font-weight="600" fill="#531A8A">−ETH</text>
<text x="740" y="213" text-anchor="end" font-size="11" font-weight="600" fill="#531A8A">−IP</text>
<text x="740" y="179" text-anchor="end" font-size="11" font-weight="600" fill="#531A8A">−TCP</text>
<rect x="646" y="108" width="92" height="22" rx="4" fill="#fff" stroke="#531A8A"/><text x="692" y="123" text-anchor="middle" font-size="11" fill="#17151F">GET /orders</text>
</g>
</svg>
<table class="lx-log">
<tr><th>STEP</th><th>LAYER</th><th>ADDS</th><th>ADDRESSES IN IT</th><th>UNIT</th></tr>
<tr class="f" data-step="1"><td>01</td><td>Application</td><td>HTTP request</td><td>Host: api.shop.com</td><td class="tag">DATA</td></tr>
<tr class="f" data-step="2"><td>02</td><td>Transport</td><td>TCP header</td><td>port 52114 → 443</td><td class="tag">SEGMENT</td></tr>
<tr class="f" data-step="3"><td>03</td><td>Internet</td><td>IP header</td><td>192.168.1.42 → 203.0.113.10</td><td class="tag">PACKET</td></tr>
<tr class="f" data-step="4"><td>04</td><td>Link</td><td>Ethernet header + checksum</td><td>3c:22:fb:7a:10:9e → gateway's MAC</td><td class="tag">FRAME</td></tr>
<tr class="f" data-step="6"><td>06</td><td>all, in reverse</td><td>headers removed</td><td>each layer checks the address meant for it</td><td class="tag">DATA</td></tr>
</table>
<ol class="lx-caps">
  <li>Two models of the same stack. <b>OSI</b> has 7 layers and is the vocabulary; <b>TCP/IP</b>, what real systems implement, merges them into 4.</li>
  <li>Your program builds an HTTP request, <b>GET /orders</b>. To every layer below, it is just bytes of <b>data</b>.</li>
  <li>The transport layer prepends a <b>TCP header</b> with source and destination <b>ports</b>. Now it is a <b>segment</b>.</li>
  <li>The internet layer prepends an <b>IP header</b> with source and destination <b>IP addresses</b>. Now it is a <b>packet</b>.</li>
  <li>The link layer adds an <b>Ethernet header</b> with the <b>MAC addresses</b> of this one hop, plus a checksum trailer. Now it is a <b>frame</b>.</li>
  <li>The frame leaves as bits. Each router along the way builds a new frame for the next hop; the IP packet inside travels end to end.</li>
  <li>The receiver unwraps in reverse: link, then IP, then TCP each check and strip their header, and the web server reads <b>GET /orders</b>.</li>
</ol>
{{< /fig >}}

| TCP/IP layer | OSI layers | What lives here | Address it uses |
|---|---|---|---|
| Application | 7, 6, 5 | HTTP, DNS, SSH, TLS, PostgreSQL wire protocol | URL, hostname |
| Transport | 4 | TCP, UDP, QUIC | port |
| Internet | 3 | IP, ICMP (`ping`) | IP address |
| Link | 2, 1 | Ethernet, Wi-Fi, ARP | MAC address |

You will still hear OSI numbers every day: an **L4 load balancer** routes by IP and port without reading the request, an **L7 load balancer** or WAF reads the HTTP path and headers, and "L2 network" means machines that reach each other directly by MAC address.

## Three kinds of address

| Address | Example | Scope | Analogy |
|---|---|---|---|
| **MAC** | `3c:22:fb:7a:10:9e` | Burned into the network card. Only meaningful inside one local network (one hop). | A face, known in this room |
| **IP** | `192.168.1.42`, `2001:db8::42` | Where the machine sits on the network. Changes when it joins another network. | A street address |
| **Port** | `22`, `53`, `443`, `5432` | Which program on that machine. A number from 0 to 65535. | An apartment number |

A connection is identified by five values: protocol, source IP, source port, destination IP and destination port. **ARP** links the layers: to send a frame to `192.168.1.1`, your machine broadcasts "who has 192.168.1.1?" and caches the MAC that answers. IPv4 addresses are 32 bits and nearly used up; IPv6 uses 128 bits and carries a large and growing share of internet traffic. See [IP addressing]({{< relref "concepts/ip-addressing" >}}) for subnets and CIDR.

## Pages in this section

### Concepts

| Page | What you learn |
|---|---|
| [IP addressing]({{< relref "concepts/ip-addressing" >}}) | IPv4 and IPv6, private ranges, ports, subnets and CIDR, the default gateway and NAT. |
| [DHCP]({{< relref "concepts/dhcp" >}}) | How a machine gets its IP, gateway and DNS servers: Discover, Offer, Request, Acknowledge, and leases. |
| [Firewalls]({{< relref "concepts/firewalls" >}}) | Stateless vs stateful filtering, security groups, default deny and egress rules. |
| [VPN]({{< relref "concepts/vpn" >}}) | Tunnels and encapsulation, WireGuard and IPsec, site-to-site vs remote access, and zero-trust alternatives. |

### Protocols

| Page | What you learn |
|---|---|
| [TCP/IP]({{< relref "protocols/tcp" >}}) | How TCP's handshake, acknowledgments and teardown make a reliable byte stream. |
| [UDP]({{< relref "protocols/udp" >}}) | Datagrams without a connection, why DNS, video and QUIC use it, and a side-by-side comparison with TCP. |
| [DNS]({{< relref "protocols/dns" >}}) | How a name becomes an IP: resolvers, root, TLD and authoritative servers, record types and TTL caching. |
| [HTTP]({{< relref "protocols/http" >}}) | Requests, responses, methods, status codes, caching, and head-of-line blocking from HTTP/1.1 to HTTP/3. |
| [HTTPS]({{< relref "protocols/https" >}}) | TLS 1.3: the one-round-trip handshake, certificates and chains of trust. |
| [SSH]({{< relref "protocols/ssh" >}}) | Encrypted remote shells, public-key login, `known_hosts`, and tunnels to private databases. |

A good order: IP addressing, TCP/IP, UDP, DNS, HTTP, HTTPS, then the rest as you need them.

## Common mistakes

- **Debugging the wrong layer.** Work bottom up: is there an IP and a route (`ip addr`, `ip route`)? Does the name resolve (`dig`)? Is the port reachable (`nc -zv`)? Only then look at TLS and HTTP.
- **Mixing up "can't resolve", "connection refused" and "timeout".** Refused means the host answered and nothing listens on that port; a timeout usually means a firewall silently dropped the packet.
- **Thinking `localhost` is the same everywhere.** Inside a container, `localhost` is the container itself, not your laptop or the database next to it.

## Try it

A five-minute lab on any Linux machine (on macOS use `ifconfig` and `netstat -rn` instead of `ip`):

```bash
ip -br addr                     # your interfaces, IPs and prefix lengths
ip route | grep default         # your default gateway
ping -c 3 1.1.1.1               # reach an IP directly
ping -c 3 example.com           # same, but a DNS lookup happens first
traceroute 1.1.1.1              # every router (hop) on the way
python3 -m http.server 8000     # start a web server, then in a second terminal:
curl -v http://localhost:8000/  # watch the request and response
ss -tlnp | grep 8000            # which process listens on port 8000
```

## Learning Resources

- *Computer Networking: A Top-Down Approach* (8th ed.), Kurose and Ross: the standard textbook
- [High Performance Browser Networking](https://hpbn.co/): Ilya Grigorik, free online
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/): sockets from first principles
- [OSI model](https://en.wikipedia.org/wiki/OSI_model) and [Internet protocol suite](https://en.wikipedia.org/wiki/Internet_protocol_suite): Wikipedia overviews of both layer models
