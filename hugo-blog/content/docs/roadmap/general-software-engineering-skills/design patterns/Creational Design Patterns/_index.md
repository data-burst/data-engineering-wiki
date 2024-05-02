---
title: "Creational"
weight: 1
---

# Creational Design Pattern

## Introduction

In software engineering, creational design patterns are design patterns that deal with object creation mechanisms, trying to create objects in a manner suitable to the situation. The basic form of object creation could result in design problems or added complexity to the design. Creational design patterns solve this problem by somehow controlling this object creation.

> Creational patterns give a lot of flexibility in what gets created, who creates it, how it gets created, and, when.

### Two recurring themes in these patterns

    They all encapsulate knowledge about which concrete class the system uses.
    
    They hide how instances of these classes are created and put together.

---

### Some of these patterns include:
![creational-design-patterns](https://miro.medium.com/v2/resize:fit:1024/1*HxNUR4O_YrHxOitaFPLiRA.jpeg)

- [Abstract Factory](https://refactoring.guru/design-patterns/abstract-factory)
    - Creates an instance of several families of classes
- [Builder](https://sourcemaking.com/design_patterns/builder)
    - Separates object construction from its representation
- [Factory Method](https://refactoring.guru/design-patterns/factory-method)
    - Creates an instance of several derived classes
- [Object Pool](https://sourcemaking.com/design_patterns/object_pool)
    - Avoid expensive acquisition and release of resources by recycling objects that are no longer in use
- [Prototype](https://refactoring.guru/design-patterns/prototype)
    - A fully initialized instance to be copied or cloned
- [Singleton](https://refactoring.guru/design-patterns/singleton)
    - A class of which only a single instance can exist


---
## Example of Creational Design Patterns

Building a maze for a computer game, the maze and the game will vary slightly from pattern to pattern. We ignore what can be in a maze and whether a maze game has single or multiple players. Instead, we just focus on how the maze is created. We define a maze as a set of rooms, a room knows its neighbors; possible neighbors are another room, a wall, or a door to another room.

Sometimes the game will be simply to find your way out of a maze; in that case player will probably only have a local view of the maze. Sometimes the maze contains problems to solve and dangers to overcome and these games may provide a map of the part of the maze that has been explored.

## Learning resources

### Books

- [Head First Design Patterns: Building Extensible and Maintainable Object-Oriented Software 2nd Edition ](https://a.co/d/0Zvapmm)
- [Design Patterns: Elements of Reusable Object-Oriented Software (Gang of Four)](https://a.co/d/cTokqi1)

### Courses
- [Creational Design Patterns playlist by `BinarySymphony`](https://www.youtube.com/watch?v=CfcLUxAYwCc&list=PLn05u4nMKcB-1BSfb3L-09hkcSgNZHrv7&ab_channel=BinarySymphony)
- [Creational Design Pattern video by `Acing Programming Interview` ](https://youtu.be/VceHzkfQFjY?si=_mcwZIBoeiWEeNf0)
- [Design Patterns Video Tutorial by Derek Banas](https://www.youtube.com/watch?v=vNHpsC5ng_E&list=PLF206E906175C7E07&ab_channel=DerekBanas)
### Miscellaneous

- [Creational Design Patterns (by refactoring.guru)](https://refactoring.guru/design-patterns/creational-patterns)
- [Design Patterns (by SourceMaking)](https://sourcemaking.com/design_patterns/)
- [Creational Design Patterns (by GeeksForGeeks)](https://www.geeksforgeeks.org/creational-design-pattern)