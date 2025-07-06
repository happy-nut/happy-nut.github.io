# MySQL undo log

MySQL의 Undo Log 는 트랜잭션 롤백(Roll Backward)를 위해 사용되는 로그이다.
ACID의 A(Atomicity)와 I(Isolation)를 보장하기 위해 사용되는 것으로,
작업 단위가 전체가 적용되거나 혹은 아무것도 적용되지 않는 것을 보장하기 위함인 것으로 이해하면 된다.

MVCC에서는 기본적으로 하나의 레코드에 대해 여러 버전의 스냅샷을 간직하게 되는데, 
이 undo log 에서는 최종적으로 커밋이 되기 전의 물리적 상태(쿼리가 아닌 실 데이터)를 디스크에 저장하고 있다.
(undo log 는 기본적으로 디스크에 저장된다고 보면 되나, 캐싱을 위해 메모리에 올려둔다)

예를 들어, 다음과 같은 쿼리가 있다고 해보자.

```sql
BEGIN;
insert into test_table values (1, 'original');
COMMIT;
```

이 때 `COMMIT` 전이라면 undo log 에는 PK(=1)와 INSERT_UNDO 타입의 로그가 생성된다.
`COMMIT` 이후에는 해당 undo log 가 삭제되지만, 만약 그 전에 롤백된다면 undo log 가 실행되어 PK(=1) 레코드가 제거 된다.
 
데이터에 대한 변경이 다음과 같이 일어난다고 해보자.

```sql
BEGIN;
update test_table set name = 'changed' where id = 1;
COMMIT;
```

이 때 undo log 에는 PK(=1)와 'original' 이라는 값을 가진 UPDATE_UNDO 타입의 로그가 생성된다.
만약 이 트랜잭션이 롤백된다면 undo log 가 실행되어 `name` 컬럼이 'original'로 되돌아가게 된다.

## Undo log 와 MVCC

undo log 는 트랜잭션을 롤백하기 위함이기도 하지만, MVCC(Multi Version Concurrency Control)에서 동시성 문제를 해결하기 위해서도 사용된다.
이름 중 Multi Version 이란 데이터 레코드마다 여러 버전의 버전(스냅샷)을 가지게 됨을 의미한다.

트랜잭션이 데이터를 읽을 때 undo log 에서 자신의 트랜잭션 id 보다 높은 변경사항은 볼 수 없으므로, 초과 직전의 id 값을 바라보고 읽게 된다.
따라서 락을 통해 레코드에 변경이 완료된 다음에 읽는 것이 아니라 동일한 레코드에 대해 동시에 다른 트랜잭션들이 값을 읽어갈 수 있도록 허용할 수 있게 되는 것이다.

아래와 같이 동시에 같은 레코드에 접근하는 경합을 떠올려 보자.
```sql
-- 세션 A (긴 읽기 트랜잭션)
BEGIN;
SELECT name FROM test_table WHERE id = 1;

-- 세션 B (쓰기 트랜잭션)
BEGIN;
UPDATE test_table SET name = 'changed-by-B' WHERE id = 1;
COMMIT;

-- 세션 A (같은 트랜잭션에서 재조회)
SELECT name FROM test_table WHERE id = 1;  -- 여전히 'original'
-- Undo Log에서 자신의 스냅샷 버전을 읽음
COMMIT;
```
물론 [격리 수준](isolation-level.md)에 따라 undo log 에서 'original'을 읽을 수도 있고 세션 A가 'changed-by-B'를 읽을 수도 있다.
중요한 것은 트랜잭션이 롤백/커밋되지 않는 한 언두로그로 이전 상태의 데이터를 모두 관리하고 있기 때문에,
격리 수준에 따라 적절하게 동작하는 높은 동시성 수준을 가질 수 있게 되는 것이다.

참고로, 'READ COMMITTED' 격리 수준에서는 격리 수준 중 유일하게 스냅샷이 없어도 된다. 커밋되지 않아도 읽어가기 때문에 최종본만 유지하면 되기 떄문이다.

다만 MVCC가 있더라도, 아래와 같은 write-write 경합의 경우에는 여전히 lock 이 필요하다.

```sql
-- 세션 A
BEGIN;
update test_table set name = 'changed-by-A' where id = 1;

-- 세션 B
BEGIN;
update test_table set name = 'changed-by-B' where id = 1;
COMMIT;

-- 세션 A
COMMIT;
```

MVCC 가 해주는 동시성 제어는 다음 3가지 경우에 한하기 때문이다.

- 읽기가 다른 읽기를 블록하지 않음
- 읽기가 쓰기를 블록하지 않음
- 쓰기가 읽기를 블록하지 않음

