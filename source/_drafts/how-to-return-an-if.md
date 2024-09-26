---
title: How to Return an If
toc: true
tags:
---

Okay, let's start this blog off with something simple. In a totally realistic, not at all contrived scenario, we have the following code:

```java
record Person(
    String firstName,
    String lastName
) {

    public static Person parsePerson(String name) {
        final String[] parts = input.split(",");

        if (parts.length == 2) {
            return new Person(parts[0], parts[1]);
        }
    }
}

```

I'm 85% sure this won't compile, but let's ignore that for now. What would this method return if we called it with "Skittish,Sloth"? It'd
return a `Person` instance, with a first name of "Skittish" and a last name of "Sloth".