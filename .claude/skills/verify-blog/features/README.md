# Happynut 블로그 검증 지도

이 폴더는 블로그의 사용자 동작을 검증하는 정본이다. 몰기 전에 이 색인을 읽고, 맞는 기능 파일을 방법으로 쓴다.

## 기본 전제

- `../serve.sh start` 로 이 체크아웃을 `http://127.0.0.1:$PORT` (기본 4100)에 띄운다. 워크트리마다 다른 `PORT`.
- `../serve.sh doctor` 가 모두 `ok` 여야 몬다. 이 실행이 띄우지 않은 인스턴스는 몰지 않는다.
- 시드 데이터는 저장소의 `_posts/` 그대로다. 글을 더하거나 고친 검증이면 그 글이 곧 시드다.

## 몰기 관례

- 몰기와 스크린샷은 `../drive.mjs` (`D=.claude/skills/verify-blog/drive.mjs; U=$(.claude/skills/verify-blog/serve.sh url)`). 둘러보기만 할 땐 내장 브라우저도 된다.
- 가능한 한 사이드바 링크·글 카드·검색 결과를 눌러 닿는다. 주소 직접 입력은 보조다.
- 검색어는 `--type` 으로 실제 키 입력을 보낸다.
- 데스크톱 너비(1024px 이상)를 기본으로 한다. 좁은 화면 검증이면 그렇게 적는다.

## 증명과 건너뜀 보고

- 증거는 저장소 루트 `.verify-evidence/<YYYYMMDD-HHMM>/<기능 ID>.png` 와 `notes.md`. gitignore 되어 있다.
- 화면에서 읽은 값(제목, 결과 목록, 개수)을 `notes.md` 에 적는다. HTTP 200 만으로는 증명이 아니다.
- 몰지 못한 진입점은 시도한 경로와 빠진 전제를 적는다.

## 기능

- [Home feed](./home-feed.md): 홈 글 카드 목록과 페이지 넘기기.
- [Read a post](./read-post.md): 글 본문, 목차, 태그, 이전·다음 글, 댓글.
- [Categories and tags](./taxonomy.md): 카테고리·태그 목록과 각 모음 페이지.
- [Archives](./archives.md): 연도별 전체 글 목록.
- [Search](./search.md): 상단 검색창 실시간 검색.
- [PWA update toast](./pwa-update.md): 새 버전이 배포되면 뜨는 업데이트 알림.
- [Mobile editor](./mobile-cms.md): `/admin` 글쓰기 앱. 휴대폰으로 글·일기 쓰고 고쳐 바로 배포.
