# editor.js

`editor.js` 는 `editor.entry.js` 를 묶은 파일이다 (TipTap 3 + tiptap-markdown). 다시 만들려면:

```bash
cd "$(mktemp -d)" && cp <repo>/admin/lib/editor.entry.js entry.js && cp <repo>/admin/lib/editor.package.json package.json
npm install && npx esbuild entry.js --bundle --minify --format=iife --target=es2020 --legal-comments=none --outfile=<repo>/admin/lib/editor.js
```
