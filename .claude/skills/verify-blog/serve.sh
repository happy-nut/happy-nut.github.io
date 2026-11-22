#!/usr/bin/env bash
# Launch / check / stop an isolated `jekyll serve` for this checkout.
#   serve.sh start   build + serve on $PORT (default 4100), wait until usable
#   serve.sh doctor  read-only: is the instance ours, alive, and serving this checkout?
#   serve.sh stop    kill only the PID we started, remove temp state (never evidence)
#   serve.sh url     print the base URL
set -euo pipefail

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
PORT="${PORT:-4100}"
STATE="${TMPDIR:-/tmp}/verify-blog-$PORT"
RUBY33=/opt/homebrew/opt/ruby@3.3/bin
[ -d "$RUBY33" ] && export PATH="$RUBY33:$PATH"
URL="http://127.0.0.1:$PORT"

pid_alive() { [ -f "$STATE/pid" ] && kill -0 "$(cat "$STATE/pid")" 2>/dev/null; }

doctor() {
  local ok=0
  ruby -e 'exit(RUBY_VERSION.start_with?("3.") ? 0 : 1)' \
    && echo "ok   ruby $(ruby -e 'print RUBY_VERSION')" \
    || { echo "FAIL ruby $(ruby -e 'print RUBY_VERSION') (chirpy needs 3.x: brew install ruby@3.3)"; ok=1; }
  if pid_alive; then echo "ok   pid $(cat "$STATE/pid") alive"; else echo "FAIL no live instance in $STATE"; return 1; fi
  local owner; owner="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -1 || true)"
  [ "$owner" = "$(cat "$STATE/pid")" ] && echo "ok   port $PORT owned by our pid" || { echo "FAIL port $PORT owner=$owner"; ok=1; }
  grep -q "Auto-regeneration: enabled for '$ROOT'" "$STATE/log" \
    && echo "ok   serving $ROOT" || { echo "FAIL log does not say it serves $ROOT"; ok=1; }
  [ "$(curl -s -o /dev/null -w '%{http_code}' "$URL/")" = 200 ] && echo "ok   GET / 200" || { echo "FAIL GET /"; ok=1; }
  grep -q '"url"' <(curl -s "$URL/assets/js/data/search.json") && echo "ok   search index" || { echo "FAIL search.json empty"; ok=1; }
  # build problems only; webrick's "ERROR Errno::ECONNRESET" from closed curl connections is noise
  grep -qE "Liquid Exception|Error:|Conflict:" "$STATE/log" && echo "warn build errors/conflicts in $STATE/log" || true
  return $ok
}

case "${1:-}" in
  start)
    if pid_alive; then echo "already running: $URL (pid $(cat "$STATE/pid"))"; exit 0; fi
    if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then echo "port $PORT busy and not ours; set PORT=..." >&2; exit 1; fi
    mkdir -p "$STATE"
    (cd "$ROOT" && bundle check >/dev/null 2>&1 || bundle install)
    # exec so the recorded PID is jekyll itself and no shell keeps the caller's stdout open
    (cd "$ROOT" && exec bundle exec jekyll serve -H 127.0.0.1 -P "$PORT" -d "$STATE/site" </dev/null >"$STATE/log" 2>&1) &
    echo $! >"$STATE/pid"
    for _ in $(seq 1 120); do
      grep -q "Server running" "$STATE/log" && break
      pid_alive || { tail -20 "$STATE/log"; exit 1; }
      sleep 1
    done
    doctor && echo "ready: $URL"
    ;;
  doctor) doctor ;;
  stop)
    if pid_alive; then kill "$(cat "$STATE/pid")"; echo "stopped pid $(cat "$STATE/pid")"; fi
    rm -rf "$STATE"
    ;;
  url) echo "$URL" ;;
  *) sed -n 2,6p "$0"; exit 1 ;;
esac
