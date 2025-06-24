# Dirty Read

Dirty Read는 커밋되지 않은 데이터를 읽는 경우를 말한다.

1. T1 이 A를 업데이트하고 커밋하기 전에 T2가 A를 읽었다.
2. T1이 롤백된다면 T2가 읽은 값은 dirty 값이 된다.
