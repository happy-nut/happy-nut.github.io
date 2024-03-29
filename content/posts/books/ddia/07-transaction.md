---
title: 7장. 트랜잭션
date: 2022-05-07
slug: "/books/ddia/7"
tags:
- 책
- 아키택처
- 프로그래밍
- 분산시스템
- 시스템디자인
---

[![](https://dataintensive.net/images/map-ch3.jpg)](https://dataintensive.net/poster.html)

현실세계는 냉혹하다.

* DB 소프트웨어/하드웨어는 언제든지 뻗을 수 있다.
* 애플리케이션도 마찬가지로 언제든지 뻗을 수 있다.
* 네트워크가 끊겨서 DB 노드 사이 통신이 끊기거나, 애플리케이션과 DB 사이 연결도 끊길 수 있다.
* 여러 클라가 동시에 DB에 쓰기 요청을 할 수 있다.
* 클라가 부분 갱신되어 비정상적인 데이터를 읽을 수 있다.
* 클라 사이의 race condition 은 버그를 유발한다.

이런 문제를 단순화하기 위해 트랜잭션이 등장했다. 트랜잭션은 몇 개의 읽기와 쓰기 작업을 하나의 논리적 단위로 묶는 방법이다.

## 애매모호한 트랜잭션의 개념

많은 관계형 DB들이 트랜잭션을 제공했고, 이후 NoSQL 이 널리 퍼지면서 트랜잭션이 애꿎은 피해를 입었다. 관계형 DB 파는 데이터가 중요하다면
트랜잭션이 반드시 필요하다고 주장했고, NoSQL 파는 확장성을 위해 트랜잭션을 쓰면 안된다고 주장했다. 둘 다 완전히 과장된 말이다.

트랜잭션은 이점과 한계가 분명이 존재하고 이 트레이드 오프를 고려해 시스템에 적용해야 한다.

### ACID 의 의미

트랜잭션의 이점은 보통 ACID 로 알려져 있다.

* Atomicity: 원자성
* Consistency: 일관성
* Isolation: 격리성
* Durability: 지속성

#### 원자성

원자성은 여러 쓰기 작업을 하나의 단위로 묶음으로써 그 중 하나라도 실패하면 abort 되게 한다. 실은 Atomicity 보다는 Abortability 가 더 어울리는 단어다.

#### 일관성

일관성은 애플리케이션 입장에서 바라본 데이터끼리 정합성이 맞는 좋은 상태를 말한다. 즉, 데이터베이스의 영역이 아니다. 실제로 ACID의 C는 약어를 멋지게 만들기 위해 갖다 붙인 것이다.

#### 격리성

격리성은 동시에 실행되는 트랜잭션들은 서로를 방해하지 말아야 한다는 것이다.

여러 클라이언트가 DB에 접속하는 경우 같은 레코드에 동시 접속하는 경우가 생긴다.

1. 클라 A 가 `cnt` + 1을 한다. 값을 읽어보니 42 여서 43이 되었다.
2. 클라 B 가 `cnt` + 1을 한다. 값을 읽어보니 42 여서 43이 되었다.
3. 클라 A 가 `cnt` 를 43으로 기록한다.
4. 클라 B 가 `cnt` 를 43으로 기록한다.

DB는 위와 같이 동시에 접근하는 상황이 벌어졌더라도 트랜잭션이 A, B 가 순차적으로 실행됐을 때의 결과(44)와 동일하도록 보장한다.

#### 지속성

지속성은 DB가 뻗더라도 데이터를 잃어버려선 안된다는 것이다. 그러나 제 아무리 DB라도 하드디스크와 백업(write-ahead log 같은)이 모두 손실되면 복구할 방법은 없다.

### 단일 객체 트랜잭션과 다중 객체 트랜잭션

단일 객체 트랜잭션은 20KB json 데이터를 삽입하는데 10KB 삽입하다 네트워크가 뻗는 경우 어떻게 할래? 를 다루는 문제다. 그러나 보통 우리가 말하는 트랜잭션은
다중 객체 트랜잭션을 의미한다.

많은 분산 DB에서는 다중 객체 트랜잭션을 포기했다. 여러 파티션에 걸쳐서 트랜잭션을 지원하는 것이 너무 까다로웠기 때문이다.

트랜잭션의 핵심 기능은 오류가 생기면 abort 되고 안전하게 retry할 수 있다는 것이다. 그러나 단순히 retry만 하는 것은 완벽한 방법은 아닐 수 있다.
개발자들은 보통 낙관적인 상황만 고려하지만, 다음과 같은 경우도 고려할 줄 알아야 한다. 

* 트랜잭션이 실제로는 성공했지만 DB가 애플리케이션에게 성공을 알리는 도중 네트워크가 끊기는 경우. 중복 제거 알고리즘이 없다면 트랜잭션이 2 번 실행된다.
* 트래픽이 너무 많아서 실패하는 상황인데, 여기저기서 계속 재시도를 하기 때문에 상황이 더욱 악화되는 경우
* 트랜잭션이 side effect(이메일을 보낸다던가) 를 품고 있는 경우 재시도 때마다 side effect가 발생한다.
* 재시도 중에 DB가 죽는 경우 데이터가 손실된다.

## 완화된 격리 수준

격리성을 제공하기 위해 모든 트랜잭션을 줄세워서 직렬로 처리해버리면 성능 손해가 심각하다. 따라서 대부분의 DB 는 어떠한 동시성 이슈로부터는 보호되지만
모든 동시성 이슈를 해결해주지는 않은 완화된 격리 수준을 제공한다.

### 커밋 후 읽기

커밋 후 읽기(Read committed)는 2가지를 보장한다.

* DB에서 읽을 때 커밋된 데이터만 읽는다(dirty read 방지)
  * 내가 보고 있는 데이터가 다른 트랜잭션에서 업데이트가 되고 있는 중이라도, 그 트랜잭션이 커밋되기 전까지는 기존 데이터를 읽는다.
* DB에 쓸 때 커밋된 데이터만 덮어쓴다(dirty write 방지)
  * 같은 레코드를 수정하려고 하는 두 가지 트랜잭션이 있다면, 다른 트랜잭션이 커밋될 때까지 지연시킨다.

이 격리 수준을 구현하기 위해 흔히 DB 들은 락을 사용한다. 특정 레코드를 변경하고 싶다면 먼저 트랜잭션이 해당 레코드에 대한 락을 잡고, 락을 잡지 못한 트랜잭션은 대기하게 된다.

### 스냅숏 격리와 반복 읽기

read committed 격리 수준이 보장되더라도, 이상한 경우가 있다.

1. 나는 A 계좌, B 계좌에 각각 500만원이 있다.
2. A 계좌에서 B 계좌로 100만원을 옮기려고 시도한다.
3. 한 트랜잭션안에서 B 계좌에 있는 잔액을 100만원으로 올린다. 아직 커밋이 이루어지지 않았다.
4. 나는 다시 계좌들을 조회하는데, B 계좌를 조회하고 A 계좌를 조회하는 그 사이에 커밋이 이루어진다.
5. B 계좌에는 과거 데이터는 500만원, A 계좌에는 400만원이 보인다. 마치 100만원이 증발한 것 처럼 보인다.

위와 같은 현상을 비반복 읽기(nonrepeatable read)나 읽기 스큐(read skew)라고 부른다. 위 문제야 다시 새로고침하면 사라질 문제겠지만, 몇 시간이 걸리는
백업을 하게 되거나 분석용 질의 같은 무거운 스캔을 때리는 경우 큰 문제가 될 수 있다.

이 문제를 해결하기 위해 스냅숏 격리(Repeatable Read라고도 불린다)를 사용한다. PostgreSQL, InnoDB 엔진을 쓰는 MySQL 등이 이 방식을 사용하는데,
원리는 간단하다. "write 하는 놈은 read 를 막지 않고, read 하는 놈은 write 를 막지 않는다".

스냅숏 격리를 구현하기 위해 데이터베이스는 객체마다 커밋된 버전 여러 개를 유지한다. 위와 같은 상황이 벌어지더라도 일관된 시점의 DB 상태를 보여주는데, 이를
다중 버전 동시성 제어(Multi-Version Concurrency Control, MVCC)라고 한다. 나중에 어떠한 트랜잭션도 더 이상 예전 버전의 데이터에 접근하지 않는 게 확실해지면
예전 버전을 날리고 새로운 버전을 읽게 한다.

이러한 다중 버전 DB 에서 색인은 어떻게 동작할까? 이건 B-tree 복제나 단순하게는 색인이 모든 버전을 가리키게 함으로써 DB가 알아서 잘 처리해준다.

### 갱신 손실 방지

갱신 손실(update lost) 문제는 애플리케이션이 주로 하는 조회하고, 업데이트 하고, 다시 저장하는(read-modify-write) 경우에 발생할 수 있다. 

앞서 소개한 것처럼 카운트를 증가시키는 것이나, 복잡한 값을 지역적으로 변경하거나, 두 명의 사용자가 같은 페이지를 편집하는 경우다.

이런 흔히 발생할 수 있는 문제를 막기 위해 여러 DB에서는 원자적 갱신 연산을 제공한다. 에를 들어 아래 쿼리는 modify 하나로 끝난다.

```sql
UPDATE counters SET value = value + 1 WHERE key = 'foo';
```

이런 연산들은 보통 exclusive 락을 잡기 때문에, 다른 트랜잭션이 이 객체를 읽지 못한다. 애플리케이션 코드를 작성하면서 read-modify-write 형식의 코드를
짜고 있다면 원자적 연산이 필요하진 않은지 고려해볼 필요가 있겠다.

DB에 내장된 원자적 연산을 쓰지 않더라도, 애플리케이션 레벨에서 갱신할 객체에 대해 명시적으로 락을 걸 수 있다.

```sql
BEGIN TRANSACTION;

SELECT * FROM figures WHERE name = 'robots' AND game_id = 222 FOR UPDATE: // 락을 잡아야 해!! 라는 의미의 FOR UPDATE.

UPDATE figures SET position = 'c4' WHERE id = 1234;

COMMIT;
```

이런 원자적 연산과 잠금은 주기가 순차적으로 실행되도록 강제함으로써 갱신 손실을 방지한다. 그러나 대안으로 이들의 병렬 실행을 허용하고 트랜잭션 관리자가
갱신 손실을 감지하면 트랜잭션을 abort 시키고 read-modify-update 를 재시도하도록 강제하는 방법도 있다.

MySQl/InnoDB는 위와 같은 기능을 지원하진 않지만, Oracle, PostgreSQl, SQL server 등은 위 방법을 지원한다.

### 쓰기 스큐와 팬텀

위에 소개된 dirty write 와 update lost 외에도 미묘한 충돌이 일어나는 경우가 있다.

예를 들어 최소 한 명 이상의 인원이 대기해야 하는 병원이 있다고 해보자.

1. 의사 A, B가 대기를 하고 있었다.
2. 의사 A, B가 둘 다 몸이 안좋아 퇴근하기로 한다.
3. A가 조회를 해보니 A, B가 대기 중이다.
4. B가 조회를 해보니 A, B가 대기 중이다.
5. A, B 가 안심하고 퇴근했더니, 결과적으로 한 명 이상의 인원이 대기해야 한다는 요구사항을 위반했다.

A, B 는 둘 다 자신의 레코드에만 접근했기 때문에, dirty write도, update lost 도 아닌 다른 문제다. 이런 문제를 write skew 라고 한다.
이 문제를 해결하기 위해서는 직렬성 격리(순서대로 트랜잭션이 일어나도록 하는)가 필요하다.

```sql
BEGIN TRANSACTION;

SELECT * FROM doctors WHERE on_call = ture AND shift_id = 1234 FOR UPDATE;

UPDATE doctors WHERE name = 'Alice' AND shift_id = 1234;

COMMIT;
```

위와 같이 락을 잡음으로써 직렬성 격리 수준을 사용한다.

이와 비슷하게 회의실 예약 시스템, 멀티플레이어 게임, 유니크한 사용자명 획득, 이중 사용 방지 등에서 쓰기 스큐를 찾아볼 수 있다.
이 예시들은 비슷한 패턴을 따르는데, 어떤 트랜잭션에서 실행한 쓰기가 다른 트랜잭션의 검색 질의 결과를 바꾼다. 이를 팬텀(phantom)이라고 한다.

의사대기 문제에서의 팬텀은 질의하는 컬럼이 수정하는 컬럼에 있었기 때문에 `FOR UPDATE` 로 락을 획득할 수 있었지만, 질의 결과가 존재하는지 확인하고 레코드를 추가하는
팬텀인 경우에는 `FOR UPDATE` 로 아무것도 잠글 수 없다. 이 경우를 해결하기 위해 인위적으로 DB에 잠금 객체를 추가한 것이 바로 충돌 구체화(materializing conflict)이다.

회의실 예약 문제의 경우 회의실이 특정 시간에 점유중인지 확인하고 미팅을 추가하는 것이 아니라, 15분 길이의 시간 슬롯과 회의실에 대한 테이블을 미리 6개월 치 정도 만들어 놓는다.
그러면 예약하려는 시간 범위에 있는 슬롯으로 잠글 수 있기 때문에 `FOR UPDATE`를 사용할 수 있게 된다.

충돌 구체화는 최후의 수단으로 생각해야 한다. 동시성 제어 메커니즘이 애플리케이션 데이터 모델로 새어나가게 될 뿐만 아니라 이 방법을 찾아내는 것도 어렵고 오류가 발생하기 쉽기 때문이다.

## 직렬성

직렬성 격리는 가장 강력한 격리 수준이다. 여러 트랜잭션이 병렬로 실행되더라도 최종 결과는 동시성 없이 한 번에 하나씩 직렬로 실행될 때와 같도록 보장한다.

오늘날의 DB는 다음 3가지 방법 중 하나를 제공한다.

* 실제적인 직렬 실행: 말 그대로 트랜잭션들을 순차적으로 실행해버린다.
* 2단계 잠금
* 낙관적 동시성 제어: 직렬성 스냅숏 격리

### 실제적인 직렬 실행

동시성 문제를 피하는 가장 간단한 방법은 동시성을 제거하는 것이다.

트랜잭션 코드 전체를 스토어드 프로시저 형태로 데이터베이스에 미리 제출하고 데이터를 메모리에 올린 후 단일 스레드에서 실행한다.
그러나 이거는 하나의 노드에서만 일어나는 경우이고, 만약 복제나 파티셔닝이 되어있다면 상황은 매우 까다로워진다. 모든 파티션에 락을 걸어야 하기 때문이다.

### 2단계 잠금(2PL)

2 Phase lock 은 스냅숏 격리와는 다르게 write 하는 놈이 read 까지 막아버린다. 반면 이로 인해 제공되는 직렬성은 모든 race condition(update lost, write skew) 으로부터 데이터를 보호해준다. 

다만 성능이 구리다는 단점이 있다. 오버헤드가 큰 것은 둘째치더라도 동시성을 제한하기 때문이다. 데드락도 자주 발생한다. 이 때문에 요즘에는 잘 쓰이지 않는다.

### 직렬성 스냅숏 격리(SSI)

실제적인 직렬 실행이 확장성을 못하는 단점이 있고, 2PL 이 성능에 단점이 있다면 직렬성 스냅숏 격리(Serializable snapshot isolation, SSI)는 두 가진 단점을 모두 잡았다.

2PL은 이른바 비관적 락이었는데, SSI는 낙관적 락을 사용한다. 낙관적이기 때문에 의사 대기 문제 같은 경우에 그냥 질의를 병렬로 실행해버리는데,
만약 잘못된 상황이라면(대기 인원이 없어지는 경우) 이를 감지하고 트랜잭션을 abort 시킨다.

* 오래된 MVCC 객체 버전을 읽었는지 감지
* 과거의 읽기에 영향을 미치는 쓰기를 했는지 감지

이름 그대로 스냅숏 격리의 구현 방식을 거의 그대로 따왔다고 볼 수 있다.

