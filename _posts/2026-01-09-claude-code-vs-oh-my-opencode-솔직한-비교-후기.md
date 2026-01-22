---
title: "Claude Code vs Oh My Opencode: 솔직한 비교 후기"
date: 2026-01-09 00:22:20 +0900
categories: [ai, llm]
tags: [claude-dev, oh-my-opencode, ai-coding, review]
image: /assets/img/posts/oh-my-opencode-review.png
mermaid: false
math: false
---

최근 여러 전문가 AI 에이전트가 팀을 이루어 복잡한 문제를 해결한다는 컨셉의 'Oh My Opencode'를 직접 사용해 볼 기회가 생겼다. 결론부터 말하자면, 나는 여전히 강력한 단일 에이전트인 'Claude Code'를 사용하는 것이 더 낫다고 느꼈다.

![Oh My Opencode 사용 후기](/assets/img/posts/oh-my-opencode-review.png)

## Oh My Opencode의 약속과 현실

'Oh My Opencode'의 가장 큰 매력은 여러 에이전트가 협력하여 결과물의 완성도를 높인다는 아이디어였다. 실제로 기존에 `.claude` 폴더에 만들어 두었던 커맨드나 스킬을 손쉽게 가져다 쓸 수 있다는 점은 편리했다.

하지만 그뿐이었다. 기대를 모았던 '에이전트 팀'의 시너지는 체감하기 어려웠고, 오히려 단점이 더 크게 다가왔다.

## 실망스러웠던 점: 비용과 품질

가장 먼저 나를 놀라게 한 것은 **지나치게 많은 토큰 사용량**이었다. 서브 에이전트 중 하나인 'claude x20 MAX'의 토큰 제한이 불과 몇 시간 만에 소진될 정도로, 비용 효율성이 매우 떨어졌다.

그렇다면 막대한 비용만큼 결과물의 품질이 뛰어났는가? 안타깝게도 그렇지 않았다. 'Oh My Opencode'가 생성한 결과물은 내가 기존에 사용하던 'Claude Code'의 결과물과 비교했을 때 눈에 띄는 우위를 보여주지 못했다. 오히려 더 익숙해서인지, 'Claude Code'의 결과물이 더 만족스러울 때가 많았다.

## LSP 지원, 하지만 결정적 차이는 아니다

'Oh My Opencode'를 살펴보며 인상 깊었던 기능 중 하나는 LSP(Language Server Protocol) 지원이었다. LSP는 코드 에디터의 리팩토링 기능처럼, 변수명 변경과 같은 결정적인(deterministic) 작업을 LLM이 처리할 때 불필요한 확률적 생성을 막아 토큰을 절약하고 정확도를 높이는 중요한 기능이다.

하지만 이 역시 'Oh My Opencode'를 선택해야 할 이유가 되지는 못했다. 경쟁자인 'Claude Code' 역시 2.0.74 버전부터 LSP를 지원하기 시작했기 때문이다.

---

'전문가 팀'이라는 아이디어는 흥미롭지만, 현재의 'Oh My Opencode'는 그 아이디어를 실현하기 위해 너무 많은 비용을 요구하는 반면, 결과물의 품질은 그에 미치지 못한다는 인상을 받았다.

아마도 처음으로 프로젝트를 스캐폴딩할 때는 여러 에이전트가 협력하는 방식이 유용할지도 모르겠다. 하지만 이미 존재하는 코드베이스를 유지 보수하고 점진적으로 개선하는 작업에는, 코드 전체의 맥락을 더 잘 이해하는 강력한 단일 에이전트인 'Claude Code'가 더 적합하다고 생각한다.

결국 당분간은 신뢰할 수 있는 단일 에이전트와 함께하는 것이 더 현명한 선택으로 보인다.
