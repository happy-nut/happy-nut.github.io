# HOME - Home feed

홈은 최신 글부터 카드 10개씩 보여 주고, 아래 페이지 번호로 이전 글을 넘겨 본다.

## Sub-features

- `HOME-list` **Post cards**: `/` 에 `#post-list article` 카드가 `paginate: 10` 개씩, 날짜 내림차순으로 보인다.
- `HOME-page` **Pagination**: `.pagination` 의 번호로 `/page2/`, `/page3/` … 로 넘어간다.
- `HOME-open` **Open a post**: 카드를 누르면 `/posts/<slug>/` 로 간다.

## How to get to it (user POV)

- 사이트 주소로 들어온다.
- 사이드바의 `/` (HOME) 링크를 누른다.
- 사이드바 상단 아바타·사이트 제목을 누른다.

## Driving it with drive.mjs

Preconditions:

- `serve.sh doctor` 가 모두 `ok`.

- **목록 읽고 넘기기.** 한 번에 몬다.
  ```bash
  $D $U/ $E/HOME-page2.png \
    --eval "[...document.querySelectorAll('#post-list article h1.card-title')].map(e=>e.textContent.trim())" \
    --shot $E/HOME.png \
    --click '.pagination a[href="/page2"]' \
    --eval "({path: location.pathname, first: document.querySelector('#post-list article h1.card-title').textContent.trim()})"
  ```
  첫 `--eval` 은 10개이고 첫 글이 `_posts/` 에서 가장 늦은 날짜의 `title` 이다. 둘째는 `/page2/` (링크 href 는 끝 슬래시 없는 `/page2`)이고 첫 제목이 1쪽 목록에 없다. 쪽 수는 `ceil(글 수 / 10)` (2026-11 기준 39개, 4쪽).
- **글 열기.** `$D $U/ $E/HOME-open.png --click '#post-list article a' --eval "document.querySelector('h1').textContent"` 의 `h1` 이 1쪽 첫 카드 제목과 같다.
- **증명.** `HOME.png`, `HOME-page2.png`.

## Gotchas

- `date` 가 미래인 글은 `jekyll serve` 에서 빠진다(`future: false`). 새 글이 안 보이면 front matter 시간부터 본다.
- 카드 미리보기 이미지는 front matter `image` 에서 온다. `image.hide: true` 면 글 머리에서는 숨지만 카드에는 나온다(`_layouts/post.html` 이 테마를 덮어쓴 부분).
