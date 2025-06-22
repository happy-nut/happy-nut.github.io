# Memory fragmentation

사용자들의 데이터들은 순서대로 생기고 삭제되는 것이 아니니, RAM과 쓰고 지우는 과정에서 메모리 단편화(memory fragmentation)가 발생한다.
이를 해결하기 위해 Defragmentation 이라는 과정을 거치는데, Redis는 원자성을 보장하기 위해 이를 main thread 에서 수행한다.
[key-expiration.md](key-expiration.md) 에서 다룬 expiration active way 와 비슷하게, 클라이언트 요청을 처리하는 과정에서 틈날 때마다
트리거 되는 방식이다.
이것은 JVM 의 GC 에서 발생하는 STW 가 없어도 되는 이유이기도 하다.

동작 과정은 아주 간단하게만 보면 다음과 같다.

- 키를 순회하면서 Jemalloc 으로 run util(특정 공간을 얼마나 잘 사용하고 있나) 를 측정
- 그 값이 평균 이하라면 새로운 공간으로 메모리를 복사하고 포인터를 복사함(단, 너무 큰 객체는 피함)
- 이 과정을 통해 사용률이 낮은 run 에서 사용률이 높은 run 으로 메모리가 집약되어 단편화가 해소됨

redis 의 main thread 에서 수행되는 연산들은 클라이언트의 요청을 제외하고는 수행 시간에 제한을 갖는다.
따라서 이 defragmentation 작업도 25ms 를 초과하지 않도록 제한된다.
