# Phantom Read

Phantom Read는 같은 트랜잭션 내에서 같은 쿼리를 실행했을 때, 다른 트랜잭션에 의해 새로운 데이터가 추가/삭제되어 결과가 달라지는 경우를 말한다.

1. T1이 통계(size 등)를 쿼리했고 아직 트랜잭션은 끝나지 않은 상황.
2. T2가 통계에 해당하는 A를 삽입하고 커밋했다.
3. T1이 통계값이 필요해져서 같은 조건으로 다시 읽었는데, 결과가 달라졌다.

Phantom Read는 [Non-Repeatable Read](non-repeatable-read.md)와 유사하지만, Non-Repeatable Read는 같은 레코드에 대한 변경이 발생하는 반면,
Phantom Read는 새로운 레코드가 추가되거나 삭제되어 쿼리 결과가 달라지는 상황이다.

## 테스트

격리 수준이 READ COMMITTED 이하여야 함

```sql
BEGIN;

-- 1단계: 고액 주문 개수 확인
SELECT COUNT(*) as high_value_orders 
FROM orders 
WHERE customer_id = 100 AND amount > 1000;
-- 결과: 1건

-- 세션 2에서 새로운 고객 주문 추가
-- BEGIN;
-- INSERT INTO orders (customer_id, amount, order_date)
-- VALUES (100, 1500.00, '2024-06-04');
-- COMMIT;

SELECT COUNT(*) as high_value_orders
FROM orders
WHERE customer_id = 100 AND amount > 1000;
-- 결과: 2건! (Phantom Read 발생)
COMMIT;
```

## 해결 방법

- 격리 레벨 상승
  - Repeatable Read 이상의 격리 레벨을 사용하면 해결할 수 있다.
- 명시적 락 사용
  - `SELECT ... FOR UPDATE` 구문을 사용하여 Gap lock 을 걸고, 트랜잭션이 데이터를 읽는 동안 다른 트랜잭션이 해당 데이터를 수정하지 못하도록 한다.
  - `FOR SHARE`든, `FOR UPDATE`든 레코드 락으로는 Phantom Read를 방지할 수 없다. 이미 존재하는 레코드에 대한 잠금만을 제공하기 때문이다.

