#!/usr/bin/env bash
# Writes _posts/ and koongya/ as JSON into the served site so fake-github.js can answer GraphQL with real posts.
# Re-run before each drive: Jekyll wipes the site folder when it regenerates.
set -euo pipefail; cd "$(git rev-parse --show-toplevel)"; export PORT=${PORT:-4100}
python3 - <<'PY'
import json, os
files = {f'{d}/{f}': open(f'{d}/{f}', encoding='utf-8').read() for d in ['_posts', 'koongya'] for f in os.listdir(d) if f.endswith('.md')}
json.dump(files, open(os.environ['TMPDIR'].rstrip('/') + f"/verify-blog-{os.environ['PORT']}/site/__fixture.json", 'w'))
print(len(files), 'files')
PY
