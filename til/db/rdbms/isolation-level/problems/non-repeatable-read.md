# Non-Repeatable Read

Non-Repeatable Read는 같은 트랜잭션 내에서 같은 데이터를 읽었을 때, 다른 트랜잭션에 의해 데이터가 변경되어 다른 값을 읽는 경우를 말한다.

1. T1이 A를 읽고 아직 트랜잭션은 끝나지 않은 상황.
2. T2가 A를 업데이트 하고 커밋했다.
3. T1이 A값이 다시 필요해져서 읽었는데, 값이 달라졌다.

## 테스트 방법

격리 수준이 READ COMMITTED 이하여야 함.

```sql
-- 세션 1
BEGIN;
SELECT balance FROM account WHERE id = 'A'; -- 1000원

-- 세션 2에서 계좌 A 수정
-- UPDATE account SET balance = 800 WHERE id = 'A';

SELECT balance FROM account WHERE id = 'A'; -- 800원 또는 1000원
-- READ COMMITTED: 800원 (Non-repeatable Read 발생)
-- REPEATABLE READ: 1000원 (방지됨)
COMMIT;
```
