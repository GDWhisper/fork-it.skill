#!/usr/bin/env bash
# fork-it installer — thin wrapper around install.mjs (cross-platform).
# Forwards all arguments to Node; the real logic lives in install.mjs
# so there is a single source of truth across platforms.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
exec node "./install.mjs" "$@"
