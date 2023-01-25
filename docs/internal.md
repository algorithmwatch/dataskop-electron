# Internal development

Prevent pushing a branch `internal` to the remote `origin`.

As usual, you have to set up this pre-commit hook every time you clone the repo.

`./git/hooks/pre-push`

```bash
#!/bin/sh
while read local_ref local_sha remote_ref remote_sha
do
	if [ "$remote_ref" = "refs/heads/internal" ] && [ "$1" == "origin" ]; then
		echo "Do not push internal branch to origin!"
		exit 1
	fi
done

command -v git-lfs >/dev/null 2>&1 || { echo >&2 "\nThis repository is configured for Git LFS but 'git-lfs' was not found on your path. If you no longer wish to use Git LFS, remove this hook by deleting '.git/hooks/pre-push'.\n"; exit 2; }
git lfs pre-push "$@"

exit 0
```
