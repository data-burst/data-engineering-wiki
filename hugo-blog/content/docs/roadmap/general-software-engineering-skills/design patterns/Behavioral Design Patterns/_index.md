---
title: "Behavioral"
weight: 1
---

### Behavioral Design Pattern

## Introduction

Behavioral Patterns are concerned with algorithms and the assignment of responsibilities between objects. 

Behavioral patterns describe not just patterns of objects or classes but also the patterns of communication between them. These patterns characterize complex control flow that’s difficult to follow at run-time.

### Three recurring themes in these patterns:

- Behavioral class patterns use inheritance to distribute behavior between classes. 
- Behavioral object patterns use object composition rather than inheritance.
- Behavioral object patterns are concerned with encapsulating behavior in an object and delegating requests to it.  

### Some of these patterns include:
![behavioral-design-patterns](https://miro.medium.com/v2/resize:fit:1024/1*i4-Nqk8wppxeDbyU7pFuLg.png)

* [Chain of responsibility](https://sourcemaking.com/design_patterns/chain_of_responsibility)
   A way of passing a request between a chain of objects

* [Command](https://sourcemaking.com/design_patterns/command)
   Encapsulate a command request as an object

* [Interpreter](https://sourcemaking.com/design_patterns/interpreter)
   A way to include language elements in a program

* [Iterator](https://sourcemaking.com/design_patterns/iterator)
   Sequentially access the elements of a collection

* [Mediator](https://sourcemaking.com/design_patterns/mediator)
   Defines simplified communication between classes

* [Memento](https://sourcemaking.com/design_patterns/memento)
   Capture and restore an object's internal state

* [Null Object](https://sourcemaking.com/design_patterns/null_object)
   Designed to act as a default value of an object

* [Observer](https://sourcemaking.com/design_patterns/observer)
   A way of notifying change to a number of classes

* [State](https://sourcemaking.com/design_patterns/state)
   Alter an object's behavior when its state changes

* [Strategy](https://sourcemaking.com/design_patterns/strategy)
   Encapsulates an algorithm inside a class

* [Template method](https://sourcemaking.com/design_patterns/template_method)
   Defer the exact steps of an algorithm to a subclass

* [Visitor](https://sourcemaking.com/design_patterns/visitor)
   Defines a new operation to a class without change

--- 
## An example: Weather Station

#### Scenario: 
You have a weather station that measures weather data such as temperature, humidity, and pressure. You want to develop a system where multiple display elements can show this data in real-time. For example, one display might show just the temperature, another might show both temperature and humidity, and a third one could provide a full meteorological summary.

#### Problem:
The weather data changes frequently, and multiple displays need to update their information without needing to check constantly if the data has changed.

#### Solution Using Observer Pattern:
Subject (Observable) Interface: This is the interface that the weather station will implement. It includes methods to register, deregister, and notify observers.

Observer Interface: This is the interface that all display elements implement. It includes a method to update the display based on the new data received from the weather station.

Concrete Subject (WeatherStation): This is the class implementing the Subject interface. It maintains a list of observers and a method to update all registered observers when the data changes.

Concrete Observers (Displays): These are classes that implement the Observer interface. Each observer registers itself with the Weather Station and updates its display whenever the notify method is called.

## Learning resources

### Books

\- [Head First Design Patterns: Building Extensible and Maintainable Object-Oriented Software 2nd Edition ](https://a.co/d/0Zvapmm)

\- [Design Patterns: Elements of Reusable Object-Oriented Software (Gang of Four)](https://a.co/d/cTokqi1)

### Courses

- [Behavioral Design Patterns playlist by `BinarySymphony`](https://youtu.be/vzCVO7B6wYw?si=zRbitn6szEuc7Nvf)
- [Design Patterns Playlist by Geekfic](https://youtu.be/FafNcoBvVQo?si=Hv6w5fKNSiOrGt7l)
- [Design Patterns Video Tutorial by Derek Banas](https://www.youtube.com/watch?v=vNHpsC5ng_E&list=PLF206E906175C7E07&ab_channel=DerekBanas)

### Miscellaneous

- [Behavioral Design Patterns (by refactoring.guru)](https://refactoring.guru/design-patterns/behavioral-patterns)
- [Design Patterns (by SourceMaking)](https://sourcemaking.com/design_patterns/)
- [Behavioral Design Patterns (by GeeksForGeeks)](https://www.geeksforgeeks.org/behavioral-design-patterns/)