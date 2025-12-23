---
name: til
description: "TIL 문서 생성 (카테고리 자동 추론)"
---

# /til - TIL 문서 생성

## 사용법
```
/til [제목]
```

## 자동 카테고리 매핑 규칙

제목을 분석하여 경로 자동 추론:

| 키워드 | 경로 |
|--------|------|
| HashMap, B-tree, 자료구조 | `til/cs/data-structure/` |
| Java, JVM, GC, JDBC | `til/cs/language/java/` |
| Linux, 파일, 프로세스, 스케줄링 | `til/cs/os/` |
| MySQL, 락, 트랜잭션, 인덱스 | `til/db/rdbms/mysql/` |
| Redis, 캐시, 만료 | `til/db/nosql/key-value/redis/` |
| Kafka, 컨슈머, 프로듀서 | `til/messaging/kafka/` |
| 네트워크, VRRP, TCP | `til/infra/network/` |
| 클린 아키텍처, 디자인 패턴 | `til/coding/` |
| 트러블슈팅, 해결, 에러, 버그 | `til/troubleshooting/` (날짜 prefix) |

## 카테고리 구조
```
til/
├── coding/
├── cs/data-structure/, cs/language/java/, cs/os/
├── db/rdbms/mysql/, db/nosql/key-value/redis/
├── infra/network/
├── messaging/kafka/
└── troubleshooting/
```

## Front Matter
```yaml
---
title: {제목}
date: YYYY-MM-DD HH:MM:SS +0900
---
```

## 실행 흐름
1. 제목 분석하여 경로 자동 추론
2. 추론된 경로 사용자에게 확인
3. 파일명 생성 (troubleshooting은 날짜 prefix)
4. 해당 디렉토리에 파일 생성

## 예시
```
/til "HashMap의 resize 동작"
→ til/cs/data-structure/hashmap-resize.md

/til "Kafka 리밸런싱 문제 해결"
→ til/troubleshooting/2025-07-15-kafka-rebalancing.md

/til "MySQL 데드락 분석"
→ til/db/rdbms/mysql/deadlock.md
```
