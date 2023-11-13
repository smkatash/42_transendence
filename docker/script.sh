#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

frontend_dir="/app/frontend"
backend_dir="/app/backend"

handle_error() {
  echo -e "${RED}Error: $1${NC}"
  exit 1
}

echo "                  "
echo "                  "
echo "                  "
echo "   ________ "
echo "  |     o  |"
echo "  |        |"
echo "  |        |"
echo "  |________|"
echo "                  "
echo "                  "
echo "                  "

if [ -d "$frontend_dir/dist" ]; then
  rm -rf "$frontend_dir/dist" || handle_error "Failed to delete the 'dist' directory"
fi

if [ -d "$backend_dir/public" ]; then
  rm -rf "$backend_dir/public" || handle_error "Failed to delete the 'public' directory"
fi

# Step 1: Build the frontend
echo -e "${GREEN}Step 1: Building the frontend...${NC}"
(cd "$frontend_dir" && npm install && npm run build:development) || handle_error "Frontend build failed"

echo "                  "
echo "                  "
echo "                  "
echo "   ________ "
echo "  |        |"
echo "  |    o   |"
echo "  |        |"
echo "  |________|"
echo "                  "
echo "                  "
echo "                  "

# Step 2: Move the frontend build to the backend's public directory
echo -e "${GREEN}Step 2: Moving the frontend build to the backend's public directory...${NC}"
mv "$frontend_dir/dist/" "$backend_dir/public/" || handle_error "Move operation failed"

echo "                  "
echo "                  "
echo "                  "
echo "   ________ "
echo "  |        |"
echo "  |        |"
echo "  |   o    |"
echo "  |________|"
echo "                  "
echo "                  "
echo "                  "

# Step 3: Install backend dependencies
echo -e "${GREEN}Step 3: Installing backend dependencies...${NC}"
(cd "$backend_dir" && npm install) || handle_error "Backend dependency installation failed"

echo "                  "
echo "                  "
echo "                  "
echo "   ________ "
echo "  |        |"
echo "  |        |"
echo "  | o      |"
echo "  |________|"
echo "                  "
echo "                  "
echo "                  "

# Step 4: Start the backend
echo -e "${GREEN}Step 4: Starting the backend...${NC}"
(cd "$backend_dir" && npm run start) || handle_error "Backend start failed"

