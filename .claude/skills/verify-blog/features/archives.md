# ARCH - Archives

아카이브 탭은 모든 글을 연도별로 묶어 날짜와 제목으로 나열한다.

## Sub-features

- `ARCH-list` **Year-grouped list**: `/archives/` 에 `#archives .year` 제목과 그 아래 `#archives li a` 글 링크.

## How to get to it (user POV)

- 사이드바 `ARCHIVES` 링크.

## Driving it with drive.mjs

Preconditions:

- `serve.sh doctor` 가 모두 `ok`.

- **목록 읽기.** `$D $U/ $E/ARCH.png --click '#sidebar nav a[href="/archives/"]' --eval "({years: [...document.querySelectorAll('#archives .year')].map(e=>e.textContent.trim()), posts: document.querySelectorAll('#archives li a').length})"`. `years` 는 `2026, 2025, 2024`, `#archives li a` 개수는 `ls _posts | wc -l` 과 같다(2026-11 기준 39).
- **글로 가기.** 새로 더한 글이 맨 위 연도 첫 줄에 있는지 보고 눌러 글 페이지로 간다.
- **증명.** `ARCH.png`.

## Gotchas

- `til/`, `koongya/` 는 `_config.yml` `exclude` 라 아카이브·검색 어디에도 안 나와야 한다. 나오면 그게 버그다.
