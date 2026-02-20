---
title: "VIBAN을 Claude Code 플러그인으로 배포하기까지"
date: 2026-02-18 00:00:00 +0900
categories: [engineering, analysis]
tags: [claude-code, viban, npm, github-actions, plugin, open-source, kanban, ai-agent]
mermaid: false
math: false
image: /assets/img/posts/viban-tui-board.png
description: 로컬 칸반 TUI였던 VIBAN을 npm 패키지로 배포하고, Claude Code 플러그인으로 공개하기까지의 과정을 기록한다.
---

지난 글 말미에 "VIBAN 역시 언젠가 플러그인의 형태로 다듬어볼 생각이다"라고 적었다. 그리고 결국 만들었다.

이 글에서는 로컬 스크립트 뭉치에 불과했던 VIBAN을 npm 패키지로 배포하고, Claude Code 플러그인으로 공개하기까지의 과정을 기록해보려 한다. 화려한 기술 이야기보다는, 배포라는 행위 자체에서 겪은 고민과 결정들이 중심이다.

## VIBAN이 뭔가

![VIBAN TUI 칸반 보드](/assets/img/posts/viban-tui-board.png)
_VIBAN의 TUI 칸반 보드 화면_

간단히 말하면, **AI 에이전트를 위한 이슈 트래커**다. GitHub Issues나 Linear 같은 도구들은 사람과 사람이 협업하기 위해 만들어졌다. VIBAN은 사람이 이슈를 등록하면 AI가 알아서 할당받고, 분석하고, 수정하고, PR까지 만들어주는 흐름을 위해 설계되었다.

| | 기존 이슈 트래커 | VIBAN |
|---|---|---|
| **이슈를 해결하는 주체** | 사람 | AI 에이전트 |
| **병렬 작업** | 수동 브랜치 관리 | 격리된 워크트리 |
| **저장 위치** | 외부 SaaS | 로컬 JSON 파일 |
| **설치** | 계정, 권한, 연동 | `npm install` 한 줄 |
{:.mx-auto}

_기존 이슈 트래커와 VIBAN의 비교_

핵심 명령은 세 가지다.

```bash
# 버그를 발견하면 등록
/viban:add "로그인 후 세션이 풀리는 현상"

# Claude가 가장 높은 우선순위 이슈를 할당받아 작업 시작
/viban:assign

# 또는 3개 이슈를 동시에 해결 — 각각 독립된 워크트리에서
/viban:parallel-assign 3
```

등록만 해두면 나머지는 AI가 알아서 처리한다. 순차적으로 하나씩 해결할 수도 있고, 병렬로 여러 이슈를 동시에 돌릴 수도 있다. 병렬 모드에서는 각 에이전트가 독립된 git 워크트리에서 작업하기 때문에 서로 간섭 없이 동시에 코드를 수정할 수 있다.

## 배포라는 결심

사실 로컬에서 잘 돌아가고 있었으니, 굳이 배포할 이유가 없었다. 하지만 두 가지 계기가 있었다.

첫 번째는 **Claude Code 플러그인 생태계의 등장**이다. Claude Code가 공식적으로 커스텀 스킬과 플러그인을 지원하기 시작하면서, 내가 만든 워크플로우를 다른 사람도 쓸 수 있는 형태로 포장할 수 있게 되었다. `/install` 한 줄이면 누구든 설치할 수 있다는 점이 마음에 들었다.

두 번째는 **재사용의 필요**였다. 내 프로젝트가 하나가 아니다 보니, 매번 `.viban/` 디렉토리와 스크립트를 복사하는 게 번거로워지기 시작했다. npm 패키지로 만들어두면 어느 프로젝트에서든 글로벌 설치 한 번으로 끝난다.

## npm 패키지로 만들기

VIBAN은 zsh 스크립트 기반이다. Node.js 프로젝트가 아닌데 npm으로 배포한다는 게 처음에는 조금 어색하게 느껴졌다. 하지만 Claude Code 플러그인 배포의 표준 경로가 npm이고, 설치와 버전 관리를 별도로 구현할 필요가 없어진다는 점에서 합리적인 선택이라고 본다.

`package.json`에 `bin` 필드로 CLI 진입점을 잡고, `files` 필드로 배포에 포함할 파일들을 명시하는 것이 전부였다. 빌드 단계 없이 스크립트를 그대로 패키징하는 셈이다.

의존성 관리도 고민이었다. VIBAN은 `gum`(TUI 렌더링), `jq`(JSON 처리), `python3` 같은 시스템 도구에 의존한다. npm 의존성이 아니라 시스템 의존성이다 보니, 설치 시 이 도구들이 있는지 체크하는 스크립트를 별도로 두었다. 없으면 설치 방법을 안내하는 정도로 처리했다.

## GitHub Actions로 배포 자동화

배포 파이프라인은 가능한 한 단순하게 가져갔다. git 태그를 푸시하면 나머지는 자동이다.

`v*` 패턴의 태그가 푸시되면 GitHub Actions가 돌면서 npm에 퍼블리시하고, 릴리즈 노트를 자동 생성한 뒤 GitHub Release를 만든다. CI 워크플로우는 별도로 돌면서 테스트를 검증한다. 212개 테스트가 통과해야 릴리즈가 의미 있다.

```bash
# 로컬에서 버전 올리고 태그 푸시
npm version patch
git push --tags

# 나머지는 GitHub Actions가 알아서 처리
# 1. npm publish
# 2. 릴리즈 노트 생성
# 3. GitHub Release 생성
```

`NPM_TOKEN`만 GitHub Secrets에 등록해두면 된다. npm 토큰 발급은 npm 사이트에서 Access Token을 생성한 뒤 저장소의 Settings → Secrets에 추가하는 것으로 끝난다.

## 플러그인 구조

Claude Code 플러그인은 `package.json`의 구조로 스킬을 정의한다. VIBAN의 경우 네 가지 스킬을 노출한다.

- `/viban:setup` — 프로젝트 초기 설정. 의존성 확인, 컨벤션 감지, 워크플로우 파일 생성
- `/viban:add` — 이슈 등록. 설명을 분석해 우선순위와 타입을 자동 추론
- `/viban:assign` — 최우선 이슈를 할당받아 해결
- `/viban:parallel-assign` — N개 이슈를 병렬로 해결 (각각 독립 워크트리)

각 스킬은 `.claude/skills/` 디렉토리 아래 마크다운 파일로 프롬프트가 정의되어 있다. Claude Code가 이 프롬프트를 읽고, 정해진 절차에 따라 작업을 수행하는 구조다.

---

AI 에이전트와 함께 일하는 방식은 아직 정답이 없는 영역이다. VIBAN이 그 정답을 제시한다고 말할 생각은 없다. 다만 "이슈를 등록하면 AI가 해결한다"는 워크플로우가 나에게는 꽤 잘 맞았고, 혹시 비슷한 고민을 하는 사람이 있다면 한번 시도해볼 만하지 않을까 싶다.

소스코드는 [GitHub](https://github.com/happy-nut/claude-plugin-viban)에, 패키지는 [npm](https://www.npmjs.com/package/claude-plugin-viban)에 공개되어 있다.
