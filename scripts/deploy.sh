#!/bin/bash

# Deployment script with rollback support
# Usage: ./deploy.sh [branch/tag] [rollback]
# Example: 
#   Deploy: ./deploy.sh main
#   Deploy specific version: ./deploy.sh v2.02
#   Rollback: ./deploy.sh main rollback

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sylo-site"
DEPLOY_PATH="/home/sylo/sylo.site"
BACKUP_PATH="/home/sylo/backups"
LOG_PATH="/home/sylo/logs"

# Create necessary directories
mkdir -p $BACKUP_PATH $LOG_PATH

# Get target branch/tag and check if this is a rollback
TARGET=${1:-"main"}
IS_ROLLBACK=${2:-""}

timestamp() {
    date +"%Y%m%d_%H%M%S"
}

log_message() {
    echo -e "${2:-$YELLOW}$1${NC}"
    echo "$(timestamp) - $1" >> "$LOG_PATH/deploy.log"
}

backup_current_version() {
    local BACKUP_NAME="backup_$(timestamp)"
    log_message "Creating backup: $BACKUP_NAME"
    
    # Create backup directory
    mkdir -p "$BACKUP_PATH/$BACKUP_NAME"
    
    # Backup code
    cp -r $DEPLOY_PATH/* "$BACKUP_PATH/$BACKUP_NAME/"
    
    # Backup environment variables
    if [ -f "$DEPLOY_PATH/.env" ]; then
        cp "$DEPLOY_PATH/.env" "$BACKUP_PATH/$BACKUP_NAME/"
    fi
    
    # Save current git commit hash
    git rev-parse HEAD > "$BACKUP_PATH/$BACKUP_NAME/version.txt"
    
    echo "$BACKUP_NAME"
}

rollback_to_backup() {
    local BACKUP_NAME=$1
    log_message "Rolling back to backup: $BACKUP_NAME" "$RED"
    
    # Stop the application
    pm2 stop $APP_NAME || true
    
    # Restore from backup
    cp -r "$BACKUP_PATH/$BACKUP_NAME/"* $DEPLOY_PATH/
    
    # Start the application
    pm2 start app.js --name "$APP_NAME" --time
    
    log_message "Rollback completed successfully" "$GREEN"
}

deploy() {
    log_message "Starting deployment of $TARGET..."
    
    # Create backup before deployment
    local BACKUP_NAME=$(backup_current_version)
    
    # Stop the current process
    pm2 stop $APP_NAME || true
    
    # Update code
    log_message "Fetching latest changes..."
    git fetch --all --tags --prune
    
    # Checkout target branch/tag
    log_message "Checking out $TARGET..."
    if git checkout $TARGET; then
        log_message "Successfully checked out $TARGET" "$GREEN"
    else
        log_message "Failed to checkout $TARGET" "$RED"
        rollback_to_backup $BACKUP_NAME
        exit 1
    fi
    
    # Install dependencies
    log_message "Installing dependencies..."
    if npm install --production; then
        log_message "Dependencies installed successfully" "$GREEN"
    else
        log_message "Failed to install dependencies" "$RED"
        rollback_to_backup $BACKUP_NAME
        exit 1
    fi
    
    # Start the application
    log_message "Starting application..."
    if pm2 start app.js --name "$APP_NAME" --time; then
        log_message "Application started successfully" "$GREEN"
    else
        log_message "Failed to start application" "$RED"
        rollback_to_backup $BACKUP_NAME
        exit 1
    fi
    
    # Monitor for startup errors
    sleep 5
    if ! pm2 show $APP_NAME | grep -q "online"; then
        log_message "Application failed to start properly" "$RED"
        rollback_to_backup $BACKUP_NAME
        exit 1
    fi
    
    log_message "Deployment completed successfully!" "$GREEN"
    
    # Keep only last 5 backups
    cd $BACKUP_PATH && ls -t | tail -n +6 | xargs rm -rf
}

# Main execution
if [ "$IS_ROLLBACK" = "rollback" ]; then
    LATEST_BACKUP=$(cd $BACKUP_PATH && ls -t | head -n 1)
    if [ -n "$LATEST_BACKUP" ]; then
        rollback_to_backup $LATEST_BACKUP
    else
        log_message "No backup found for rollback" "$RED"
        exit 1
    fi
else
    deploy
fi 