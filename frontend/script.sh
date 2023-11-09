#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

frontend_dir="/app-frontend"

handle_error() {
  echo -e "${RED}Error: $1${NC}"
  exit 1
}

if [ -d "$frontend_dir/node_modules" ]; then
  rm -rf "$frontend_dir/node_modules" || handle_error "Failed to delete the 'node_modules' directory"
fi

if [ -f "$frontend_dir/package-lock.json" ]; then
  rm "$frontend_dir/package-lock.json" || handle_error "Failed to delete the 'node_modules' directory"
fi

npm cache clean --force

echo -e "${GREEN}Building the frontend...${NC}"
(cd "$frontend_dir" && npm install --force && npm run start) || handle_error "Frontend build failed"

