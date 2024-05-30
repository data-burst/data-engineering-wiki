---
title: "UDP"
---

# UDP

## Introduction

The User Datagram Protocol or UDP is a communication protocol used  across the Internet for especially time-sensitive transmissions such as [video playback](https://www.cloudflare.com/learning/video/what-is-streaming/) or [DNS](https://www.cloudflare.com/learning/dns/what-is-dns/) lookups. It speeds up communications by not formally establishing a connection before data is transferred. This allows data to be  transferred very quickly, but it can also cause [packets](https://www.cloudflare.com/learning/network-layer/what-is-a-packet/) to become lost in transit and create opportunities for exploitation in the form of [DDoS attacks](https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/).

Like all [networking protocols](https://www.cloudflare.com/learning/network-layer/what-is-a-protocol/), UDP is a standardized method for transferring data between two computers in a network. Compared to other protocols, UDP accomplishes  this process in a simple fashion: it sends packets (units of data  transmission) directly to a target computer, without establishing a  connection first, indicating the order of said packets, or checking  whether they arrived as intended. (UDP packets are referred to as  ‘datagrams’.)

UDP is commonly used in time-sensitive communications where  occasionally dropping packets is better than waiting. Voice and video  traffic are often sent using this protocol because they are both  time-sensitive and designed to handle some level of loss. For example, [VoIP (voice over IP)](https://www.cloudflare.com/learning/video/what-is-voip/), which is used by many Internet-based telephone services, typically  operates over UDP. This is because a static-y phone conversation is  preferable to one that is crystal clear but heavily delayed.



## UDP vs TCP

As data is transferred from one point to another, it is given a  header, which tells devices what to do with it. The UDP header is a  simple 8-byte fixed header. With TCP, on the other hand, the header can  vary from 20 to 60 bytes. The fields for UDP port numbers are 16 bits  long, giving them a range that goes from 0 up to 65535. The header  consists of a 16-bit source port, a 16-bit destination port, a 16-bit  length, and a 16-bit checksum. This is the information used to send the  datagram toward its destination. The sending process does not involve  any verification of a connection between the source and the destination.

TCP is different in that it requires a handshake between where the  data originates and where it is headed. This makes TCP more reliable  than UDP. In the course of a TCP communication, the data can only be  sent along after the destination and source have been formally linked.  With UDP, because no link is required, the data can be sent right away.

Another difference between TCP and UDP communications is that with  TCP, the order in which the packets need to be received is confirmed  before the transmission begins. Also, TCP provides for the confirmation  that the packets arrived as intended. In the event that the packet does  not arrive, TCP dictates that it needs to be sent again. UDP does not  require any confirmation, checking, or resending.

If an application uses UDP, the users assume the risk of errors, the  data not reaching its destination, or being duplicated. The reward for  accepting this trade-off is better speed. UDP itself is not necessarily  to blame for the data loss. The information in the header is sufficient  to get the data where it needs to go, and the chronological order of the sending of the datagrams should keep them in order. 

## Learning resources

### Books

- [TCP/IP Illustrated, Volume 1: The Protocols](https://a.co/d/f06tDW5)
- [Pearson Computer Networking, 8E](https://www.amazon.com/TCP-Guide-Comprehensive-Illustrated-Protocols/dp/159327047X)

### Courses

- [TCP vs UDP Comparison | Cisco CCNA 200-301](https://www.youtube.com/watch?v=cA9ZJdqzOoU&pp=ygUMd2hhdCBpcyB1ZHAg)
- [User Datagram Protocol Explained | UDP Datagram Communication | Simplilearn](https://youtu.be/HMKC3RSUuJg?si=8uLUUfjiDGJBG3YA)

### Miscellaneous

- [What is UDP? (by cloudflare)](https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/)
- [What is UDP? (by fortinet)](https://www.fortinet.com/resources/cyberglossary/user-datagram-protocol-udp)
