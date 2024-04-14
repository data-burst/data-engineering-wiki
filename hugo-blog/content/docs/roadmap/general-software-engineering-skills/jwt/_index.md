---
title: "JWT"
weight: 2
---
# The Key to Secure and Efficient Web Applications

## Introduction

**JSON Web Tokens (JWT)** are an open standard (RFC 7519) that define a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.

## How JWT Works

When a user logs in, the server creates a **JWT** with a secret and sends the JWT to the client. The client stores the JWT (usually in local storage) and includes JWT in the header with every request. The server would then validate the JWT with every request from the client and sends a response.

## Structure of JWT

A JWT typically looks like `xxxxx.yyyyy.zzzzz` and is composed of three parts separated by dots:

1. **Header**: The header typically consists of two parts: the type of the token, which is JWT, and the signing algorithm being used, such as HMAC SHA256 or RSA.

2. **Payload**: The second part of the token is the payload, which contains the claims or the pieces of information being passed about the user and any additional data.

3. **Signature**: To create the signature part, you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header, and sign that.

## Conclusion

**JWTs** are a stateless, compact, and secure way of handling user authentication and maintaining sessions. They are self-contained, easily transmitted, and require no server-side storage making them an excellent choice for RESTful APIs.


## Learning Resources

Here are some suggestions for learning JWT, which will help you become more proficient in secure application development:

### Books

- [JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook?_gl=1*xg94mt*_gcl_au*MTc4MzgwNjQ1NC4xNzEwMzY0ODMy*_ga*NzY1Nzk0Nzk5LjE3MTAzNjQ4NDE.*_ga_QKMSDV5369*MTcxMzAyMDE2MS40LjEuMTcxMzAyMDE2MS42MC4wLjA.) 


### Miscellaneous

- **jwt.io**: An interactive website by Auth0 that provides a debugger, libraries, and detailed documentation on JWT.

