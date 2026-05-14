#!/bin/bash
#
# Run all linters: shellcheck, actionlint, eslint, html-validate.
#
set -euo pipefail

shellcheck ci/*.sh

if [ ! -x ./actionlint ]; then
	bash <(curl -sSf https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
fi
./actionlint -color

npx --yes eslint@10 .
npx --yes html-validate@11 index.html
