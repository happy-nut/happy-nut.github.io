---
title: 6장. 파티셔닝
date: 2022-05-07
slug: "/books/ddia/6"
tags:
- 책
- 아키택처
- 프로그래밍
- 분산시스템
- 시스템디자인
---

[![](https://dataintensive.net/images/map-ch3.jpg)](https://dataintensive.net/poster.html)

데이터셋이 매우 크거나 질의 처리량이 매우 높다면 복제만으로는 부족해 파티션으로 쪼갤(샤딩) 필요가 있다.

## 파티셔닝과 복제

보통 복제와 파티셔닝은 함께 적용되어 각 파티션의 복사본을 여러 노드에 저장한다. 예를 들면 다음과 같다.

```

노드 1
- 파티션 1 Master
- 파티션 2 Slave
- 파티션 3 Slave

노드 2
- 파티션 2 Master
- 파티션 1 Slave
- 파티션 3 Slave

노드 3
- 파티션 3 Master
- 파티션 1 Slave
- 파티션 2 Slave
```

## 키-값 데이터 파티셔닝

그럼 파티셔닝은 어떻게 할까? 어떤 레코드를 어떤 노드에 저장할지에 대한 규칙이 있어야 한다. 이 규칙이 엉망이라 파티셔닝이 고루 이루어지지 않는다면
트래픽이나 데이터가 쏠리게(skewed) 된다. 이 때 불규형하게 부하가 높은 파티션을 핫스팟이라 한다.

핫스팟을 피하려면 키 범위 기준으로 파티셔닝 하거나, 키의 해시값 기준 으로 파티셔닝을 하는 방법이 있다.

> 무작위로 파티셔닝을 하면 데이터가 고루 퍼져서 핫스팟을 쉽게 회피할 수 있지만, 병렬로 모든 파티션을 조회해야 하는 극혐 상황이 펼쳐진다. 

### 키 범위 기준 파티셔닝

백과사전처럼 알파벳순으로 키를 늘어놓고 파티셔닝 하는 방법이다. 그러나 a 로 시작하는 단어가 z 로 시작하는 단어보다 훨씬 많을 테니 고르게 분산이 되지 않아
핫스팟을 유발한다. 키가 timestamp 여도 역시 비슷한 문제가 발생할 수 있다.

### 키의 해시값 기준 파티셔닝

위에서 핫스팟을 피하기 위해 고민하다 나온 것이 해시 함수다. 서로 비슷해보이는 입력을 주더라도 해시 함수를 통해 고루 분산시킬 수 있다. 
그러나 이 경우 키 범위 기준 파티셔닝에 비해 범위 질의를 효율적으로 실행할 수 있는 능력을 상실한다. 인접했던 키가 흩어졌으니 당연한 일이다.

카산드라 같은 경우 두 전략 사이에서 타협했는데, 복합 기본키를 지정한다. 키의 첫 부분에만 해싱을 적용해 파티션 결정에 사용하고 남은 칼럼은 SS 테이블 안에서
데이터를 정렬하는 색인으로 쓴다. 이 경우 해시용 컬럼은 범위 질의를 못하지만, 남은 칼럼은 가능해진다. 
예를 들어 기본키를 (`user_id`, `update_timestamp`)로 지정한다면 특정한 사용자가 어떤 구간에서 수정한 모든 문서를 timestamp 순으로 정렬해서 쉽게
읽어올 수 있다.

### 쏠린 작업부하와 핫스팟 완화

해시 파티셔닝으로 핫스팟을 회피하더라도, 항상 동일한 키에 대해서 읽고 쓰기가 발생하는 극단적인 상황에서는 모든 요청이 동일한 파티션으로 쏠리게 된다.
예를 들면 SNS 에서 수백만 명의 팔로워를 거느린 인플루언서가 어떤 행동을 하는 경우다.

이 경우는 사실 애플리케이션 레벨에서 이 쏠림을 완화해야 한다. 한 가지 방법은, 이런 요청이 매우 많이 쏠리는 키의 시작이나 끝에 임의의 숫자를 붙이는 것이다.
그럼 해시값이 달라지므로 파티셔닝에 고루 퍼지게 되지만, 읽기를 수행할 때는 퍼져있는 이 모든 데이터를 다시 다 긁어와서 조합해야 하는 단점이 생긴다.

## 파티셔닝과 보조 색인

위에 나왔던 내용들은 사실 키-값 데이터 파티셔닝 모델에 의존한다. 레코드를 기본 키로만 접근한다고 가정했다. 그러나 보조 색인이 연관되면 꽤 난감해진다.
보조 색인은 보통 레코드를 유일하게 식별하는 용도가 아니라 특정한 값이 발생한 항목을 검색하는 수단이기 때문이다. 예를 들면 사용자 123이 실행한 액션을 모두 찾거나
hello 라는 단어가 포함되는 글을 모두 찾거나 빨간색 자동차를 모두 찾는 작업 등에 쓰인다.

이런 보조 색인이 있는 데이터베이스를 파티셔닝하기 위해 문서 기반, 용어 기반 파티셔닝을 사용한다.

### 문서 기반 보조 색인 파티셔닝

기본 키가 `car_id`, 이고 보조 색인이 `car_color` 라고 해보자. 각 파티션 별로 기본키 색인과 보조 색인을 가지게 된다.

```
========== 파티션 0 ==========
- 기본키 색인
   111 - [red, 'honda']
   222 - [red, 'volvo']
   333 - [blue, 'ford']
- 보조 색인
   red - [111, 222]
   blue = [333]

========== 파티션 1 ==========
- 기본키 색인
   444 - [silver, 'audi']
   555 - [red, 'dodge]']
- 보조 색인
   silver - [444]
   red - [555]
```

이런 문서 기반 파티셔닝은 위와 같이 파티션 별로 개별 동작을 하기 때문에, local index(지역 색인) 라고도 한다. 개별 동작한다는 것의 의미는, 
모든 파티션에 질의를 보내서 얻은 결과를 모두 모아야함을 의미한다. 이를 스캐터/개더(scatter/gather)라고 하는데 이 작업은 당연스럽게도 비용이 크다.
하지만 그럼에도 불구하고 보조 색인을 분서 기반으로 파티셔닝하는 경우가 많다. Mongo DB, 리악, 카산드라, 엘라스틱 서치 등은 모두 문서 기반 파티셔닝 보조 색인을 사용한다.

### 용어 기반 보조 색인 파티셔닝

위 방법에서 local index 를 만들었다면, global index(전역 색인)을 만드는 방법이 용어 기반 보조 색인 파티셔닝이다.

```
========== 파티션 0 ==========
- 기본키 색인
   111 - [red, 'honda']
   222 - [red, 'volvo']
   333 - [blue, 'ford']
- 보조 색인
   red - [111, 222, 555]
   blue = [333]

========== 파티션 1 ==========
- 기본키 색인
   444 - [silver, 'audi']
   555 - [red, 'dodge]']
- 보조 색인
   silver - [444]
```

보조 색인의 용어 키는 위와 같이 모든 파티션이 복제해서 똑같이 나눠갖는 것이 아니라, 똑같이 파티셔닝되어 파티션 0 이 `red`, `blue` 를, 파티션 1 이 `silver`를
갖게 된다. 이 방식은 local index 와는 정반대로 읽기가 쉽지만 쓰기가 복잡해진다. 동시 수정을 막기 위해 모든 파티션에 걸쳐 분산 트랜잭션이 실행되어야 하기 때문이다.
이 분산 트랜잭션은 모든 DB에서 지원되지 않기 때문에 보통은 비동기로 갱신한다. 

## 파티션 리벨런싱

데이터와 질의 요청이 다른 노드로 옮겨져야 하는 경우가 있는데, 이 과정을 **rebalancing** 이라고 한다. 어떻게 해야 리벨런싱 도중에 DB 읽기 쓰기가 가능하고, 후에도 부하가 균등하게 분산되고, 또 
이 과정 자체가 빨리 실행되어지게 할 수 있을까?

### 리벨런싱 전략

첫 번째 방법은 파티션 개수를 고정하는 방법이다.

이 방법에서는 한 노드가 파티션을 여러개 가지고 있다가 새로운 노드가 추가되면 그 노드에 기존 노드들이 자신이 가지고 있던 파티션을 나누어주고, 기존 노드가 빠지게 되면
그 반대로 파티션을 도로 가져오는 방식이다. 이 방식을 사용하게 되면 파티션이 새로 할당되는 동안 네트워크를 통해 대량의 데이터를 전송해야 하므로 그 동안에는 기존 파티션에 요청이 가도록 해야 한다.

이 방식을 사용하려면 DB가 처음 구축될 때부터 파티션 개수가 고정되고 이후에 변하지 않아야 한다. 따라서 처음에 파티션 수를 충분히 크게 잘 잡아야 하는데, 너무 크면 또 오버헤드가 커지는 역효과를 낳는다.

두 번째 방법은 파티션의 개수를 동적으로 변경하는 방법(동적 파티셔닝)이다.

DB가 처음 구축될 때부터 파티션 개수가 고정되어 버리면, 키 범위 기준으로 파티셔닝되는 경우 핫스팟이 생길 염려가 있다. 이 방식을 사용하게 되면
파티션이 일정 크기를 넘으면 반으로 갈라 파티션을 나누고, 반대로 너무 적으면 인접한 파티션과 합친다. 동적 파티셔닝은 키 범위 파티셔닝 외에 해시 파티셔닝에도 똑같이 사용될 수 있다.

몽고 DB는 2.4 부터 키 범위 파티셔닝과 해시 파티셔닝을 모두 지원하고, 두 경우 모두 동적 파티셔닝을 사용한다.

세 번째 방법은 노드 비레 파티셔닝을 하는 방법이다.

말 그대로 노드의 개수에 비례해 파티션의 개수를 결정하는 방식이다. 새 노드가 클러스터에 추가되면 고정된 개수의 파티션을 무작위로 선택해 분할하고 각 분할된 파티션의 절반을
새 노드에 할당한다. 이 방식을 쓰면 개별 파티션 크기도 상당히 안정적으로 유지된다. 카산드라가 이 방법을 사용한다.

### 운영: 자동 리벨런싱과 수동 리벨런싱

자동 리벨런싱은 예측하기 어려워서, 사람이 수동으로 하는 게 더 좋을 수도 있다. 예를 들어 자동 장애 감지 시스템과 조합되면 노드 한 대가 뻗었을 때
그 노드에 있는 데이터셋을 자동으로 리벨런싱하게 되면서 네트워크 과부화가 생기고, 이로 인해 연쇄 장애가 발생할 수 있다.

## 요청 라우팅

요청을 받았을 때 어떤 노드에 라우팅을 해야 할까? 여기엔 여러가지 방법이 있다.

1. 일단 아무 노드나 요청을 받고, 자기한테 데이터가 없으면 다른 노드에게 토스한다.

2. 라우팅 계층을 두어 처리할 노드를 알아내고 요청을 라우팅한다.

3. 클라이언트가 이미 어떤 노드에 할당됐는지를 알고 있게 한다.

카산드라는 1번 방법을 쓴다.

ZooKeeper 같은 코디네이션 서비스를 사용하면 각 노드가 주키퍼에 자신을 등록하고 파티션과 노드 사이의 할당 정보를 관리한다. 이를 통해 2번의 라우팅 계층이나
3번의 클라이언트가 이 정보를 구독하여 사용할 수 있다.

### 병렬 질의 실행

분석용으로 사용되는 대규모 병렬 처리는 어떡할까. join, filtering, grouping, aggregation 연산을 포함하는 이런 처리는 쿼리 최적화기가 각
파티션에서 병렬로 실행되도록 쿼리를 분해한다.
