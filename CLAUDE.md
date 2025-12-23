# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jekyll 기반 개인 블로그 (GitHub Pages). Chirpy 테마 사용.

## Commands

```bash
# 의존성 설치
bundle install

# 로컬 개발 서버 실행
bundle exec jekyll s
```

## Content Structure

| 디렉토리 | 용도 | 파일명 패턴 |
|----------|------|-------------|
| `_posts/` | 블로그 포스트 | `YYYY-MM-DD-제목.md` |
| `til/` | TIL 문서 (비공개) | `주제.md` 또는 `YYYY-MM-DD-주제.md` |
| `koongya/` | 개인 일기 (비공개) | `YYYY-MM-DD-제목.md` |
| `_tabs/` | 사이드바 탭 페이지 | `*.md` |

`til/`과 `koongya/`는 `_config.yml`의 `exclude`에 포함되어 빌드에서 제외됨.

## Post Front Matter

```yaml
---
title: 제목
date: YYYY-MM-DD HH:MM:SS +0900
categories: [category1, category2]
tags: [tag1, tag2]
mermaid: false  # mermaid 다이어그램 사용 시 true
math: false     # 수식 사용 시 true
---
```

## Custom Commands (/.claude/commands/)

- `/post [제목]` - 블로그 포스트 생성 (카테고리 자동 추론)
- `/til [제목]` - TIL 문서 생성 (경로 자동 추론)
- `/diary [제목]` - 개인 일기 생성 (koongya/)
- `/commit [메시지]` - 커밋 (한글, 단촐하게)
- `/img [파일] [새이름]` - 포스트 이미지를 assets/img/posts로 이동

## Category Conventions

| 유형 | 카테고리 예시 |
|------|---------------|
| 회고 | `[retrospect]` |
| 기술 | `[engineering, kotlin]`, `[engineering, architecture]` |
| 리더십 | `[Leadership, Psychology]` |
| AI | `[AI, fine-tuning]` |

## TIL Directory Structure

```
til/
├── coding/              # 클린 아키텍처, 디자인 패턴
├── cs/
│   ├── data-structure/  # HashMap, B-tree
│   ├── language/java/   # JVM, GC, JDBC
│   └── os/              # Linux, 스케줄링
├── db/
│   ├── rdbms/mysql/     # 락, 트랜잭션
│   └── nosql/key-value/redis/
├── infra/network/       # VRRP, TCP
├── messaging/kafka/
└── troubleshooting/     # 날짜 prefix 필수
```

## Commit Message Rules

- 한글 작성
- 단촐하게 핵심만
- `new post`, `new til`, `update {파일명}` 형식
- Co-Authored-By 등 부가 정보 제외
