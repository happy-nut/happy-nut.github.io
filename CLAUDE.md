# CLAUDE.md

Jekyll 블로그 (GitHub Pages, Chirpy 테마)

## Commands

```bash
bundle install          # 의존성 설치
bundle exec jekyll s    # 로컬 서버 (localhost:4000)
```

## Content Structure

| 디렉토리 | 용도 | 파일명 |
|----------|------|--------|
| `_posts/` | 블로그 포스트 | `YYYY-MM-DD-제목.md` |
| `til/` | TIL (비공개) | `주제.md` |
| `koongya/` | 개인 일기 (비공개) | `YYYY-MM-DD-제목.md` |

## Front Matter

```yaml
title: 제목
date: YYYY-MM-DD HH:MM:SS +0900
categories: [cat1, cat2]
tags: [tag1, tag2]
mermaid: false
math: false
```

## Custom Commands

| 명령어 | 기능 |
|--------|------|
| `/new-post` | 포스트 초안 생성 (카테고리/태그 비움) |
| `/refine` | 초안 다듬기 + 카테고리/태그 자동 추론 + 이미지 정리 |
| `/til` | TIL 생성 |
| `/diary` | 일기 생성 |
| `/publish` | 커밋 & 푸시 |
| `/reflect` | 실수 회고 → 교훈을 아래 섹션에 기록 |

## Category Examples

회고: `[retrospect]` | 기술: `[engineering, kotlin]` | 리더십: `[Leadership, Psychology]` | AI: `[AI, fine-tuning]`

## Commit Rules

한글, 단촐하게: `new post`, `new til`, `update {파일명}`

## Lessons Learned

실수에서 배운 교훈 기록 (재발 방지)

- /refine 실행 후 로컬 서버(`bundle exec jekyll s`)를 띄워 결과 확인 필수
- 블로그 문체: 단정적 표현 지양, "~고 본다", "~지 않을까 싶지만" 등 여운 있는 개인 견해 톤
- 담백함 ≠ 짧은 문장. 자연스럽게 흐르면서 군더더기 없는 것
- /refine 시 초안에 없는 구체적 경험(대화 내용, 행동 순서 등)을 지어내지 말 것. 확장은 통찰과 맥락 추가로
- 개념 설명 시 예시와 비유 적극 활용 (숫자, 상황, 일상적 비유로 이해도 높이기)
