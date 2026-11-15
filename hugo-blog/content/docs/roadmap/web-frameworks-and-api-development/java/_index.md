---
weight: 2
description: "Java web frameworks in 2026: Spring Boot 4, Quarkus and Micronaut compared, virtual threads, GraalVM native images, a minimal controller, and how to choose."
---
# Java

Java runs a large share of the data ecosystem: Kafka, Flink, Trino, Cassandra, Elasticsearch and much of Hadoop and Spark are JVM software, and many companies' core business systems are Java services. Writing APIs in Java makes sense when your team already lives on the JVM, when you need to embed a JVM library (a Kafka Streams topology, a Flink client, an Iceberg catalog), or when a service must handle heavy, long-lived load.

Modern Java is much lighter than its reputation: **records** remove boilerplate, **virtual threads** (Java 21+) give cheap concurrency with ordinary blocking code, and **GraalVM native images** start in milliseconds. Java 25 is the current LTS release.

## The frameworks

### Spring Boot

**Spring Boot** is the dominant Java framework. It sits on the Spring Framework (dependency injection, Spring MVC or WebFlux for HTTP, Spring Data, Spring Security) and adds **auto-configuration**, an **embedded server** (Tomcat by default) and production features through **Actuator** (health checks, metrics). **Spring Boot 4** (November 2025) is built on Spring Framework 7 and Jakarta EE 11, with Java 17 as the minimum.

```java
@RestController
@RequestMapping("/orders")
class OrderController {
    private final OrderRepository repo;
    OrderController(OrderRepository repo) { this.repo = repo; }

    @GetMapping("/{id}")
    Order get(@PathVariable long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}

record Order(long id, String user, double total) {}
```

Enable virtual threads with `spring.threads.virtual.enabled=true` and every request runs on its own cheap thread, without rewriting code in a reactive style.

### Quarkus

**Quarkus** is designed for containers and Kubernetes: it does as much work as possible at **build time**, so applications start fast and use little memory, especially when compiled to a **native image**. It uses standard Jakarta REST (`@Path`, `@GET`) and MicroProfile APIs, and has a live-reload dev mode. A strong choice for serverless functions and many small services.

### Micronaut and others

**Micronaut** also does dependency injection at compile time for fast startup. **Helidon** (Oracle) is built around virtual threads. **Javalin** is a small, Flask-like library for simple services.

## How to choose

| Need | Pick |
|---|---|
| Most teams, largest ecosystem and hiring pool | **Spring Boot** |
| Fast startup, low memory, native images, serverless | **Quarkus** (or Micronaut) |
| Tiny service, minimal framework | Javalin, or Helidon SE |
| Very high concurrency, I/O-bound | Spring MVC + virtual threads first; WebFlux only if you need reactive streaming end to end |

## Common mistakes

- **Reaching for reactive (WebFlux) by default.** It complicates debugging and every library must be non-blocking. Virtual threads now cover most cases with simple blocking code.
- **Copying old `javax.*` tutorials.** Since Spring Boot 3, packages are `jakarta.*`.
- **Unbounded JVM memory in containers.** Set `-XX:MaxRAMPercentage` (for example 75) so the heap fits the container limit, or the pod is OOM-killed.
- **Pinning to an old LTS.** Java 8 and 11 lack records, virtual threads and years of performance work. Target 21 or 25.
- **N+1 queries with JPA.** Lazy-loaded relations in a loop issue one query per row. Use fetch joins or projections.

## Learning Resources

### Official

- [Spring Boot reference documentation](https://docs.spring.io/spring-boot/index.html) and [Spring guides](https://spring.io/guides)
- [Spring Initializr](https://start.spring.io/): generate a project skeleton
- [Quarkus guides](https://quarkus.io/guides/)
- [Micronaut documentation](https://docs.micronaut.io/latest/guide/)
- [JEP 444: Virtual Threads](https://openjdk.org/jeps/444)

### Books

- [Spring in Action, 6th edition](https://www.manning.com/books/spring-in-action-sixth-edition): Craig Walls
- [Spring Microservices in Action, 2nd edition](https://www.manning.com/books/spring-microservices-in-action-second-edition): John Carnell, Illary Huaylupo Sánchez
- [Quarkus in Action](https://www.manning.com/books/quarkus-in-action): Martin Štefanko, Jan Martiška

### Courses

- [Spring Framework and Microservices Full Course](https://www.youtube.com/watch?v=Jl9OKQ92SJU)
- [Spring Academy](https://spring.academy/): free official courses

See also: [Java language]({{< relref "/docs/roadmap/programming-language/java" >}}), [REST]({{< relref "/docs/roadmap/general-software-engineering-skills/rest" >}}).
