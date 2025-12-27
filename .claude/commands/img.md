---
name: img
description: "포스트 이미지를 assets/img/posts로 이동 및 참조 업데이트"
---

# /img - 포스트 이미지 정리

## 사용법
```
/img @포스트파일#라인번호
/img
```

## 기능
`_posts/` 디렉토리에 임시로 저장된 이미지를 `assets/img/posts/`로 이동하고, 해당 포스트의 이미지 참조를 업데이트한다.

## 실행 흐름
1. `_posts/` 디렉토리에서 이미지 파일 찾기
2. 포스트 제목과 맥락에서 이미지 이름 자동 생성 (영문 kebab-case)
3. 이미지를 `assets/img/posts/`로 이동
4. 포스트의 이미지 참조를 새 경로로 업데이트
5. alt 텍스트도 맥락에 맞게 자동 생성

## 이미지 이름 자동 생성 규칙
- 포스트 제목과 이미지 주변 맥락을 분석
- 영문 kebab-case로 변환 (예: `brain-system`, `login-flow`)
- 사용자에게 묻지 않고 바로 적용

## 이미지 경로 규칙
- **원본 위치**: `_posts/{이미지파일}`
- **목표 위치**: `assets/img/posts/{자동생성이름}.{확장자}`
- **참조 형식**: `![자동생성 alt](/assets/img/posts/{자동생성이름}.{확장자})`

## 예시
```
/img @_posts/2025-01-01-뇌의-구조.md#L22
→ 맥락 분석 후 자동 이름 생성
→ _posts/img.png → assets/img/posts/brain-structure.png
→ ![img.png](img.png) → ![뇌의 구조](/assets/img/posts/brain-structure.png)
```

## 자동 감지 모드
```
/img
```
1. `_posts/` 디렉토리에서 이미지 파일 자동 검색
2. 참조하는 포스트 찾아서 맥락 분석
3. 이름 자동 생성 후 이동
