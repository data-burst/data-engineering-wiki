---
title: "DNS"
---
# DNS

## Introduction

The **Domain Name System (DNS)** is a hierarchical and decentralized naming system for computers, services, or other resources connected to the Internet or a private network. It associates various information with domain names assigned to each of the participating entities. Most prominently, it translates more readily memorized domain names to the numerical IP addresses needed for locating and identifying computer services and devices with the underlying network protocols.

Each device connected to the Internet has a unique IP address which other machines use to find the device. DNS servers eliminate the need for humans to memorize IP addresses such as 192.168.1.1 (in IPv4), or more complex newer alphanumeric IP addresses such as 2400:cb00:2048:1::c629:d7a2 (in IPv6).

The process of DNS resolution involves converting a hostname (such as www.example.com) into a computer-friendly IP address (such as 192.168.1.1). An IP address is given to each device on the Internet, and that address is necessary to find the appropriate Internet device - like a street address is used to find a particular home. When a user wants to load a webpage, a translation must occur between what a user types into their web browser (example.com) and the machine-friendly address necessary to locate the example.com webpage.

In order to understand the process behind the DNS resolution, it’s important to learn about the different hardware components a DNS query must pass between. For the web browser, the DNS lookup occurs "behind the scenes" and requires no interaction from the user’s computer apart from the initial request.

There are 4 DNS servers involved in loading a webpage:

- **DNS recursor** - The recursor can be thought of as a librarian who is asked to go find a particular book somewhere in a library.
- **Root nameserver** - The root server is the first step in translating (resolving) human readable host names into IP addresses.
- **TLD nameserver** - The top level domain server (TLD) can be thought of as a specific rack of books in a library.
- **Authoritative nameserver** - This final nameserver can be thought of as a dictionary on a rack of books, in which a specific name can be translated into its definition.

The DNS has been an essential component of the functionality of the Internet since 1985. The DNS delegates the responsibility of assigning domain names and mapping those names to Internet resources by designating authoritative name servers for each domain. Network administrators may delegate authority over subdomains of their allocated name space to other name servers. This mechanism provides distributed and fault-tolerant service and was designed to avoid a single large central database.

## Learning resources

### Books

- [DNS and BIND](https://www.oreilly.com/library/view/dns-and-bind/0596100574/)
- [Pro DNS and BIND 10](https://www.amazon.com/Pro-DNS-BIND-Ron-Aitchison/dp/1430230487)

### Courses

- [Everything You Need to Know About DNS](https://www.youtube.com/watch?v=27r4Bzuj5NQ)
- [Web Hosting Tutorial for Beginners](https://www.youtube.com/watch?v=BDdACdrs1vE)

### Miscellaneous

- [What is DNS? | How DNS works](https://www.cloudflare.com/learning/dns/what-is-dns/)
- [What is DNS? Basics for Beginners](https://www.freecodecamp.org/news/what-is-dns-for-beginners/)