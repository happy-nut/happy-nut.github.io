# PWA - PWA update toast

이미 방문한 사용자가 새 배포 뒤 다시 오면 서비스 워커가 새 버전을 받아 하단에 업데이트 알림을 띄우고, `Update` 를 누르면 새 버전으로 새로 고친다. 동작은 `_includes/notification.html` 이 테마 기본을 덮어쓴다.

## Sub-features

- `PWA-sw` **Service worker**: `/sw.min.js` 가 `127.0.0.1:$PORT` 범위로 등록된다(`pwa.enabled`, `pwa.cache.enabled`).
- `PWA-toast` **Update toast**: 대기 중인 새 워커가 있으면 `#notification` 이 보인다.
- `PWA-apply` **Apply update**: `[aria-label="Update"]` 를 누르면 새 워커가 넘겨받고(`controllerchange`, 2초 시간 제한) 페이지가 한 번 새로 고쳐진다.

## How to get to it (user POV)

- 사이트를 한 번 연 뒤, 새 버전이 배포된 다음 다시 연다.

## Driving it with the built-in browser

Preconditions:

- `serve.sh doctor` 가 모두 `ok`.
- 같은 브라우저 프로필로 같은 `PORT` 를 이미 한 번 열었다(워커 등록됨).

- **등록 확인.** `(await navigator.serviceWorker.getRegistrations()).map(r=>r.scope)` 에 `http://127.0.0.1:$PORT/` 가 있다.
- **새 버전 만들기.** 아무 글에 한 줄을 더해 재빌드(`...done in`)를 기다린다. `sw.min.js` 의 캐시 목록이 바뀐다.
- **알림.** 페이지를 새로 고친다. `#notification` 이 보이는 상태(`.show`)인지 본다. 스크린샷 `PWA-toast.png`.
- **적용.** `[aria-label="Update"]` 를 누른다. 페이지가 한 번 새로 고쳐지고 더한 줄이 보인다. `PWA-apply.png`.
- **되돌리기.** 더한 한 줄을 지운다.

## Gotchas

- 최근 커밋(`ae18882 Auto-activate updated service worker`)이 새 워커를 자동으로 활성화하게 바꿨다. 그래서 알림 없이 바로 새 버전으로 넘어갈 수 있다. 알림이 안 뜨면 먼저 이 동작인지 본다. 2026-11 지도 작성 때는 이 기능을 몰지 않았다(검증 안 됨).
- 워커는 브라우저 프로필에 남는다. 다른 체크아웃이 같은 `PORT` 를 쓰면 그 체크아웃의 캐시가 섞인다.
