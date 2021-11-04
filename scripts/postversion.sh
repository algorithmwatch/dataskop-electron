#!/usr/bin/env bash
set -e
set -x

# check wether there are staged changes.
# If yes: abort
# If no: commit + tag with version number
# https://stackoverflow.com/a/33610683/4028896

# NB: It is VERY important that you first add the new version to `src/package.json` and
# then later to `package.json` in order to get both changes.
# Check the `postversion` in `package.json`.

if [ "$(git diff --name-only --cached | wc -l)" -eq "0" ]; then
  git add package.json
  git add 'release/app/package.json'

  if [ "$(git diff --name-only --cached | wc -l)" -eq "2" ]; then
    git commit --no-verify -m "v$1"
    git tag -a "v$1" HEAD -m "v$1"
    git push --follow-tags
  else
    echo "failed to add both package.json"
  fi
else
  echo "there are staged files, not creating commit + tag for this version"
fi
