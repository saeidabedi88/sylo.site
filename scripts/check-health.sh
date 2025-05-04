#!/bin/bash

# Health check script
# This script verifies that the application is running correctly after deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_NAME="sylo-site"
MAX_RETRIES=5
RETRY_INTERVAL=10
LOG_PATH="/home/sylo/logs"

log_message() {
    echo -e "${2:-$YELLOW}$1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_PATH/health-check.log"
}

# Check if the application process is running
check_process() {
    if pm2 show $APP_NAME | grep -q "online"; then
        log_message "Process check: OK" "$GREEN"
        return 0
    else
        log_message "Process check: Failed - Application is not running" "$RED"
        return 1
    fi
}

# Check if the application is responding to HTTP requests
check_http() {
    local PORT=$(grep PORT .env | cut -d '=' -f2)
    PORT=${PORT:-3000}
    
    if curl -s -f "http://localhost:$PORT/health" > /dev/null; then
        log_message "HTTP check: OK" "$GREEN"
        return 0
    else
        log_message "HTTP check: Failed - Application is not responding" "$RED"
        return 1
    fi
}

# Check memory usage
check_memory() {
    local MEMORY_USAGE=$(pm2 jlist | jq ".[] | select(.name == \"$APP_NAME\") | .monit.memory" | awk '{ printf "%.2f", $1/1024/1024 }')
    if [ $(echo "$MEMORY_USAGE > 500" | bc -l) -eq 1 ]; then
        log_message "Memory check: Warning - High memory usage (${MEMORY_USAGE}MB)" "$YELLOW"
    else
        log_message "Memory check: OK (${MEMORY_USAGE}MB)" "$GREEN"
    fi
}

# Check disk space
check_disk() {
    local DISK_USAGE=$(df -h / | awk 'NR==2 {print int($5)}')
    if [ "$DISK_USAGE" -gt 85 ]; then
        log_message "Disk check: Warning - High disk usage (${DISK_USAGE}%)" "$YELLOW"
    else
        log_message "Disk check: OK (${DISK_USAGE}%)" "$GREEN"
    fi
}

# Main health check
main() {
    log_message "Starting health check..."
    
    local RETRY_COUNT=0
    local ALL_CHECKS_PASSED=false
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if check_process && check_http; then
            ALL_CHECKS_PASSED=true
            break
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            log_message "Retrying in $RETRY_INTERVAL seconds... (Attempt $RETRY_COUNT of $MAX_RETRIES)"
            sleep $RETRY_INTERVAL
        fi
    done
    
    # Run additional checks that don't affect the exit status
    check_memory
    check_disk
    
    if [ "$ALL_CHECKS_PASSED" = true ]; then
        log_message "Health check completed successfully!" "$GREEN"
        exit 0
    else
        log_message "Health check failed after $MAX_RETRIES attempts" "$RED"
        exit 1
    fi
}

main 