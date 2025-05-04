#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Initialize error counter
ERRORS=0

check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}Error: Required file $1 is missing${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    else
        echo -e "${GREEN}✓ Found $1${NC}"
        return 0
    fi
}

check_directory() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}Error: Required directory $1 is missing${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    else
        echo -e "${GREEN}✓ Found directory $1${NC}"
        return 0
    fi
}

echo -e "${YELLOW}Checking required files and configurations...${NC}"

# Check core files
check_file "package.json"
check_file "app.js"

# Check required directories
check_directory "config"
check_directory "middleware"
check_directory "models"
check_directory "routes"
check_directory "views"
check_directory "scripts"

# Check package.json for required dependencies
echo -e "\n${YELLOW}Checking required dependencies...${NC}"
REQUIRED_DEPS=(
    "express"
    "sequelize"
    "sqlite3"
    "jsonwebtoken"
    "bcrypt"
    "nodemailer"
    "pm2"
)

for dep in "${REQUIRED_DEPS[@]}"; do
    if ! grep -q "\"$dep\":" package.json; then
        echo -e "${RED}Error: Required dependency $dep is not in package.json${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ Found dependency $dep${NC}"
    fi
done

# Final report
echo -e "\n${YELLOW}Validation complete.${NC}"
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}Found $ERRORS error(s). Please fix them before deploying.${NC}"
    exit 1
else
    echo -e "${GREEN}All checks passed successfully!${NC}"
    exit 0
fi 