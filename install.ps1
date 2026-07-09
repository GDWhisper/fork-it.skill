# fork-it installer — thin wrapper around install.mjs (cross-platform).
# Forwards all arguments to Node; the real logic lives in install.mjs
# so there is a single source of truth across platforms.

$ErrorActionPreference = 'Stop'
$Dir = Split-Path -Parent $MyInvocation.MyCommand.Path
& node (Join-Path $Dir 'install.mjs') @args
exit $LASTEXITCODE
