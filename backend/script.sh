#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

backend_dir="/app-backend"

handle_error() {
  echo -e "${RED}Error: $1${NC}"
  exit 1
}

if [ -d "$backend_dir/node_modules" ]; then
  rm -rf "$backend_dir/node_modules" || handle_error "Failed to delete the 'public' directory"
fi

if [ -f "$backend_dir/package-lock.json" ]; then
  rm "$backend_dir/package-lock.json" || handle_error "Failed to delete the 'public' directory"
fi

npm cache clean --force

echo -e "${GREEN}Step 3: Installing backend dependencies...${NC}"
(cd "$backend_dir" && npm install) || handle_error "Backend dependency installation failed"

echo -e "${GREEN}Step 4: Starting the backend...${NC}"
(cd "$backend_dir" && npm run start:dev) || handle_error "Backend start failed"