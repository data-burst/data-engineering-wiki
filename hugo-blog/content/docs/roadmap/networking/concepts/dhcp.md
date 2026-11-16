---
title: "DHCP"
weight: 2
description: "How DHCP gives a machine its IP address, animated: Discover, Offer, Request, Acknowledge, leases and renewal, static reservations and cloud DHCP options."
bookToC: false
---
<div class="lx-kicker-line">$ ip route | grep default   # default via 192.168.1.1 dev wlan0 proto dhcp</div>

# DHCP

**DHCP** (Dynamic Host Configuration Protocol) is how a machine that has just joined a network gets its settings: an **IP address** and subnet mask, the **default gateway**, and the **DNS servers** to use. A DHCP server, usually your router at home or the cloud provider's VPC, hands out addresses from a pool and **leases** each one for a limited time. The exchange takes four messages, remembered as **DORA**: Discover, Offer, Request, Acknowledge.

## DORA, step by step

{{< fig kicker="$ sudo dhclient -v wlan0" title="Getting an address: Discover, Offer, Request, Acknowledge" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 446">
<defs>
<marker id="dhcp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
</defs>
<line x1="170" y1="62" x2="170" y2="438" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="80" y="14" width="180" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="170" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">LAPTOP</text>
<text x="170" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">MAC 3c:22:fb:7a:10:9e</text>
<line x1="590" y1="62" x2="590" y2="438" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="520" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="590" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">DHCP SERVER</text>
<text x="590" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">router 192.168.1.1</text>
<rect x="105" y="70" width="130" height="22" rx="5" fill="#fff" stroke="#DCDAE6"/><text x="170" y="85" text-anchor="middle" class="m" font-size="11" fill="#5C5869">no IP: 0.0.0.0</text>
<rect x="515" y="70" width="150" height="22" rx="5" fill="#fff" stroke="#DCDAE6"/><text x="590" y="85" text-anchor="middle" class="m" font-size="11" fill="#5C5869">pool .10 – .200</text>
<g class="f m" data-step="1">
<line x1="174" y1="130" x2="586" y2="130" stroke="#531A8A" stroke-width="1.6" marker-end="url(#dhcp-a)"/>
<text x="380" y="123" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">DISCOVER  0.0.0.0 → 255.255.255.255</text>
<text x="380" y="146" text-anchor="middle" font-size="11" fill="#5C5869">broadcast: is there a DHCP server here?</text>
<circle class="pkt-dot" r="4.5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M174 130 H586"/></circle>
</g>
<g class="f m" data-step="2">
<line x1="586" y1="190" x2="174" y2="190" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#dhcp-a)"/>
<text x="380" y="183" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">OFFER  192.168.1.42/24</text>
<text x="380" y="206" text-anchor="middle" font-size="11" fill="#5C5869">gateway .1 · DNS .1 · lease 24 h</text>
<circle class="pkt-dot" r="4.5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M586 190 H174"/></circle>
</g>
<g class="f m" data-step="3">
<line x1="174" y1="250" x2="586" y2="250" stroke="#531A8A" stroke-width="1.6" marker-end="url(#dhcp-a)"/>
<text x="380" y="243" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">REQUEST  192.168.1.42</text>
<text x="380" y="266" text-anchor="middle" font-size="11" fill="#5C5869">broadcast: I'll take that one, please</text>
<circle class="pkt-dot" r="4.5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M174 250 H586"/></circle>
</g>
<g class="f m" data-step="4">
<line x1="586" y1="310" x2="174" y2="310" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#dhcp-a)"/>
<text x="380" y="303" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">ACK  lease starts</text>
<text x="380" y="326" text-anchor="middle" font-size="11" fill="#5C5869">it's yours for 24 hours</text>
<circle class="pkt-dot" r="4.5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M586 310 H174"/></circle>
</g>
<g class="f pop m" data-step="4">
<rect x="20" y="320" width="140" height="24" rx="5" fill="#F4EEFA" stroke="#531A8A"/><text x="90" y="336" text-anchor="middle" font-size="11" font-weight="600" fill="#531A8A">192.168.1.42/24</text>
<rect x="600" y="320" width="140" height="24" rx="5" fill="#fff" stroke="#3D3A49"/><text x="670" y="336" text-anchor="middle" font-size="11" fill="#17151F">.42 → 3c:22:…:9e</text>
</g>
<g class="f m" data-step="5">
<text x="160" y="384" text-anchor="end" font-size="11" fill="#5C5869">12 h later</text><text x="160" y="400" text-anchor="end" font-size="11" fill="#5C5869">(T1 = 50%)</text>
<line x1="174" y1="388" x2="586" y2="388" stroke="#531A8A" stroke-width="1.6" marker-end="url(#dhcp-a)"/>
<text x="380" y="381" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">REQUEST  renew .42 · unicast</text>
<line x1="586" y1="426" x2="174" y2="426" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#dhcp-a)"/>
<text x="380" y="419" text-anchor="middle" font-size="11.5" font-weight="600" fill="#17151F">ACK  lease extended, 24 h again</text>
<circle class="pkt-dot" r="4.5"><animateMotion dur="2.4s" repeatCount="indefinite" path="M174 388 H586 V426 H174"/></circle>
</g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>0.0.0.0:68</td><td>255.255.255.255:67</td><td class="tag">DISCOVER</td><td>UDP broadcast · client MAC 3c:22:fb:7a:10:9e</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>192.168.1.1:67</td><td>client:68</td><td class="tag">OFFER</td><td>yiaddr 192.168.1.42 · mask /24 · router .1 · DNS .1 · lease 86400 s</td></tr>
<tr class="f" data-step="3"><td>3</td><td>03</td><td>0.0.0.0:68</td><td>255.255.255.255:67</td><td class="tag">REQUEST</td><td>requested IP 192.168.1.42 · server id 192.168.1.1</td></tr>
<tr class="f" data-step="4"><td>4</td><td>04</td><td>192.168.1.1:67</td><td>client:68</td><td class="tag">ACK</td><td>lease confirmed · client configures its interface</td></tr>
<tr class="f" data-step="5"><td>5</td><td>05</td><td>192.168.1.42:68</td><td>192.168.1.1:67</td><td class="tag">REQUEST</td><td>renewal, sent directly to the server that granted the lease</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>192.168.1.1:67</td><td>192.168.1.42:68</td><td class="tag">ACK</td><td>lease timer restarts at 24 h</td></tr>
</table>
<ol class="lx-caps">
  <li>A laptop joins the Wi-Fi. It has a MAC address but <b>no IP</b>, and it doesn't know where the DHCP server is.</li>
  <li><b>Discover</b>: it broadcasts to everyone on the LAN over UDP, from 0.0.0.0 port 68 to 255.255.255.255 port 67.</li>
  <li><b>Offer</b>: the server picks a free address from its pool and offers it with the mask, gateway, DNS servers and lease time.</li>
  <li><b>Request</b>: the laptop asks for that address. Still a broadcast, so any other DHCP server knows its offer was declined.</li>
  <li><b>Acknowledge</b>: the server records the lease against the laptop's MAC, and the laptop configures its interface.</li>
  <li>Halfway through the lease, the laptop <b>renews</b> directly with the server. Same IP, fresh 24 hours. If it never renews, the address returns to the pool.</li>
</ol>
{{< /fig >}}

## What a lease gives you

| Setting | Example | Check it with |
|---|---|---|
| IP address and prefix | `192.168.1.42/24` | `ip -br addr` |
| Default gateway | `192.168.1.1` | `ip route \| grep default` |
| DNS servers | `192.168.1.1` | `resolvectl status` |
| Search domain | `corp.example.com` | `cat /etc/resolv.conf` |
| Lease time | 24 hours | `nmcli device show wlan0`, or the DHCP client's lease file |

Leases are why a laptop or a cloud VM can come back with a different IP after a long shutdown, and why two machines never get the same address on a working network. If no server answers at all, the machine gives itself a link-local address from `169.254.0.0/16` and you have "connected, but no internet".

## Static IPs and reservations

Clients are fine with any address. Servers are not: a database, a Kafka broker or a printer must stay at a known address. Two ways to get that:

- **Static configuration**: set the IP, gateway and DNS by hand on the machine, using an address outside the DHCP pool so nothing else is given it.
- **DHCP reservation** (static lease): tell the DHCP server "MAC `3c:22:fb:7a:10:9e` always gets `.42`". The machine still uses DHCP, so gateway and DNS changes still reach it, but its address never changes. Usually the better option on networks you manage.

In practice you put a **DNS name** in front of either, so clients never hard-code the IP.

## DHCP in the cloud

Cloud VMs use DHCP too, but you rarely see it. In AWS, an instance's private IP is fixed for its lifetime, and the VPC's DHCP service hands it out at boot. What you configure is the **DHCP option set**: which DNS servers and domain name instances receive. This matters when a pipeline must resolve hostnames in an on-prem domain (for example `db.corp.example.com`) through a hybrid DNS resolver. Azure and GCP work similarly; for a fixed public address you allocate a static or elastic IP separately.

## Common mistakes

- **Giving a server a dynamic address** and pointing pipelines at its IP. After the next reboot or lease expiry the job connects to the wrong machine, or to nothing.
- **Picking a static IP inside the DHCP pool.** Sooner or later the server hands the same address to someone else and both machines break intermittently.
- **Two DHCP servers on one LAN** (a forgotten home router plugged into the office switch). Clients get random gateways; run one server per subnet, or relays.
- **Forgetting DHCP doesn't cross routers.** Each subnet needs its own server or a **DHCP relay** on the router that forwards the broadcasts.

## Try it

```bash
ip -br addr                              # the address the lease gave you
ip route | grep default                  # "proto dhcp" means it came from DHCP
resolvectl status | grep "DNS Server"    # DNS servers from the lease (systemd)
nmcli device show wlan0 | grep -i dhcp   # lease details (NetworkManager)
ipconfig getpacket en0                   # macOS: the full DHCP reply
sudo tcpdump -n -i any port 67 or port 68   # watch DORA while you reconnect
```

## Learning Resources

- [RFC 2131: Dynamic Host Configuration Protocol](https://www.rfc-editor.org/rfc/rfc2131): the specification
- [DHCP on Wikipedia](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol): clear diagrams of every message
- [AWS: DHCP option sets in Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_DHCP_Options.html)

See also: [IP addressing]({{< relref "ip-addressing" >}}), [DNS]({{< relref "/docs/roadmap/networking/protocols/dns" >}}).
