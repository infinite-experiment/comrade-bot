#!/usr/bin/env bash
set -e

# 1) load .env if present
if [ -f .env ]; then
  set -a
  source ./.env
  set +a
fi

npm run dev