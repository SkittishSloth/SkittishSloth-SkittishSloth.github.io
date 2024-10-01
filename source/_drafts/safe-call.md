---
title: Safe Call
toc: false
category:
- Practices & Patterns
tags:
- null safety
- functional programming
- code snippets
- fluent api
---

## Scenario
Conditional method calls, especially with fluent interfaces like builders:

```java
final AppConfig.Builder builder = defaultConfiguration().toBuilder();

if (serviceUrl != null) {
  builder.serviceUrl(serviceUrl);
}

if (cacheTimeout != null) {
  builder.cacheTimeout(cacheTimeout);
}

if (useMongo != null && useMongo) {
  builder.useMongo(true);
}

// etc.
```

This is particularly ugly if dealing with an immutable instance like 
Spring's `RedisCacheConfiguration`:

```java
final RedisCacheConfiguration cacheConfig = defaultCacheConfiguration();

final RedisCacheConfiguration withTtl;
if (ttl != null) {
    withTtl = cacheConfig.entryTtl(ttl);
} else {
    withTtl = cacheConfig;
}

final RedisCacheConfiguration nullValues;
if (cacheNullValues != null && !cacheNullValues) {
    nullValues = withTtl.disableCachingNullValues();
} else {
    nullValues = withTtl;
}

// ...
```

## Approach 1 - Method
There are two ways to handle this. First, as a utility method:

```java
public static <T> safeCall(final T input, final Consumer<T> consumer) {
  if (input != null) {
    consumer.accept(input);
  }
}
```

This is most appropriate for scenarios like the `AppConfig` example above - the return value isn't needed. You would replace the earlier code like so:

```java
final AppConfig.Builder builder = defaultConfiguration().toBuilder();

safeCall(serviceUrl, builder::serviceUrl);
safeCall(cacheTimeout, builder::cacheTimeout);

// You can implement the appropriate version
// to handle this as an exercise if you like.
if (useMongo != null && useMongo) {
  builder.useMongo(true);
}
```

# Approach #2 - Class
When dealing with immutable classes - ones that return a new instance with the modified values instead of modifying itself in place - the above approach isn't very practical. You can change the signature to take a Function instead of a Consumer and return the result, but then you still have intermediate variables to deal with and you lose the whole point of a fluent API.

Instead, create a class - or even just a record to trim some of the boiler plate - that wraps the functionality:

```java
// Using Project Lombok's annotations to reduce
// boilerplate. You can argue this isn't a 
// value class if you're that bored.
@Value
public class SafeCall<B> {
  B builder

  public <T> SafeCall<U> call(T input, BiFunction<B, T, B> fn) {
    if (input != null) {
       return new SafeCall<>(fn.apply(builder, input)); 
    }
    
    return this;
  }
}
```

You'd replace the earlier code like so:

```java
final RedisCacheConfiguration cacheConfig = defaultCacheConfiguration();

final SafeCall<RedisCacheConfiguration> safeConfig = new SafeCall<>(cacheConfig);

safeConfig.call(ttl, RedisCacheConfiguration::entryTtl)
  .call(cacheNullValues, (config, __) -> config.disableCachingNullValues());
```

There's definitely room for improvement - adding a method that takes a `Function<B, B>` would allow using a method reference on the second call:

```java
// In SafeCall:
public <T> SafeCall<B> call(T test, Function<B, B> fn) {
  if (input != null) {
    return new SafeCall<>(fn.apply(builder))
  }
}

// Then;
safeConfig.call(cacheNullValues, RedisCacheConfiguration::disableCachingNullValues)
.call(...)
```

This won't work for scenarios where the fluent methods return a different type. This is something you might come across when working with Spring's `WebClient` for example:

```java
// TODO: WebClient example
```

The problem arises in handling the case where `input` is `null`:

```java
public <T, U> SafeCall<U> call(T input, BiFunction<B, T, U> fn) {
  if (input != null) {
    return new SafeCall<>(fn.apply(builder, input));
  }
  
  // ???
}
```

This is a good candidate for using an `Option` or an `Either` monad; here's a quick example using Java's
`Optional`:

```java
public <T, U> Optional<SafeCall<U>> call(T input, BiFunction<B, T U> fn) {
  return Optional.ofNullable(input)
    .map(in -> fn.apply(builder, in))
    .map(SafeCall::new);
}
```