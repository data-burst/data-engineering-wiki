---
title: "Concepts"
weight: 2
description: "Networking concepts for data platforms: IP addressing and CIDR, DHCP, firewalls and VPNs, each with an animated, packet-level example."
---
<div class="lx-kicker-line">$ ip route</div>

# Networking concepts

Protocols say how machines talk. These pages cover the ground rules around them: how a machine gets an **address**, which addresses it can reach **directly**, who is **allowed** to talk to whom, and over which **path**. They are the pages to read before you design a VPC, open a security group or debug "connection timed out" from a pipeline.

<div class="lx-cards">
  <div class="lx-card"><div class="lab">Addresses</div><h4><a href="{{< relref "ip-addressing" >}}">IP addressing</a></h4><p>Reading 192.168.1.42/24, network and host bits, private ranges, ports, the default gateway, NAT and VPC CIDRs.</p></div>
  <div class="lx-card"><div class="lab">Addresses</div><h4><a href="{{< relref "dhcp" >}}">DHCP</a></h4><p>How a machine gets its IP, gateway and DNS servers: Discover, Offer, Request, Acknowledge, leases and reservations.</p></div>
  <div class="lx-card"><div class="lab">Access</div><h4><a href="{{< relref "firewalls" >}}">Firewalls</a></h4><p>Rules that allow or drop traffic by address, port and connection state. Cloud security groups are firewalls too.</p></div>
  <div class="lx-card"><div class="lab">Paths</div><h4><a href="{{< relref "vpn" >}}">VPN</a></h4><p>An encrypted tunnel that puts a laptop or a whole office on a private network, for example to reach a database with no public IP.</p></div>
</div>

Read them in this order: IP addressing first, because firewall rules and VPN routes are written in CIDRs. For the protocols that run on top, see [Protocols]({{< relref "/docs/roadmap/networking/protocols" >}}).
