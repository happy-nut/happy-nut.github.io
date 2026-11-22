# TAX - Categories and tags

카테고리 탭은 상위·하위 카테고리 카드를, 태그 탭은 글 수가 붙은 태그 구름을 보여 주고, 각각 눌러 그 모음 페이지로 간다.

## Sub-features

- `TAX-cats` **Category list**: `/categories/` 에 `.card.categories` 카드. 글 front matter `categories` 의 첫 값이 상위, 둘째가 하위.
- `TAX-cat` **Category page**: `/categories/<소문자>/` 에 그 카테고리 글 목록.
- `TAX-tags` **Tag list**: `/tags/` 에 `#tags a.tag` (이름 + 글 수).
- `TAX-tag` **Tag page**: `/tags/<소문자>/` 에 그 태그 글 목록.

## How to get to it (user POV)

- 사이드바 `CATEGORIES`, `TAGS` 링크.
- 글 머리의 카테고리 링크, 글 아래 태그 링크.

## Driving it with drive.mjs

Preconditions:

- `serve.sh doctor` 가 모두 `ok`.

- **카테고리 목록과 페이지.**
  ```bash
  $D $U/ $E/TAX-cat.png --click '#sidebar nav a[href="/categories/"]' \
    --eval "[...document.querySelectorAll('.card.categories .card-header a.mx-2')].map(a=>a.textContent.trim()+' '+a.getAttribute('href'))" \
    --shot $E/TAX-cats.png \
    --click 'a.mx-2[href="/categories/finance/"]' --eval "document.querySelector('h1').innerText"
  ```
  같은 href 가 두 번 나오면 대소문자 충돌이다(아래 Gotchas). 마지막 `h1` 에 `finance` 와 글 수(2026-11 기준 7).
- **태그 목록.** `$D $U/ $E/TAX-tags.png --click '#sidebar nav a[href="/tags/"]' --eval "document.querySelectorAll('#tags a.tag').length"` (2026-11 기준 99).
- **태그 페이지.** 검증 대상 글의 태그 하나를 눌러 그 글 제목이 목록에 있다.
- **증명.** `TAX-cats.png`, `TAX-tags.png`.

## Gotchas

- 카테고리·태그 URL 은 소문자지만 표시 이름은 front matter 그대로다. `Life` 와 `life` 처럼 대소문자만 다른 값이 섞이면 `/categories/` 에 카드가 둘 뜨고 같은 URL 을 다투며, 빌드 로그에 `Conflict: ... categories/<name>/index.html` 이 찍힌다 (2026-11 에 소문자로 통일해 해결). 새 글도 소문자 kebab-case.
