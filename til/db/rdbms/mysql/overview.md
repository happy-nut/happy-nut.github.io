# MySQL

대표적인 RDBMS 중 하나.
8.3 버전부터 InnoDB 스토리지 엔진이 기본으로 사용되며, 트랜잭션을 지원한다.

database안에 여러 schema를 만드는 여타 RDBMS 와 다르게, schema와 database 를 동일한 개념으로 취급한다.

## InnoDB 스토리지 엔진

기본 키를 기반으로 하는 일반 쿼리에 대한 I/O를 줄이기 위해 클러스터형 인덱스에 사용자의 데이터를 저장한다.

