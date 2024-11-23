---
title: graceful shutdown이 뭘까
date: 2024-11-24 05:47:14 +0900
categories: [engineering, operation]
tags: [graceful-shutdown, spring]
mermaid: true
math: false
---

graceful shutdown은 애플리케이션이 종료될 때 리소스를 적절히 해제하는 과정을 말한다.  
단순히 프로세스를 종료하는 것과 달리, 데이터 무결성과 시스템 안정성을 보장하며 종료하는 데 초점이 맞춰져 있다.

## Java 에서의 graceful shutdown

Java에서 graceful shutdown을 구현하는 방법은 다음과 같다.

```java
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    System.out.println("Shutting down gracefully...");
    // 리소스 정리 작업
    stopServer();
}));
```

SIGINT, SIGTERM 혹은 `System.exit` 같은 JVM 종료 이벤트 등을 받았을 때 shudown hook이 실행되어 리소스 정리 작업을 수행한다.


> **SIGKILL도 shutdown 훅이 불리는가?**  
SIGKILL은 운영 체제가 직접 프로세스를 강제 종료하는 것인데,
이 경우 프로세스는 이 신호를 감지할 기회가 없어서 shutdown 훅이 불리지 않고 곧바로 강제 종료된다.
{: .prompt-warning }

## Spring Boot 에서의 graceful shutdown

Spring Boot 2.3 이상부터 graceful shutdown이 [기본적으로 활성화](https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html#web.graceful-shutdown)되어 있다.  
[Tomcat의 shutdown 구현체](https://github.com/spring-projects/spring-boot/blob/main/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/web/embedded/tomcat/GracefulShutdown.java#L53-L63)가 하는 일을 비롯해서 graceful shutdown 동안 일어나는 일은 다음과 같다.  

- 새로운 요청 차단
- timeout 될때까지 기존 요청 처리 완료 대기
- Spring context 종료
- JVM 종료

timeout은 다음과 같이 설정할 수 있는데, 너무 작게 설정하면 요청 처리가 완료되지 않은 채 프로세스가 종료될 수 있다.

```yaml
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

## Spring graceful shutdown 주의사항

Graceful Shutdown의 기본 구현은 HTTP 요청과 서블릿 컨텍스트 종료에 초점이 맞춰져 있다.  
따라서 graceful 하게 shutdown 되지 않으면 안되는 사항들을 잘 챙겨야 한다.

예를 들어 다음의 경우, 기본 구현체에서 처리해주지 않으므로 Spring context 종료될 때 호출되는 `@PreDestroy` 에서 적절하게 처리를 해주어야 한다.

- 스케줄러(e.g. `ScheduledExecutorService`)가 실행 중인 작업.
- 메시지 큐(Kafka, RabbitMQ 등)에서 메시지를 소비하는 리스너.
- 비동기 HTTP 요청 처리 중인 `CompletableFuture` 또는 `Mono`, `Flux` 작업.

```java
@PreDestroy
public void cleanupAsyncTasks() {
  executorService.shutdown();
  try {
    if (!executorService.awaitTermination(30, TimeUnit.SECONDS)) {
      executorService.shutdownNow();
    }
  } catch (InterruptedException e) {
    executorService.shutdownNow();
  }
}
```

이 밖에도 주의해야 하는 상황들은 많다.

- TCP/UDP, WebSocket 등 네트워크 세션이 맺어진 경우
- 서드 파티 셧다운

