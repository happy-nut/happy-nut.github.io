# 부록 A. 에그리게잇과 이벤트 소싱(A+ES)

이벤트 소싱은 애그리게잇을 생성한 이후 발생한 일련의 이벤틀르 통해 애그리게잇의 상태를 나타내는 데 사용할 수 있다.
이벤트가 발생한 순서대로 해당 이벤트를 다시 재생한다면, 이벤트를 통해 애그리게잇의 상태를 재구축할 수 있다.

언뜻 복잡해보이는데 왜 이걸 할까?

* 이벤트 소싱은 애그리게잇 인스턴스에 발생하는 각 변경의 발생 원인이 유실되지 않음을 보장한다.
  * 이는 곧 단기/장기 비즈니스 정보 수집, 분석 보고서, 전체 감사 로그, 디버깅 등에 활용된다.
* 이벤트 스트림은 수정이 없고 추가만 허용되기 때문에 성능이 매우 좋고 다양한 데이터 복제 옵션의 지원이 가능해진다.
* 이벤틀르 중심으로 애그리게잇을 설계하면 ORM의 잠재적인 임피던스 불일치를 회피해 유비쿼터스 언어로 표현되는 행동에 더욱 집중할 수 있다.
  * 이는 곧 견고하고 내결함성이 높은 시스템을 구축할 수 있도록 해준다.

물론 단점이 없는 것도 아니다.

* 이벤트를 정의하기 위해 비즈니스 도메인에 대한 깊은 이해가 필요하다.
* 경험한 개발자가 별로 없고 정보도 많이 없어서 경험이 부족한 팀은 높은 비용과 큰 리스크를 감수해야 한다.
* CQRS가 필수적이기 때문에 러닝커브가 생긴다.

## 애플리케이션 서비스의 내부

![](../../../../assets/images/ddd_15.png)

애플리케이션 서비스는 제어 요청(1)을 받으면 애그리게잇(2)과 해당 애그리게잇의 비즈니스 오퍼레이션에 필요한 도메인 서비스를 가져온다.
애플리케이션 서비스가 애그리게잇의 비즈니스 오퍼레이션을 수행하면(3) 애그리게잇의 메소드는 그 결과로 이벤트를 돌려준다.
이런 이벤트는 애그리게잇의 상태를 변경할 뿐 아니라, 해당 이벤트의 구독자에게 알림으로서 발행된다.
애그리게잇의 비즈니스 메소드에게 하나 이상의 도메인 서비스를 파라미터로 넘겨야 할 수도 있다.

```kotlin
class CustomerApplicationService {
  lateinit var eventStore: EventStore // 이벤트 저장소
  lateinit var pricingService: PricingService // 도메인 서비스
  
  // 위 그림의 1단계. lockForAccountOverDraft 가 호출된다. 
  fun lockForAccountOverDraft(customerId: CustomerId, comment: String) {
    // 2단계. 이벤트 스트림을 가져와서 애그리게잇을 구축한다.
    val stream = eventStore.loadEventStream(customerId)
    val customer = new Customer(stream.Events)
    
    // 3단계. 인수와 가격에 관한 도메인 서비스와 함께 애그리게잇의 메소드를 호출한다.
    customer.lockForAccountOverdraft(comment, pricingService)
    
    // 4단계. 주어진 ID의 변경을 이벤트 스트림으로 커밋한다.
    eventStore.appendToStream(customerId, stream.version, customer.changes)
  }
}
```

Event Stream은 다음과 같다.

```kotlin
interface EventStore {
  fun loadEventStream(id: Identity): EventStream
  
  fun loadEventStream(id: Identity, skipEvents: Int, maxCount: Int): EventStream
  
  fun appendToStream(id: Identity, expectedVersion: Int, events: Collection<Event>)
}

data class EventStream(val version: Int, val events: List<Event>)
```

## 커맨드 핸들러

## 람다 구문

## 동시성 제어

## A+ES의 구조적 자유

## 성능

## 이벤트 저장소의 구현

## 관계형으로 저장하기

## 블롭으로 저장하기

## 집중된 애그리게잇

## 읽기 모델 투영

## 애그리게잇 설계와 함께 사용하기

## 이벤트 강화

## 지원 도구와 패턴

### 이벤트 직렬화기

### 이벤트 불변성

### 값 객체

## 계약 생성

## 단위 테스트와 명세

## 함수형 언어에서의 이벤트 소싱