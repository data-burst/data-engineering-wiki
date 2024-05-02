---
title: "Structural"
weight: 1
---

### Structural Design Pattern

## Introduction
Structural design patterns explain how to assemble objects and classes into larger structures, while keeping these structures flexible and efficient.

You could also describe them as design patterns that ease the design by identifying a simple way to realize relationships between entities.

### Two recurring themes in these patterns:

    This pattern is particularly useful for making independently developed class libraries work together.

    Structural Design Patterns describe ways to compose objects to realize new functionality. The added flexibility of object composition comes from the ability to change the composition at run-time, which is impossible with static class composition.

--- 

### Some of these patterns include:
![structural-design-patterns](https://miro.medium.com/v2/resize:fit:1024/1*oqxCzwv8k9MYsDNYUH6L0Q.jpeg)

- [Adapter](https://sourcemaking.com/design_patterns/adapter)
   Match interfaces of different classes

- [Bridge](https://sourcemaking.com/design_patterns/bridge)
   Separates an object's interface from its implementation

- [Composite](https://sourcemaking.com/design_patterns/composite)
   A tree structure of simple and composite objects

- [Decorator](https://sourcemaking.com/design_patterns/decorator)
   Add responsibilities to objects dynamically

- [Facade](https://sourcemaking.com/design_patterns/facade)
   A single class that represents an entire subsystem

- [Flyweight](https://sourcemaking.com/design_patterns/flyweight)
   A fine-grained instance used for efficient sharing

- [Private Class Data](https://sourcemaking.com/design_patterns/private_class_data)

   Restricts accessor/mutator access

- [Proxy](https://sourcemaking.com/design_patterns/proxy)
   An object representing another object

---
## Example for Structural Design Patterns

Consider an example, a drawing editor that lets users draw and arrange graphical elements (lines, polygons, text, etc.) into pictures and diagrams. The drawing editor’s key abstraction is the graphical object, which has an editable shape and can draw itself.

The interface for graphical objects is defined by an abstract class called Shape. The editor defines a subclass of the Shape for each kind of graphical object: a LineShape class for lines, a PolygonShape class for polygons, and so forth.


## Learning resources

### Books

\- [Head First Design Patterns: Building Extensible and Maintainable Object-Oriented Software 2nd Edition ](https://a.co/d/0Zvapmm)

\- [Design Patterns: Elements of Reusable Object-Oriented Software (Gang of Four)](https://a.co/d/cTokqi1)

### Courses

- [Structural Design Patterns playlist by `BinarySymphony`](https://www.youtube.com/watch?v=N6iMrBiPycs&list=PLn05u4nMKcB_QzKVeALuCiTyJIFGKyfkg)
- [Design Patterns Playlist by Geekfic](https://youtu.be/wA3keqCeKtM?si=d82Iu_UWrV1vwZFP)
- [Design Patterns Video Tutorial by Derek Banas](https://www.youtube.com/watch?v=vNHpsC5ng_E&list=PLF206E906175C7E07&ab_channel=DerekBanas)

### Miscellaneous

- [Structural Design Patterns (by refactoring.guru)](https://refactoring.guru/design-patterns/structural-patterns)
- [Design Patterns (by SourceMaking)](https://sourcemaking.com/design_patterns/)
- [Structural Design Patterns (by GeeksForGeeks)](https://www.geeksforgeeks.org/structural-design-patterns/)