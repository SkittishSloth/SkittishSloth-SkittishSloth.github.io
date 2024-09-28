---
title: Safe Call
toc: false
category:
- Code Snippets
tags:
- null safety
- functional programming
---

## Scenario
Conditional method calls, espescially with fluent interfaces like builders:

```java
final WebClient.Builder webClientBuilder = WebClient.builder().baseUrl("https://test.url");

if (requestHeaders != null) {
    webClientBuilder.defaultHeaders(headers -> headers.addAll(requestHeaders));
}

if (useCustomExchangeFunction()) {
    webClientBuilder.exchangeFunction(customExchangeFunction());
}

if ((defaultUriVariables != null) && !(defaultUriVariables.isEmpty())) {
    webClientBuilder.defaultUriVariables(defaultUriVariables);
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
