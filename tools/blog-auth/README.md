# blog-auth

글쓰기 앱(`/admin`)의 「GitHub 으로 계속하기」 로그인 중계. AWS Lambda `happynut-blog-auth` (zoobox, ap-northeast-2, Function URL).

- `bash tools/blog-auth/deploy.sh` 로 만들거나 갱신한다. URL 은 `admin/app.js` 의 `AUTH` 와 같아야 한다.
- GitHub App 의 키는 `/setup` 이 manifest 흐름으로 받아 SSM `/blog-auth/github-app` (SecureString)에 둔다. 사람도 에이전트도 키를 보지 않는다. 다시 만들려면 그 파라미터를 지우고 `/setup` 을 연다.
- 토큰은 8시간짜리이고, 앱이 `/refresh` 로 갱신한다.
