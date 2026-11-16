---
title: "IP addressing"
weight: 1
description: "IP addressing for data engineers, animated: reading 192.168.1.42/24, network and host bits, private ranges, ports, the default gateway, NAT and VPC CIDRs."
bookToC: false
---
<div class="lx-kicker-line">$ ip -br addr   # wlan0 UP 192.168.1.42/24</div>

# IP addressing

An **IP address** says where a machine sits on a network, the way a street address says where a house is. An IPv4 address is 32 bits, written as four numbers from 0 to 255 (`192.168.1.42`). The **prefix length** after the slash (`/24`) says how many of those bits name the **network**; the rest name the **host** inside it. That one number decides which machines you can reach directly and which traffic must go through a router.

## Reading 192.168.1.42/24

{{< fig kicker="$ ip route get 203.0.113.10" title="Network bits, host bits, and where a packet goes" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 362">
<defs>
<marker id="ipa-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
</defs>
<g class="m">
<text x="380" y="38" text-anchor="middle" font-size="24" font-weight="700" fill="#17151F">192.168.1.42<tspan fill="#531A8A">/24</tspan></text>
</g>
<g class="f pop m" data-step="1">
<rect x="30" y="58" width="170" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="115" y="82" text-anchor="middle" font-size="16" font-weight="700" fill="#17151F">192</text><text x="115" y="105" text-anchor="middle" font-size="13" fill="#5C5869">11000000</text>
<rect x="210" y="58" width="170" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="295" y="82" text-anchor="middle" font-size="16" font-weight="700" fill="#17151F">168</text><text x="295" y="105" text-anchor="middle" font-size="13" fill="#5C5869">10101000</text>
<rect x="390" y="58" width="170" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="475" y="82" text-anchor="middle" font-size="16" font-weight="700" fill="#17151F">1</text><text x="475" y="105" text-anchor="middle" font-size="13" fill="#5C5869">00000001</text>
<rect x="570" y="58" width="170" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="655" y="82" text-anchor="middle" font-size="16" font-weight="700" fill="#17151F">42</text><text x="655" y="105" text-anchor="middle" font-size="13" fill="#5C5869">00101010</text>
</g>
<g class="f m" data-step="2">
<rect x="24" y="52" width="542" height="72" rx="9" fill="none" stroke="#531A8A" stroke-width="2"/>
<rect x="564" y="52" width="182" height="72" rx="9" fill="none" stroke="#5C5869" stroke-width="1.4" stroke-dasharray="4 4"/>
<text x="295" y="144" text-anchor="middle" font-size="11.5" font-weight="600" fill="#531A8A">network part · first 24 bits · same for the whole LAN</text>
<text x="655" y="144" text-anchor="middle" font-size="11.5" fill="#5C5869">host part · last 8 bits</text>
</g>
<g class="f slide-r m" data-step="3">
<rect x="30" y="164" width="226" height="28" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="143" y="182" text-anchor="middle" font-size="11.5" fill="#17151F">network 192.168.1.0/24</text>
<rect x="267" y="164" width="226" height="28" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="380" y="182" text-anchor="middle" font-size="11.5" fill="#17151F">mask 255.255.255.0</text>
<rect x="504" y="164" width="236" height="28" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="622" y="182" text-anchor="middle" font-size="11.5" fill="#17151F">256 addrs · hosts .1 – .254</text>
</g>
<g class="f m" data-step="4">
<rect x="20" y="260" width="140" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
<text x="90" y="278" text-anchor="middle" font-size="11.5" font-weight="600" fill="#531A8A">LAPTOP</text><text x="90" y="295" text-anchor="middle" font-size="11" fill="#5C5869">192.168.1.42</text>
<rect x="250" y="260" width="140" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="320" y="278" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">NAS</text><text x="320" y="295" text-anchor="middle" font-size="11" fill="#5C5869">192.168.1.77</text>
<rect x="450" y="260" width="140" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="520" y="278" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">GATEWAY</text><text x="520" y="295" text-anchor="middle" font-size="11" fill="#5C5869">192.168.1.1</text>
<path class="flow" d="M90 258 C90 226 320 226 320 256" fill="none" stroke="#531A8A" stroke-width="1.6" marker-end="url(#ipa-a)"/>
<text x="205" y="218" text-anchor="middle" font-size="11.5" fill="#17151F">to .77: same network → direct</text>
<circle class="pkt-dot" r="4.5"><animateMotion dur="1.8s" repeatCount="indefinite" path="M90 258 C90 226 320 226 320 256"/></circle>
</g>
<g class="f m" data-step="5">
<rect x="640" y="260" width="104" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="692" y="278" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">INTERNET</text><text x="692" y="295" text-anchor="middle" font-size="11" fill="#5C5869">203.0.113.10</text>
<path class="flow" d="M90 306 C90 334 520 334 520 306 M590 282 H636" fill="none" stroke="#531A8A" stroke-width="1.6"/>
<text x="305" y="352" text-anchor="middle" font-size="11.5" fill="#17151F">to 203.0.113.10: other network → default gateway</text>
<circle class="pkt-dot" r="4.5"><animateMotion dur="2.4s" repeatCount="indefinite" path="M90 306 C90 334 520 334 520 306 L520 282 L636 282"/></circle>
</g>
</svg>
<ol class="lx-caps">
  <li>An IPv4 address with a prefix length, as <code>ip addr</code> prints it.</li>
  <li>Underneath, it is 32 bits: four 8-bit numbers (octets). 42 is <b>00101010</b> in binary.</li>
  <li><b>/24</b> means the first 24 bits are the <b>network</b>. Every machine on this LAN shares them. The last 8 bits pick the <b>host</b>.</li>
  <li>So the network is <b>192.168.1.0/24</b>, mask 255.255.255.0: 256 addresses. .0 names the network and .255 is broadcast, leaving .1 to .254 for hosts.</li>
  <li>Sending to <b>192.168.1.77</b>? Same network bits, so the laptop finds its MAC with ARP and sends the frame <b>directly</b>.</li>
  <li>Sending to <b>203.0.113.10</b>? Different network, so the packet goes to the <b>default gateway</b>, the router that knows the way out.</li>
</ol>
{{< /fig >}}

The rule your OS applies to every packet: compare the destination's network bits with your own. Same network, deliver directly; different network, hand it to the gateway. `ip route` shows that table, and `ip route get <ip>` tells you which way one destination will go.

## CIDR sizes

**CIDR** (Classless Inter-Domain Routing) is the `address/prefix` notation. Each bit you add to the prefix halves the block.

| CIDR | Mask | Addresses | Typical use |
|---|---|---|---|
| `/32` | 255.255.255.255 | 1 | One host, e.g. in an allow-list or firewall rule |
| `/28` | 255.255.255.240 | 16 | A tiny subnet (AWS's minimum subnet size) |
| `/24` | 255.255.255.0 | 256 | Home or office LAN, one cloud subnet |
| `/16` | 255.255.0.0 | 65,536 | A whole cloud VPC |
| `/8` | 255.0.0.0 | 16.7 million | The `10.0.0.0/8` private range |
| `/0` | 0.0.0.0 | everything | "Any address", as in `0.0.0.0/0` |

Cloud providers reserve a few addresses in every subnet (AWS keeps 5), so a `/24` gives you 251 usable IPs, not 256.

## Private ranges, NAT and IPv6

RFC 1918 sets aside three ranges that are never routed on the public internet. Anyone can use them inside their own network:

| Range | Size | Where you see it |
|---|---|---|
| `10.0.0.0/8` | 16.7 M | Corporate networks, cloud VPCs |
| `172.16.0.0/12` | 1 M | Docker's default bridge networks (`172.17.0.0/16`) |
| `192.168.0.0/16` | 65 k | Home routers |

Other special addresses: `127.0.0.1` is **loopback** (this machine), `0.0.0.0` in a listen address means "all interfaces", and `169.254.0.0/16` is link-local (a machine that got no DHCP answer, and the cloud metadata service at `169.254.169.254`).

Because private addresses can't cross the internet, the router does **NAT** (network address translation): it rewrites the source address of outgoing packets to its own public IP and remembers the mapping so replies find their way back. In the cloud, a **NAT gateway** does the same for private subnets. Side effect: everything behind one NAT appears to the outside world as a single IP, which is the address a SaaS vendor has to allow-list.

**IPv6** addresses are 128 bits, written in hex (`2001:db8::42`), with so many addresses that NAT is unnecessary. The same prefix idea applies: a typical subnet is a `/64`.

## Ports

An IP address gets a packet to a machine; a **port** (0 to 65535) gets it to one program on it. Servers listen on well-known ports; clients use a random high **ephemeral** port for their side.

| Port | Service | Port | Service |
|---|---|---|---|
| 22 | SSH | 5432 | PostgreSQL |
| 53 | DNS | 3306 | MySQL |
| 80 / 443 | HTTP / HTTPS | 6379 | Redis |
| 9092 | Kafka | 8080 | Airflow web UI, many dev servers |

A server listening on `127.0.0.1:5432` accepts connections only from the same machine; on `0.0.0.0:5432` it accepts them on every interface. That one setting is behind many "works locally, refused from the container" bugs.

## Why it matters for data engineers

- **VPC and subnet design.** You pick the VPC CIDR once (say `10.20.0.0/16`) and carve subnets from it. Too small and a busy Spark or EKS cluster runs out of IPs; overlapping with another VPC or the office network and you can never peer or VPN them together.
- **Kubernetes pod and service CIDRs.** Pods get IPs from their own range. If it overlaps your VPC or the database's network, traffic to the database is routed back into the cluster and silently fails. See [Kubernetes]({{< relref "/docs/roadmap/container-orchestration/kubernetes" >}}).
- **Security groups and firewalls** are rules over CIDRs and ports: allow `10.20.0.0/16` on 5432, not `0.0.0.0/0`. See [Firewalls]({{< relref "firewalls" >}}).
- **Allow-listing.** Snowflake network policies, managed databases and SaaS APIs accept connections only from listed IPs or ranges. Give them the stable public IP of your NAT gateway, not a worker's address that changes on every restart.

## Common mistakes

- **Opening `0.0.0.0/0` "just to test".** It is the whole internet, and it tends to stay that way.
- **Overlapping CIDRs.** Plan ranges across VPCs, on-prem networks, Docker and Kubernetes before you build, because renumbering later means rebuilding.
- **Hard-coding IPs in pipelines.** Managed databases fail over and pods restart with new addresses. Use DNS names.
- **Confusing the subnet with the address.** `192.168.1.42/24` is a host; `192.168.1.0/24` is the network it belongs to.

## Try it

```bash
ip -br addr                        # your IPs and prefix lengths
ip route                           # the routing table and default gateway
ip route get 1.1.1.1               # which interface and gateway this IP uses
ip neigh                           # ARP cache: IP → MAC of machines on your LAN
curl -s https://ifconfig.me; echo  # your public IP, as the internet sees it (after NAT)
python3 -c "import ipaddress as i; n = i.ip_interface('192.168.1.42/24').network; print(n, n.netmask, n.num_addresses)"
```

## Learning Resources

- [RFC 1918: Address Allocation for Private Internets](https://www.rfc-editor.org/rfc/rfc1918) and [RFC 4632: CIDR](https://www.rfc-editor.org/rfc/rfc4632)
- [cidr.xyz](https://cidr.xyz/): an interactive CIDR calculator that shows the bits
- [AWS: IP addressing for your VPCs and subnets](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-ip-addressing.html)
- [Python `ipaddress` module](https://docs.python.org/3/library/ipaddress.html): parse and check addresses and networks in code

See also: [DHCP]({{< relref "dhcp" >}}), [TCP/IP]({{< relref "/docs/roadmap/networking/protocols/tcp" >}}), [VPN]({{< relref "vpn" >}}).
