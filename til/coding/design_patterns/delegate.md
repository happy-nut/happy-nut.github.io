# Delegate 패턴

## 구현 예시

```java
public class KafkaConsumer<K, V> implements Consumer<K, V> {
  private final ConsumerDelegate<K, V> delegate;
}


// 개발환경: 메모리 기반
delegate = new InMemoryConsumerDelegate<>();

// 테스트환경: Mock
delegate = new MockConsumerDelegate<>();

// 프로덕션: 실제 Kafka
delegate = new ClassicKafkaConsumer<>();
```

## 왜 쓰는가

delegate 는 기본적으로 매우 거대한 덩어리를 쪼개어 책임을 위임하기 위해 사용된다.
위와 같이 카프카 컨슈머에서도 사용되는 패턴인데, delegate 를 둠으로써 개발, 테스트, 프로뎍션 환경에 따라 다른 구현체를 사용할 수 있다.

인터페이스를 쓰면 되는 것 아니야? 라고 생각할 수 있는데, 쪼개진 단위가 여러가지고, 이런 책임들을 한 데 묶어 총괄해야 하는 니즈가 있다고 해보자.

책임을 잘게 분산했기 떄문에 테스트 코드를 작성하기도 쉬워지고 책임들을 구현한 구현체를 조합하여 기능을 달성하기 때문에 확장에 유연해진다.
더군다나 총괄해서 처리하는 추상적인 부분은 코드를 따라 읽다보면 잘 이해가 되지 않을 텐데, 이 패턴을 통해 그 과정을 추상화 하여 이해하기 쉽게 만든다.


## 응용

```java
ConsumerDelegate<String, String> basicConsumer = new ClassicKafkaConsumer<>();
ConsumerDelegate<String, String> withRetry = new RetryConsumerDelegate<>(basicConsumer);
ConsumerDelegate<String, String> withMetrics = new MetricsConsumerDelegate<>(withRetry);
```

이런 식으로 기존 delegate 를 감싸는 방식으로 기능을 확장할 수 있다.

