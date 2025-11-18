#!/bin/bash

# ORNUT E-commerce Deployment Script for EC2
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting ORNUT deployment..."

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure it with your credentials"
    echo "Run: cp .env.example .env && nano .env"
    exit 1
fi

echo -e "${GREEN}✓${NC} .env file found"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Error: Node.js 20.x or higher is required${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js version OK: $(node -v)"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✓${NC} Dependencies installed"

# Push database schema
echo -e "${YELLOW}🗄️  Setting up database schema...${NC}"
npm run db:push

echo -e "${GREEN}✓${NC} Database schema updated"

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

echo -e "${GREEN}✓${NC} Application built successfully"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📌 PM2 not found. Installing PM2...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}✓${NC} PM2 installed"
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "ornut"; then
    echo -e "${YELLOW}🔄 Stopping existing application...${NC}"
    pm2 stop ornut
    pm2 delete ornut
fi

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 start npm --name "ornut" -- start

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✓${NC} Application started successfully"

# Display status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application Status:"
pm2 status

echo ""
echo "Useful commands:"
echo "  View logs:    pm2 logs ornut"
echo "  Restart app:  pm2 restart ornut"
echo "  Stop app:     pm2 stop ornut"
echo "  Monitor:      pm2 monit"
echo ""
echo -e "${GREEN}Your application is now running on port 5000${NC}"
