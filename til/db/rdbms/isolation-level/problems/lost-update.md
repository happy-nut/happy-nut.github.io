# Lost Update

Read-Modify-Write 를 같은 레코드에 대해 두 트랜잭션이 수행될 때 발생한다.

1. T1이 A를 읽고, T2가 A를 읽었다.
2. T1이 A를 업데이트 & 커밋하고, T2가 A를 업데이트 & 커밋했다.
3. T1이 갱신한 A는 손실되었다.

[Dirty Write](dirty-write.md)와 다르게, 실무에서 자주 발생하는 문제이다.


## 테스트

격리 수준이 READ COMMITTED 이하여야 함

```sql
-- Lost Update (같은 행 수정)
-- 트랜잭션 A
UPDATE account SET balance = balance + 100 WHERE id = 1;

-- 트랜잭션 B  
UPDATE account SET balance = balance - 50 WHERE id = 1;

-- 트랜잭션 A가 먼저 커밋되면, 트랜잭션 B는 A의 변경 사항을 반영하지 못하고, 트랜잭션 B가 커밋되면 A의 변경 사항이 손실된다.
```
