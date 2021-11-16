#!/usr/bin/env bash
set -e
set -x

./node_modules/.bin/ts-json-schema-generator --no-type-check --path './src/renderer/providers/youtube/lib/types.ts' --type 'YtScrapingConfig' --out './src/renderer/lib/validation/yt-config-schema.json'
./node_modules/.bin/ts-json-schema-generator --no-type-check --path './src/renderer/providers/types.ts' --type 'Campaign' --out './src/renderer/lib/validation/campaign-schema.json'
prettier --write './src/renderer/lib/validation/*.json'
