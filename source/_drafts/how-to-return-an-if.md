---
title: How to Return an If
toc: true
tags:
---
## In the Beginning

Okay, let's start this blog off with something simple. In a totally realistic, not at all contrived scenario, we have the following code:

```java
public int intDiv(int a, int b) {
  if (b != 0) {
    return a / b;
  }
}
```

I'm 85% sure this won't compile, but let's ignore that for now. What would it return if we called it as `intDiv(10, 2)`? It should return 5 of course. But what about `intDiv(5, 0)`?

## An Exceptional Attempt

Now, we can throw an exception if `b` is 0. I have little love for exceptions though - we'll discuss that some other time. But that's a legitimate option, and it's probably what you'd see if you came across it in the wild:

```java
public int intDiv(int a, int b) {
  if (b == 0) {
    throw new IllegalArgumentException("Can't divide by 0!");
  }
  
  return a / b;
}
```

That's definitely doable, but now whoever calls the method has to deal with the exception, pretending they're going to do anything other than just log it and move on. That's a pain in the ass. And the alternative - let the exception bubble up to be someone else's problem - is just lazy.

## A Token Answer

Something else we can do: return some value that indicates the operation failed. Like an error code for a command line application, or an HTTP status code. That will work!

Except, not *really*.

Think about it: what integer value could we return that would tell us it failed? `-1`? `0`?
Those are both pretty standard choices for an error code, but they're also both values that could be legitimate answers. What about `Integer.MIN_VALUE` or `Integer.MAX_VALUE`? Same - it's less likely, but they're still perfectly valid possibilities for a result.

## Everyone's Favorite Mistake

Now, there is *one* possible value we could return.