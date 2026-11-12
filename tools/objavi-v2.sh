#!/usr/bin/env bash
# Publish the built game (dist/ of a commit) to the v2 repository as a deploy-only history.
# usage (from the repo root, with remote "v2" = github.com/trbojevicstefan/markokraljevic-v2):
#   bash tools/objavi-v2.sh . realisticni-svet tools/v2-pages.yml
# Run the full CI first; this only uploads dist/ to the v2 site (https://trbojevicstefan.github.io/markokraljevic-v2/).
# Each publish is one commit whose tree is dist/ plus .github/workflows/pages.yml; its parent is the
# previous deploy commit (remote v2/main) when there is one, so later pushes send only changed files.
set -euo pipefail
repo="$1"; src="$2"; yml="$3"
cd "$repo"
git fetch -q v2 2>/dev/null || true
dist_tree=$(git rev-parse "$src:dist")
src_short=$(git rev-parse --short "$src")
yml_blob=$(git hash-object -w "$yml")
idx=$(mktemp)
GIT_INDEX_FILE="$idx" git read-tree "$dist_tree"
GIT_INDEX_FILE="$idx" git update-index --add --cacheinfo "100644,$yml_blob,.github/workflows/pages.yml"
tree=$(GIT_INDEX_FILE="$idx" git write-tree)
rm -f "$idx"
parent_args=()
if git rev-parse -q --verify refs/remotes/v2/main >/dev/null; then
  parent=$(git rev-parse refs/remotes/v2/main)
  if [ "$(git rev-parse "$parent^{tree}")" = "$tree" ]; then echo "v2 already has this build ($src_short)"; exit 0; fi
  parent_args=(-p "$parent")
fi
commit=$(printf 'Marko v2: igra iz realisticni-svet %s\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n' "$src_short" | git commit-tree "$tree" "${parent_args[@]}")
echo "deploy commit $commit (tree $tree) from $src_short"
git push v2 "$commit:refs/heads/main"
