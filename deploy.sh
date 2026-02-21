#!/bin/bash
set -e

DOMAIN="sunlight.latrup.net"
REMOTE_HOST="latrup"
REMOTE_PATH="/var/www/${DOMAIN}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  Deploying to ${DOMAIN}${NC}"
echo -e "${BLUE}===========================================${NC}"

echo -e "${BLUE}[1/2] Building...${NC}"
npm run build

echo -e "${BLUE}[2/2] Syncing to server...${NC}"
rsync -avz --delete \
  --exclude='.DS_Store' \
  ./build/ \
  "${REMOTE_HOST}:${REMOTE_PATH}/"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}  Deployed to https://${DOMAIN}${NC}"
echo -e "${GREEN}===========================================${NC}"
