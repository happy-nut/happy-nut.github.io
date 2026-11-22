# POST - Read a post

글 페이지는 제목·메타·본문을 보여 주고, 오른쪽 목차, 아래 태그·이전/다음 글·Giscus 댓글을 붙인다. 블로그의 핵심 화면이다.

## Sub-features

- `POST-body` **Title and body**: `/posts/<slug>/` 에 `h1` 제목과 마크다운 본문이 그려진다. slug 는 파일명의 날짜 뒤 부분.
- `POST-toc` **Table of contents**: `toc: true` (기본값)면 `#toc-wrapper` 에 본문 제목들이 뜬다.
- `POST-tags` **Tags and categories**: 머리의 카테고리 링크 `/categories/<c>/`, 아래 `.post-tags a.post-tag` → `/tags/<t>/`.
- `POST-nav` **Prev/next**: `.post-navigation a` 로 옆 글로 간다.
- `POST-comments` **Comments**: Giscus(`happy-nut/happy-nut.github.io`, category `Ideas`) 가 맨 아래 붙는다.
- `POST-media` **Mermaid / math**: front matter `mermaid: true`, `math: true` 일 때만 그려진다.

## How to get to it (user POV)

- 홈 글 카드를 누른다.
- 검색 결과를 누른다.
- 카테고리·태그·아카이브 목록에서 제목을 누른다.
- 다른 글의 이전/다음 링크를 누른다.

## Driving it with drive.mjs

Preconditions:

- `serve.sh doctor` 가 모두 `ok`.
- 바뀐 글이 있으면 로그에 그 뒤의 `...done in` 이 찍혔다.

- **글 열기.** 검색으로 닿는다: `$D $U/ $E/POST.png --type '#search-input' '<제목의 고유한 낱말>' --click '#search-results a' --eval "({path: location.pathname, h1: document.querySelector('h1').textContent.trim(), toc: document.querySelectorAll('#toc-wrapper a').length, tags: [...document.querySelectorAll('.post-tags a.post-tag')].map(a=>a.getAttribute('href')), brokenImgs: [...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)})"`. `h1` 이 front matter `title` 이다.
- **본문 확인.** 바뀐 문단의 고유한 문장이 `--eval "document.querySelector('.content').innerText.includes('<문장>')"` 로 `true` 다. 같은 문장이 `$TMPDIR/verify-blog-$PORT/site/posts/<slug>/index.html` 에도 있다.
- **목차.** `#toc-wrapper` 안 링크 개수가 본문 `##`·`###` 제목 개수와 맞는다(1024px 이상에서만 옆에 보인다).
- **태그.** `.post-tags a.post-tag` 의 href 가 front matter `tags` 를 소문자로 바꾼 값이다. 하나를 눌러 그 태그 페이지에 이 글이 있다.
- **이미지.** 위 `brokenImgs` 가 빈 배열이다.
- **증명.** 글 머리가 보이는 `POST.png`, 긴 글의 바뀐 부분은 `--full` 로 찍은 `POST-body.png`.

## Gotchas

- 파일명에 공백이 있는 글(`2025-12-27-부모가 될 준비.md`)도 있다. slug 는 공백이 `-` 가 되고 한글은 그대로 남아 URL 인코딩된다. 브라우저 주소창보다 카드를 눌러 닿는 편이 안전하다.
- Giscus 는 외부 iframe 이라 로컬에서도 github.com 에 붙는다. 댓글 내용은 검증 대상이 아니고 `giscus` 스크립트가 붙었는지만 본다.
- PWA 캐시 때문에 고친 글이 옛 모습으로 보일 수 있다. SKILL.md 의 PWA gotcha 참고.
