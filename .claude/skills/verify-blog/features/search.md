# SEARCH - Search

상단 검색창에 치는 대로 글 제목·본문에서 찾아 결과 카드를 바로 보여 준다. 인덱스는 빌드 때 만든 `/assets/js/data/search.json` 이다.

## Sub-features

- `SEARCH-type` **Live results**: `#search-input` 에 글자를 치면 `#search-results` 에 맞는 글 링크가 뜬다.
- `SEARCH-empty` **No results**: 맞는 글이 없으면 결과가 비고 안내 문구가 남는다.
- `SEARCH-cancel` **Cancel**: `#search-cancel` 로 닫으면 `#search-result-wrapper` 가 다시 `d-none`.
- `SEARCH-mobile` **Mobile trigger**: 좁은 화면에서는 `#search-trigger` 아이콘을 눌러야 입력창이 열린다.

## How to get to it (user POV)

- 어느 페이지에서든 상단 오른쪽 검색창을 누른다.
- 좁은 화면에서는 돋보기 아이콘을 누른다.

## Driving it with drive.mjs

Preconditions:

- `serve.sh doctor` 의 `search index` 가 `ok`.

- **검색과 결과 누르기.** SKILL.md Drive 절의 예시 명령 그대로다. `--type '#search-input' '손절'` 뒤 `#search-results a` 의 제목을 읽는다. 첫 결과가 `손절가를 건드린 대가 → /posts/may-trading-retrospect/` 같은 실제 글이다. 새 글을 검증하면 그 글 제목의 고유한 낱말로 친다.
- **결과 누르기.** 첫 결과를 눌러 그 글 페이지 `h1` 이 결과 제목과 같다.
- **빈 결과.** `$D $U/ $E/SEARCH-empty.png --type '#search-input' 'zzzqqq' --eval "document.querySelectorAll('#search-results a').length"` 가 `0`.
- **닫기.** 같은 명령에 `--click '#search-cancel' --eval "document.querySelector('#search-result-wrapper').classList.contains('d-none')"` 를 붙이면 `true`.
- **증명.** 결과가 보이는 상태의 `SEARCH.png`.

## Gotchas

- 결과는 키 이벤트로 갱신된다. 내장 브라우저에서 `javascript_tool` 로 `value` 만 넣지 말고 진짜 타이핑을 쓴다. `drive.mjs --type` 은 실제 키 이벤트를 보낸다.
- 새 글이 검색에 안 나오면 재빌드가 끝났는지(`...done in`)와 PWA 캐시가 옛 `search.json` 을 주는지 본다.
