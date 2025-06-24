# Write Skew

두 트랜잭션이 서로 다른 레코드를 수정하지만 비즈니스 제약 조선을 위반하는 현상이다.
매우 교묘해서 실제로 발견하기가 상당히 까다롭다.

1. T1, T2가 각각 A를 읽음
2. 각자 서로 다른 행을 수정함(충돌 없음)
3. 하지만 전체적인 비즈니스 규칙 위반


## 테스트

아주 고전적인 의사 당직 문제.

```sql
-- 제약 조건: 최소 1명의 의사가 항상 근무해야 함
-- 현재 상황: Alice와 Bob 둘 다 근무 중

-- 트랜잭션 A (Alice가 퇴근 요청)
BEGIN;
SELECT COUNT(*) FROM doctors WHERE on_duty = true; -- 2명 (Alice, Bob)
-- "2명이니까 내가 나가도 1명 남네"
UPDATE doctors SET on_duty = false WHERE name = 'Alice';
COMMIT;

-- 트랜잭션 B (Bob이 퇴근 요청) - 동시 실행
BEGIN;
SELECT COUNT(*) FROM doctors WHERE on_duty = true; -- 2명 (Alice, Bob)
-- "2명이니까 내가 나가도 1명 남네"  
UPDATE doctors SET on_duty = false WHERE name = 'Bob';

-- 이 시점에서 Alice와 Bob 모두 퇴근했으므로, 실제로는 0명이 근무 중임
COMMIT;
```


## 해결 방법

Write Skew 는 무려 Repeatable Read 격리 수준에서도 발생할 수 있다.

- 격리 레벨 상승: Serializable 격리 수준을 사용하면 Write Skew를 방지할 수 있다. 그러나 실무에서 이건 좀...
- 명시적 락 사용: `SELECT ... FOR UPDATE` 구문을 사용하여 트랜잭션이 데이터를 읽는 동안 다른 트랜잭션이 해당 데이터를 수정하지 못하도록 한다.
