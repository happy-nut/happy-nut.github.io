# MySQL Lock

MySQL 에서는 Row-Level Lock과 Table-Level Lock을 지원한다.

## Row-Level Lock

Row-Level Lock 은 개별적인 레코드(들)에 걸리는 락으로 Record Lock, Gap Lock, Next-Key Lock 세 가지가 존재한다.

### Record Lock

`FOR UPDATE` 나 `FOR SHARE` 구문을 사용하여 특정 행에 거는 락이다. 모든 격리 수준에서 사용이 가능하다.

```sql
-- 특정 행에 걸리는 락
UPDATE orders SET amount = 1000 WHERE id = 1;
-- id=1인 행에만 X-lock 설정

SELECT * FROM orders WHERE id = 1 FOR UPDATE;
-- id=1인 행에 X-lock

SELECT * FROM orders WHERE id = 1 FOR SHARE;  
-- id=1인 행에 S-lock (MySQL 8.0+)
```

### Gap Lock

Gap Lock은 REPEATABLE READ 격리 수준 이상에서만 활성화 된다.
여기서 Gap 이란 범위 조건 사이의 레코드가 없는 빈 공간을 의미하며, Gap Lock 그 안으로 신규 데이터가 들어오는 것을 막는다.

```sql
-- 범위 사이의 "빈 공간"을 보호
SELECT * FROM orders WHERE id BETWEEN 10 AND 20 FOR UPDATE;
-- id 10~20 사이의 모든 gap을 락

-- 예시: 현재 id=15만 존재한다면
-- Gap1: (10, 15), Gap2: (15, 20) 모두 락
-- 다른 트랜잭션이 id=12, 17 등을 INSERT 할 수 없음
```

Gap Lock 강력한 일관성을 제공하는 대신 INSERT 성능에 큰 영향을 주기 때문에, 실무에선 REPEATABLE READ 를 포기하게 만드는 원인이기도 하다.


###  Next-Key Lock

Record Lock + Gap Lock 조합을 Next-Key Lock 이라고 한다. 이름이 너무 비직관적이라 매번 까먹기 일쑤다.
Gap Lock 을 포함하기 때문에 Next-Key Lock 역시 REPEATABLE READ 격리 수준 이상에서만 활성화 된다.
왜 이름에 Next 가 붙었냐면, `id >= 5` 와 같이 처음이나 끝이 정해지지 않은 범위에 대해 보호를 할 때 [B+Tree](../../../cs/data-structure/b%2Btree.md) 인덱스 스캔 방향으로 Next 를 쭉 타고 가면서 빈 공간 갭을 보호하기 때문이다.

```sql
-- REPEATABLE READ에서 기본 동작

-- 현재 테이블: id = 1, 5, 10이 존재
SELECT * FROM orders WHERE id >= 5 FOR UPDATE;

-- 락 범위:
-- Record Lock: id=5, id=10
-- Gap Lock: (5,10), (10, +∞)
-- 결과: id=6,7,8,9 INSERT 불가, id=11,12,... INSERT 불가
```

## Table-Level Lock

테이블 레벨 락은 테이블 전체에 걸리는 락으로, InnoDB 같은 스토리지 엔진에서 걸어버리는 Intention Lock 과 명시적 테이블 락이 있다.

### Intention Lock

AUTO_INCREMENT, DELETE, INSERT, UPDATE 등 DML 작업을 수행할 때 InnoDB 스토리지 엔진이 자동으로 걸어주는 락이다.
모든 DML 작업에서 Intention Lock 이 매번 걸리는 데 체감을 못했던 이유는 그만큼 최적화가 잘 되어 있기 때문이다. 

### 명시적 테이블 락

DBA 가 아니고서야 실무에서 쓸 일은 별로 없을 것 같다.

```sql
LOCK TABLES orders READ;     -- 테이블 전체 S-lock
LOCK TABLES orders WRITE;    -- 테이블 전체 X-lock
UNLOCK TABLES;
```
