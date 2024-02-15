#!/usr/bin/env zsh

set -e

yarn run docs:build

# 进入生成的文件夹
cd ../docs/.vitepress/dist

# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy to the gh-pages'
