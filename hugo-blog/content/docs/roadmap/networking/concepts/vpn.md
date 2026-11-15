---
title: "VPN"
description: "How a VPN works, animated: tunneling and encapsulation, WireGuard vs IPsec vs OpenVPN, site-to-site vs remote access, and zero-trust alternatives."
bookToC: false
---
<div class="lx-kicker-line">$ wg-quick up wg0</div>

# VPN

A **VPN** (Virtual Private Network) builds an encrypted **tunnel** across an untrusted network so that a remote machine behaves as if it were plugged into a private one. Your laptop's packets to an internal address are encrypted, wrapped in an ordinary-looking outer packet addressed to a **VPN gateway**, and unwrapped there. For a data engineer, that is how you reach a warehouse, a database or an internal Airflow UI that has no public address.

## Encapsulation, step by step

{{< fig kicker="$ psql -h 10.0.2.15   # from a café" title="One packet through a WireGuard tunnel" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <rect x="172" y="14" width="262" height="92" rx="8" fill="none" stroke="#8C8899" stroke-dasharray="4 5"/>
  <text x="303" y="30" text-anchor="middle" class="m" font-size="11" fill="#8C8899">PUBLIC INTERNET · CAFÉ WI-FI</text>
  <rect x="602" y="14" width="148" height="92" rx="8" fill="none" stroke="#8C8899" stroke-dasharray="4 5"/>
  <text x="676" y="30" text-anchor="middle" class="m" font-size="11" fill="#8C8899">PRIVATE 10.0.0.0/16</text>
  <g class="f" data-step="2">
    <rect x="150" y="47" width="305" height="22" rx="11" fill="#F4EEFA" stroke="#DCC9EE"/>
    <text x="303" y="62" text-anchor="middle" class="m" font-size="11" fill="#531A8A">ENCRYPTED TUNNEL · UDP 51820</text>
  </g>
  <rect x="20" y="32" width="130" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text x="85" y="54" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">LAPTOP</text>
  <text x="85" y="72" text-anchor="middle" class="m" font-size="11" fill="#8C8899">192.0.2.44</text>
  <rect x="455" y="32" width="130" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text x="520" y="54" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">VPN GATEWAY</text>
  <text x="520" y="72" text-anchor="middle" class="m" font-size="11" fill="#8C8899">198.51.100.1</text>
  <rect x="617" y="40" width="118" height="52" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text x="676" y="62" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">DATABASE</text>
  <text x="676" y="80" text-anchor="middle" class="m" font-size="11" fill="#8C8899">10.0.2.15:5432</text>
  <g class="f" data-step="1">
    <text x="20" y="147" class="m" font-size="11" font-weight="600" fill="#5C5869">1 · LAPTOP BUILDS</text>
    <rect x="190" y="128" width="200" height="30" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="290" y="147" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">IP 10.8.0.2 → 10.0.2.15</text>
    <rect x="396" y="128" width="100" height="30" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="446" y="147" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">TCP → 5432</text>
    <rect x="502" y="128" width="110" height="30" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="557" y="147" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SELECT …</text>
  </g>
  <g class="f" data-step="2">
    <text x="20" y="197" class="m" font-size="11" font-weight="600" fill="#5C5869">2 · ENCRYPT + WRAP</text>
    <rect x="190" y="178" width="225" height="30" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="302" y="197" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">IP 192.0.2.44 → 198.51.100.1</text>
    <rect x="421" y="178" width="90" height="30" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="466" y="197" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">UDP 51820</text>
    <rect x="517" y="178" width="190" height="30" rx="6" fill="#531A8A"/>
    <text x="612" y="197" text-anchor="middle" class="m" font-size="11.5" fill="#fff">encrypted inner packet</text>
  </g>
  <g class="f" data-step="3">
    <text x="20" y="247" class="m" font-size="11" font-weight="600" fill="#5C5869">3 · CAFÉ SEES</text>
    <rect x="190" y="228" width="517" height="30" rx="6" fill="#fff" stroke="#DCC9EE"/>
    <text x="448" y="247" text-anchor="middle" class="m" font-size="11.5" fill="#3D3A49">laptop ↔ gateway, UDP, size, timing. Not the DB, not the query.</text>
  </g>
  <g class="f" data-step="4">
    <text x="20" y="297" class="m" font-size="11" font-weight="600" fill="#5C5869">4 · GATEWAY UNWRAPS</text>
    <rect x="190" y="278" width="200" height="30" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="290" y="297" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">IP 10.8.0.2 → 10.0.2.15</text>
    <rect x="396" y="278" width="100" height="30" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="446" y="297" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">TCP → 5432</text>
    <rect x="502" y="278" width="110" height="30" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="557" y="297" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SELECT …</text>
    <text x="625" y="297" class="m" font-size="11.5" font-weight="600" fill="#531A8A">→ DATABASE</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>You are on café Wi-Fi. The database lives in a private network and has <b>no public IP</b>. Only the VPN gateway is reachable from the internet.</li>
  <li>Your app sends a normal packet to <b>10.0.2.15</b>. The OS routes it to the VPN interface, which gave the laptop an inner address, 10.8.0.2.</li>
  <li>The VPN client <b>encrypts</b> the whole inner packet and <b>wraps</b> it in a new outer packet addressed to the gateway. This is <b>encapsulation</b>.</li>
  <li>Anyone on the path sees only the <b>outer header</b>: who talks to the gateway, when, and how much. The content and the real destination are hidden.</li>
  <li>The gateway <b>decrypts</b>, strips the outer header and forwards the original packet into the private network. The database sees a normal internal connection.</li>
</ol>
{{< /fig >}}

## Kinds of VPN

| Kind | Connects | Typical use |
|---|---|---|
| **Remote access** | One device → a network | Engineers reaching internal tools and databases |
| **Site-to-site** | Network → network | Office or on-prem data center ↔ cloud VPC (AWS Site-to-Site VPN, Cloud VPN) |
| **Mesh / overlay** | Every device ↔ every device | Tailscale, NetBird, ZeroTier: peer-to-peer WireGuard with central identity |
| **Consumer privacy VPN** | You → a provider's exit server | Hides your traffic from the local network and ISP, moves trust to the VPN provider |

## Protocols in 2026

| Protocol | Notes |
|---|---|
| **WireGuard** | Small, fast, modern crypto, in the Linux kernel since 5.6. The default choice for new setups. UDP only. |
| **IPsec (IKEv2)** | The standard for site-to-site links and cloud provider VPN gateways. Mature, complex to configure. |
| **OpenVPN** | TLS-based, runs over UDP or TCP 443, gets through restrictive networks. Slower than WireGuard. |
| SSL VPN appliances | Vendor products (Fortinet, Ivanti, Cisco). Frequent targets of critical vulnerabilities: patch quickly. |

## VPN vs zero trust

A classic VPN says "once you're in the network, you're trusted". If one laptop is compromised, the attacker is inside too. **Zero-trust** access (Cloudflare Access, Google BeyondCorp/IAP, Tailscale ACLs, Teleport) checks identity and device health on **every** request to **each** service, and grants access to one app instead of a whole subnet. Many teams now use an identity-aware proxy for web tools and keep a VPN, or a short-lived [SSH tunnel]({{< relref "../protocols/ssh" >}}), only for raw database ports.

## Common mistakes

- **Overlapping address ranges.** If the office uses 10.0.0.0/16 and so does the VPC, routes conflict. Plan non-overlapping CIDRs early.
- **Full tunnel by accident.** Sending all traffic, including video calls, through the gateway makes everything slow. Use split tunneling for internal ranges only, unless policy requires otherwise.
- **Assuming a VPN means anonymity.** The VPN provider or your company sees everything the café used to see.
- **MTU problems.** Encapsulation adds bytes. Large packets that don't fit are dropped and connections hang after the handshake. WireGuard's default MTU of 1420 accounts for this.

## Learning Resources

- [WireGuard whitepaper and docs](https://www.wireguard.com/): Jason Donenfeld, short and readable
- [What is a VPN?](https://www.cloudflare.com/learning/access-management/what-is-a-vpn/): Cloudflare Learning Center
- [How Tailscale works](https://tailscale.com/blog/how-tailscale-works): NAT traversal and mesh VPNs explained
- [BeyondCorp: A New Approach to Enterprise Security](https://research.google/pubs/beyondcorp-a-new-approach-to-enterprise-security/): Google's zero-trust paper
- [AWS Site-to-Site VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)

See also: [Firewalls]({{< relref "firewalls" >}}), [SSH]({{< relref "../protocols/ssh" >}}).
