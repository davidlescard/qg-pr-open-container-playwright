#!/usr/bin/env bash
# Single entry point for local and CI tasks. Usage: ./build.sh [task]
set -euo pipefail
cd "$(dirname "$0")"

usage() {
  echo "Usage: ./build.sh [install|compile|test|test-junit|build|start|e2e|docker|container-up|container-down|all]"
  echo "  all (default): install, compile, test, build"
}

task="${1:-all}"

case "$task" in
  install)   pnpm install --frozen-lockfile ;;
  compile)   pnpm run compile ;;
  test)      pnpm test ;;
  test-junit) pnpm run test:junit ;;
  build)     pnpm run build ;;
  start)     pnpm start ;;
  e2e)       pnpm run test:e2e ;;
  docker)    docker compose up --build ;;
  container-up)
    # The test container enables the reset endpoint on purpose; never do this in a deployed environment.
    docker build -t qg-container:ci .
    docker run -d --name qg-container -p 3000:3000 -e ENABLE_TEST_RESET=true qg-container:ci
    for attempt in $(seq 1 30); do
      if curl -fsS http://localhost:3000/health; then
        echo
        curl -fsS http://localhost:3000/api/runs | grep -q "Login Flow"
        exit 0
      fi
      sleep 2
    done
    echo "Container did not become healthy" >&2
    docker logs qg-container >&2 || true
    exit 1
    ;;
  container-down) docker rm -f qg-container ;;
  all)
    pnpm install --frozen-lockfile
    pnpm run compile
    pnpm test
    pnpm run build
    ;;
  -h|--help|help) usage ;;
  *) usage; exit 1 ;;
esac
