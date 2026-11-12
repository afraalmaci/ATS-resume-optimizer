#!/usr/bin/env bash
# Starts the backend (http://localhost:3001) and frontend (http://localhost:3000)
# together. Ctrl+C stops both.
#
#   ./dev.sh          start both
#   ./dev.sh --check  run tests and lint first, start only if they pass
set -euo pipefail

cd "$(dirname "$0")"

# Install dependencies on first run.
for app in backend frontend; do
  if [ ! -d "$app/node_modules" ]; then
    echo "Installing $app dependencies..."
    npm --prefix "$app" install
  fi
done

if [ "${1:-}" = "--check" ]; then
  echo "Running backend tests and lint..."
  npm --prefix backend test
  (cd backend && npx eslint "{src,apps,libs,test}/**/*.ts")
  echo "Running frontend tests, typecheck and lint..."
  npm --prefix frontend test
  npm --prefix frontend run typecheck
  (cd frontend && npx eslint app src)
  echo "All checks passed."
fi

# Stop both apps when this script exits (Ctrl+C or one app crashing).
trap 'trap - EXIT; kill 0' EXIT INT TERM

npm --prefix backend run start:dev 2>&1 | sed -u 's/^/[backend]  /' &
npm --prefix frontend run dev 2>&1 | sed -u 's/^/[frontend] /' &

echo "Starting backend and frontend... (Ctrl+C stops both)"

# Print the address once both apps actually answer, so it is not lost in the
# startup logs. The first request also warms up the frontend page.
(
  until curl -s -o /dev/null http://localhost:3001 \
    && curl -s -o /dev/null http://localhost:3000; do
    sleep 1
  done
  printf '\n\033[1;33m==> Ready: open http://localhost:3000\033[0m   (API: http://localhost:3001, Ctrl+C stops both)\n\n'
) &

wait
