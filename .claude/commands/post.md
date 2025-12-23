---
name: post
description: "블로그 포스트 생성 (카테고리 자동 추론)"
---

# /post - 블로그 포스트 생성

## 사용법
```
/post [제목]
```

## 자동 카테고리 매핑 규칙

제목을 분석하여 카테고리를 자동 추론:

| 패턴 | 카테고리 |
|------|----------|
| "X월 회고" | `[retrospect]` |
| Kotlin, 코루틴 | `[engineering, kotlin, coroutine]` |
| JVM, GC, Garbage | `[JVM, Garbage Collection]` |
| graceful, shutdown, 운영 | `[engineering, operation]` |
| 도메인, 아키텍처, 설계 | `[engineering, architecture]` |
| AI, 파인튜닝, LLM | `[AI, fine-tuning]` |
| 의사결정, 비즈니스 | `[business, decision]` |
| 조직, 리더십, 권력 | `[Leadership, Psychology]` |
| 사고, 문제해결 | `[Thinking, Problem Solving]` |
| 소스코드, 분석 | `[engineering, analysis]` |

## 프로젝트 컨텍스트
- **경로**: `_posts/`
- **파일명**: `YYYY-MM-DD-제목.md`

## Front Matter
```yaml
---
title: {제목}
date: YYYY-MM-DD HH:MM:SS +0900
categories: [{자동 추론된 카테고리}]
tags: [{제목에서 추출한 키워드}]
mermaid: false
math: false
---
```

## 실행 흐름
1. 제목 분석하여 카테고리 자동 추론
2. 추론된 카테고리 사용자에게 확인
3. 오늘 날짜로 파일명 생성
4. `_posts/` 디렉토리에 파일 생성
5. 로컬 서버 실행하여 미리보기 제공

## 로컬 미리보기
포스트 생성 후 자동으로 Jekyll 서버 실행:
```bash
bundle exec jekyll s
```

- **URL**: http://localhost:4000
- 서버는 백그라운드로 실행됨
- 기존 서버가 실행 중이면 새로 띄우지 않음
- 종료: `Ctrl+C` 또는 터미널에서 프로세스 종료

## 예시
```
/post "2025년 7월 회고"
→ categories: [retrospect]

/post "Redis Cluster는 어떻게 동작할까"
→ categories: [engineering, redis]

/post "팀을 이끄는 리더의 자세"
→ categories: [Leadership, Psychology]
```
