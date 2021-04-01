#!/usr/bin/env bash
set -e
set -x

# check wether there are staged changes.
# If yes: abort
# If no: commit + tag with version number
# https://stackoverflow.com/a/33610683/4028896

if [ "$(git diff --name-only --cached | wc -l)" -eq "0" ]; then
  git add package.json
  git add "src/package.json"
  git commit -m "v$1"
  git tag -a "v$1" HEAD -m "v$1"
  git push --tags
else
  echo "there are staged files, not creating commit + tag for this version"
fi
