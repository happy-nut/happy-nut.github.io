#!/usr/bin/env bash
# Write the posts/diary/admin files as JSON into the served site so cms-local-repo.js can load them.
# Re-run before each drive: Jekyll wipes the site folder when it regenerates.
set -euo pipefail; cd "$(git rev-parse --show-toplevel)"; export PORT=${PORT:-4100}
python3 - <<'PY'
import json,os
files={}
for d in ['_posts','koongya','admin']:
    for f in os.listdir(d): files[f'{d}/{f}']=open(f'{d}/{f}',encoding='utf-8').read()
files['_config.yml']=open('_config.yml').read()
json.dump(files,open(os.environ['TMPDIR'].rstrip('/')+'/verify-blog-'+os.environ.get("PORT","4100")+'/site/__fixture.json','w'))
PY
