---
title: "HTTP"
---

# HTTP

## Introduction

Hypertext Transfer Protocol (HTTP) is the foundation of data communication on the World Wide Web. It defines how messages are formatted and transmitted between web servers and clients (such as web browsers). Let's delve into the key aspects of HTTP:

1. **Request-Response Model**: HTTP operates using a simple request-response model. A client (usually a web browser) sends an HTTP request to a server, which processes the request and sends back an HTTP response.

2. **Statelessness**: HTTP is stateless, meaning each request-response pair is independent. The server does not retain any information about previous requests from the same client.

3. **Methods (Verbs)**: HTTP defines various methods (also known as verbs) that indicate the desired action to be performed on a resource. Common methods include:
   - **GET**: Retrieve data from the server.
   - **POST**: Send data to the server (often used for form submissions).
   - **PUT**: Update an existing resource.
   - **DELETE**: Remove a resource.

4. **Headers**: HTTP headers provide additional information about the request or response. Examples include the `User-Agent` header (identifying the client), `Content-Type` (specifying the data format), and `Location` (for redirects).

5. **Status Codes**: HTTP responses include status codes indicating the outcome of the request. Common codes include:
   - **200 OK**: Successful request.
   - **404 Not Found**: Resource not found.
   - **500 Internal Server Error**: Server encountered an error.

## Learning Resources

### Books

- [Learning HTTP/2: A Practical Guide for Beginners](https://www.amazon.com/dp/1491962445)
- [HTTP: The Definitive Guide (Definitive Guides)](https://www.amazon.com/HTTP-Definitive-Guide-Guides/dp/1565925092)

### Courses
- [HTTP/1 to HTTP/2 to HTTP/3](https://www.youtube.com/watch?v=a-sBfyiXysI)
- [HTTP Status Codes explained in 5 minutes](https://www.youtube.com/watch?v=qmpUfWN7hh4)

### Documentation
- [Hypertext Transfer Protocol -- HTTP/1.1](https://www.w3.org/Protocols/rfc2616/rfc2616.html)
- [HTTP - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP)