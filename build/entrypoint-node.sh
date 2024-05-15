#!/bin/bash

cd /app
if [ ! -f package.json ]; then
  rm .gitkeep
  bun create vite . --template react-ts
fi
bun install
bun run dev --port 3000 --host
