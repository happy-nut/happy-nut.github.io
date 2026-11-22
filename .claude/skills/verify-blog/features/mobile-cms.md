# Mobile editor

`/admin` 의 Sveltia CMS. 휴대폰 브라우저에서 글·일기를 쓰고 고치면 GitHub API 로 `main` 에 바로 커밋되고, `pages-deploy` 워크플로가 사이트에 배포한다. 설정은 `admin/config.yml`, 화면은 `admin/index.html`.

## Sub-features

- `posts` **Posts**: `_posts/` 글 목록·새 글·수정·삭제. 파일 이름은 `{{year}}-{{month}}-{{day}}-{{title}}` (공백은 `-`).
- `diary` **Diary**: `koongya/` 일기. 사이트 빌드에서 빠지므로 저장해도 공개되지 않는다.
- `pattern` **Lowercase taxonomy**: 글의 카테고리·태그는 `^[a-z0-9]+(-[a-z0-9]+)*$` 만 저장된다.
- `published` **Draft toggle**: 「공개」를 끄면 `published: false` 로 저장되고 Jekyll 이 그 글을 만들지 않는다.
- `omit_empty_optional_fields` **No empty keys**: 빈 요약·대표 이미지는 front matter 에 쓰지 않는다 (`image: ''` 면 Chirpy 가 깨진 이미지를 그린다).

## How to get to it (user POV)

`https://happy-nut.github.io/admin/` → 「액세스 토큰으로 로그인」 → 이 저장소 Contents 읽기·쓰기 권한의 fine-grained 토큰. 「GitHub(으)로 로그인」은 OAuth 중계 서버가 없어 동작하지 않는다.

## Driving it with drive.mjs

실제 토큰 없이 로컬에서 몬다. 「로컬 저장소로 작업」은 localhost 에서만 보이고 폴더 선택 창을 띄우는데, `cms-local-repo.js` 가 저장소 파일을 OPFS 에 복사하고 `showDirectoryPicker` 를 그 폴더로 바꿔 창 없이 연다.

```bash
S=.claude/skills/verify-blog; $S/cms-fixture.sh
CLICK(){ echo "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('$1')).click()"; }
node $S/drive.mjs http://127.0.0.1:4100/admin/ $E/CMS.png --width 390 --wait 3000 \
  --eval "$(cat $S/cms-local-repo.js)" --eval "$(CLICK 로컬)" --wait 4000 \
  --eval "location.hash='#/collections/posts/new'" --wait 3000 \
  --type 'input[type=text]' '제목' --eval "$(CLICK 지금)" --eval "$(CLICK '카테고리⁩ 추가')" --wait 500 \
  --eval "[...document.querySelectorAll('input[type=text]')].at(-1).dataset.t='cat'" --type '[data-t=cat]' 'mobile' \
  --type '[id$=lexical-root]' '본문' --eval "$(CLICK 저장)" --wait 3000 \
  --eval "(async()=>{const r=await (await navigator.storage.getDirectory()).getDirectoryHandle('happy-nut.github.io');const p=await r.getDirectoryHandle('_posts');for await (const [n,h] of p.entries()) if(n.startsWith('$(date +%Y-%m-%d)')) return n+'\n'+await (await h.getFile()).text()})()"
```

끝 상태: 마지막 `--eval` 이 새 파일 이름과 front matter 를 찍는다. 그 내용을 `_posts/` 에 잠시 넣어 홈 첫 카드와 `/posts/<제목>/` 에 뜨는지 보고 지운다.

## Gotchas

- `cms-fixture.sh` 는 몰 때마다 다시 돌린다. 스크린숏을 저장소 안에 쓰면 Jekyll 이 다시 빌드하며 `__fixture.json` 을 지운다.
- 로컬 모드는 GitHub 커밋과 배포를 거치지 않는다. 토큰 로그인·커밋·배포는 실제 사이트에서 사람이 한 번 해 봐야 증명된다.
- `/admin` 은 `pwa.cache.deny_paths` 에 있어 서비스 워커가 캐시하지 않는다.
