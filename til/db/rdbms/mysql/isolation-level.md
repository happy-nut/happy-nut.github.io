# Mysql Isolation Level

Mysql 은 `REPEATABLE READ` 가 default 격리 레벨이다. 이유는 모르겠다. 실무에선 `READ COMMITTED` 가 더 많이 사용되는 것 같은데.

## READ UNCOMMITTED

발생 가능한 문제들은 다음과 같다.

- [Dirty Read](../isolation-level/problems/dirty-read.md)
- [Non-Repeatable Read](../isolation-level/problems/non-repeatable-read.md)
- [Phantom Read](../isolation-level/problems/phantom-read.md)
- [Lost Update](../isolation-level/problems/lost-update.md)
- [Read Skew](../isolation-level/problems/read-skew.md)
- [Write Skew](../isolation-level/problems/write-skew.md)

## READ COMMITTED

발생 가능한 문제들은 다음과 같다.

- [Non-Repeatable Read](../isolation-level/problems/non-repeatable-read.md)
- [Phantom Read](../isolation-level/problems/phantom-read.md)
- [Lost Update(부분적)](../isolation-level/problems/lost-update.md)
- [Read Skew](../isolation-level/problems/read-skew.md)
- [Write Skew](../isolation-level/problems/write-skew.md)

## REPEATABLE READ

발생 가능한 문제들은 다음과 같다.

- [Write Skew](../isolation-level/problems/write-skew.md)
- [Lost Update (극히 드물게, 특수 상황에서만)](../isolation-level/problems/lost-update.md)

## SERIALIZABLE

동시성 문제가 생기지 않는다.

