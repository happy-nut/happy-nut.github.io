# Read Skew

여러 관련된 데이터를 읽는 동안 일부만 다른 트랜잭션에 의해 변경되어 전체적인 일관성이 깨지는 문제.

1. T1이 A와 B를 읽고, 아직 트랜잭션은 끝나지 않은 상황.
2. T2가 A를 업데이트하고 커밋했다.
3. T1이 B를 읽었는데, A의 값이 변경되어 B의 값이 달라졌다.

[Non-repeatable read](non-repeatable-read)와의 차이점은 대상이 레코드 단 건이냐, 여러 건이냐에 있다.

## 테스트

격리 수준이 READ COMMITTED 이하여야 함

```sql
-- 세션 1
BEGIN;
SELECT balance FROM account WHERE id = 'A'; -- 700원

-- 세션 2에서 A→B 이체
-- UPDATE account SET balance = 400 WHERE id = 'A';
-- UPDATE account SET balance = 600 WHERE id = 'B';

SELECT balance FROM account WHERE id = 'B'; -- 600원 또는 300원
-- READ COMMITTED: 600원 (Read Skew 발생)
-- REPEATABLE READ: 300원 (방지됨)
COMMIT;
```

## 해결 방법

- 격리 레벨 상승
  - Repeatable Read 이상의 격리 레벨을 사용하면 해결할 수 있다.
- 명시적 락 사용
  - `SELECT ... FOR UPDATE` (혹은 `FOR SHARE`) 구문을 사용하여 트랜잭션이 데이터를 읽는 동안 다른 트랜잭션이 해당 데이터를 수정하지 못하도록 한다.
  - 이 부분이 [Phantom Read](phantom-read.md)와 가장 극명하게 차이나는 부분임.
- 일괄 조회
  - 나중에 다시 조회하는 것이 문제를 일으키므로, 관련된 데이터를 한 번에 조회하여 트랜잭션이 시작될 때의 상태를 유지한다.

