#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

cd "$project_dir/frontend"
npm ci
npm run build

cd "$project_dir"
python3 -m pip install -r backend/requirements.txt
python3 -m PyInstaller --clean --noconfirm packaging/CalenDo.spec
xattr -d com.apple.FinderInfo "$project_dir/dist/CalenDo.app" 2>/dev/null || true
codesign --force --deep --sign - "$project_dir/dist/CalenDo.app"

echo "Mac app: $project_dir/dist/CalenDo.app"
