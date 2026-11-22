# Mobile editor

`/admin` 의 글쓰기 앱 (`admin/index.html`, `app.js`, `app.css`, 빌드 단계 없음). GitHub fine-grained 토큰으로 들어가 `_posts/`·`koongya/` 를 GraphQL 로 읽고, 발행하면 Contents API 로 `main` 에 커밋한 뒤 그 커밋의 Actions 실행을 지켜본다.

## Sub-features

- `#ghlogin` **GitHub login**: 중계 `/login` → GitHub → `/callback` → `/admin/#gh=<token>&rt=…&exp=…`. 앱이 주소에서 바로 지우고, 8시간 뒤에는 `/refresh` 로 갱신한다.
- `#/` **List**: 「글」/「일기」 탭, 검색, 이 기기에만 있는 초안과 고친 내용 표시, 새 글 버튼.
- `#/new/<coll>/<id>` **New**: 제목·본문만 보이는 화면. 0.6초마다 이 기기(localStorage `draft:*`)에 저장.
- `#/edit/<coll>/<file>` **Edit**: 기존 글. 이 기기에 고친 내용이 있으면 이어서 연다.
- `.ProseMirror` **Live editor**: 본문은 쓰는 대로 모양이 보인다 (`## `→소제목, `**굵게**`, `> `, `- `). 넣었다 빼면 HTML 이 달라지는 기존 글(표 정렬, 날것 HTML 등 8편)은 `data-act=raw` 원문 모드로 연다. `editor-roundtrip.js` 가 그 목록을 잰다.
- `data-act` **Toolbar**: 사진(1800px JPEG 로 줄여 `assets/img/posts/` 에 `[skip ci]` 커밋), 소제목, 굵게, 인용, 목록, 링크, 코드 블록, MD(원문 보기). 키보드 위에 붙는다.
- `#settings` **Settings sheet**: 카테고리·태그 칩(글은 영문 소문자 kebab-case 로 바꿔 저장), 요약, 대표 이미지, 주소(새 글만), 날짜, 공개(끄면 `published: false`), 수식, 다이어그램, 삭제.
- `#publish` **Publish**: GitHub에 저장 → 블로그 빌드·배포 → 블로그에 올라감, 세 단계를 보여 주고 「글 보기」로 끝난다. 카테고리가 없으면 설정 시트를 먼저 연다.

## How to get to it (user POV)

`https://happy-nut.github.io/admin/` → 「GitHub 으로 계속하기」 → (처음 한 번) Authorize → 목록. GitHub 앱 `happynut-blog-writer` 가 이 저장소에만 설치돼 있고, 로그인 중계는 `tools/blog-auth` (Lambda). 「토큰으로 들어가기」 도 남아 있다. 홈 화면에 추가하면 `/admin/manifest.webmanifest` 로 앱처럼 열린다.

## Driving it with drive.mjs

실제 토큰 대신 `fake-github.js` 가 `api.github.com` 요청을 메모리 저장소로 받는다 (GraphQL 은 실제 글로 채움, 쓰기는 `__fake.files`, 호출은 `__fake.log`).

```bash
S=.claude/skills/verify-blog; $S/fake-github.sh
node $S/drive.mjs http://127.0.0.1:4100/admin/ $E/published.png --width 390 \
  --eval "$(cat $S/fake-github.js)" --type '#tok' 'github_pat_test' --click '#login button' --wait 2500 \
  --click '#new' --type '#title' '제목' --type '.ProseMirror' $'## 소제목\n본문' \
  --click '#publish' --click '.chips[data-key=categories] [data-v=engineering]' --click '#done' \
  --click '#publish' --wait 10000 \
  --eval "[...__fake.files].filter(([p])=>p.startsWith('_posts/$(date +%Y-%m-%d)')).map(([p,t])=>p+'\n'+t)"
```

끝 상태: 시트 세 단계가 모두 `done`, 마지막 `--eval` 이 새 파일과 front matter 를 찍는다.

## Gotchas

- `fake-github.sh` 는 몰 때마다 다시 돌린다. 스크린숏을 저장소 안에 쓰면 Jekyll 이 다시 빌드하며 `__fixture.json` 을 지운다.
- 실제 GitHub 로그인은 Aside(사용자 브라우저)로 `http://127.0.0.1:4100/admin/` 을 열어 `#ghlogin` 을 누르면 된다. 중계가 이 주소로도 돌려보낸다.
- 가짜는 GitHub 경계만 바꾼다. 실제 토큰 권한·커밋·배포는 실제 사이트에서 한 번 해 봐야 증명된다.
- `.screen` 의 등장 애니메이션은 `backwards` 여야 한다. `both` 면 남은 transform 이 고정된 툴바·새 글 버튼을 화면 밖으로 가둔다.
- 편집기는 `admin/lib/editor.js` 묶음 파일이다. 다시 만드는 법은 `admin/lib/README.md`.
- `/admin` 은 `pwa.cache.deny_paths` 에 있어 서비스 워커가 캐시하지 않는다.
