---
name: new-post
description: "블로그 포스트 생성 (초안용)"
---

# /new-post - 블로그 포스트 생성

## 사용법
```
/new-post
```

## 실행 흐름
1. 오늘 날짜로 파일명 생성: `YYYY-MM-DD-draft.md`
2. `_posts/` 디렉토리에 파일 생성
3. 제목/카테고리/태그는 비워둠 (추후 `/refine`에서 자동 추론)
4. 제목 묻지 말고 바로 파일 생성

## Front Matter
```yaml
---
title: ""
date: YYYY-MM-DD HH:MM:SS +0900
categories: []
tags: []
mermaid: false
math: false
---
```

## 예시
```
/new-post
→ _posts/2026-01-03-draft.md 생성
→ 제목/카테고리/태그는 비워둔 상태
→ 초안 작성 후 /refine 으로 다듬기
```

## 다음 단계
초안 작성 완료 후 `/refine` 실행하면:
- 제목 자동 생성
- 글을 블로그 스타일로 다듬기
- 카테고리/태그 자동 추론
- 이미지 정리
- 파일명 변경 (draft → 실제 제목)
