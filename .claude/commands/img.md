---
name: img
description: "포스트 이미지를 assets/img/posts로 이동 및 참조 업데이트"
---

# /img - 포스트 이미지 정리

## 사용법
```
/img [이미지파일] [새이름]
```

## 기능
`_posts/` 디렉토리에 임시로 저장된 이미지를 `assets/img/posts/`로 이동하고, 해당 포스트의 이미지 참조를 업데이트한다.

## 실행 흐름
1. `_posts/` 디렉토리에서 지정된 이미지 파일 찾기
2. 이미지를 `assets/img/posts/`로 이동
3. 새 이름으로 rename (확장자 유지)
4. 해당 이미지를 참조하는 포스트 파일 찾기
5. 포스트의 이미지 참조를 새 경로로 업데이트

## 이미지 경로 규칙
- **원본 위치**: `_posts/{이미지파일}`
- **목표 위치**: `assets/img/posts/{새이름}.{확장자}`
- **참조 형식**: `![alt text](/assets/img/posts/{새이름}.{확장자})`

## 예시
```
/img img.png esbi-quadrant
→ _posts/img.png → assets/img/posts/esbi-quadrant.png
→ ![img.png](img.png) → ![이미지 설명](/assets/img/posts/esbi-quadrant.png)

/img screenshot.jpg login-flow
→ _posts/screenshot.jpg → assets/img/posts/login-flow.jpg
```

## 자동 감지 모드
이미지 파일명 없이 실행 시:
```
/img
```
1. `_posts/` 디렉토리에서 이미지 파일 자동 검색 (png, jpg, jpeg, gif, webp)
2. 발견된 이미지와 참조하는 포스트 표시
3. 새 이름 입력 요청

## 주의사항
- 이동 전 git에 커밋되지 않은 이미지는 백업 권장
- 이미지 파일명에 한글이나 공백이 있으면 영문 kebab-case로 변환
