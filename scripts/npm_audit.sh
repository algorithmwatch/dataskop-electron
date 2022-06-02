#!/usr/bin/env bash
set -e
set -x

# check wether there are staged changes.
# If yes: abort
if [ "$(git diff --name-only --cached | wc -l)" -eq "0" ]; then
  npm audit fix
  git add package*.json
  git commit -m "Bump node dependencies via \`npm audit fix\`"
  git push
else
  echo "there are staged files, aborting"
fi
