## 캐시 관련 문제 상황 별 대응 방안

- Cache stampede: 동시에 대량의 키가 만료되면 DB에 요청이 몰려 과부하가 발생함
  - 이를 막기 위해 Jitter 로 만료 시간을 분산함
- Cache penetration: DB에 없는 값을 조회할 경우 보통, 캐시를 갱신하지 않는데 이 요청이 너무 많으면 DB에 과부하가 발생함
  - 이를 막기 위해 Null object pattern을 사용해 ‘값이 없음’ 자체를 캐싱함
- Cache system 장애: redis장애 시 DB로 요청이 몰려 과부하가 발생함
  - 반드시 동작해야 하는 핵심 기능을 제외하고 부가 기능은 운영을 잠시 중단하는 게 나음
  - 캐시 시스템이 복구되는 동안 DB 로 버티는 수밖에 없음
- Hot key expiration: 많은 요청이 집중되는 hot key가 만료되는 경우, DB로 요청이 몰려 과부하가 발생함
  - 분산 락을 사용해 DB에 접근하는 요청 스레드를 제한하거나
  - 만료 없이 캐시 값을 다시 계산하여 덮어쓰기 함
- Cache query 가 몰리는 경우: Redis 과부하로 이어질 수 있음
  - Local Cache 에 cache 데이터를 가져와 저장 후 cache miss 시 redis 조회
  - 이벤트 기반 (Redis pub/sub) 을 통해 최신 데이터 반영
- 캐시를 쓰는 데도 너무 값이 자주 바뀌어 DB 요청량 자체가 너무 많은 경우 DB 과부하가 발생함
  - Write-behind 캐싱을 사용함(먼저 redis 에 기록 후 백그라운드에서 DB로 동기화)
