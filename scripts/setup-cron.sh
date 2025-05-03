#!/bin/bash

# Create scripts directory if it doesn't exist
mkdir -p ~/apps/content-manager/scripts

# Make the publish script executable
chmod +x ~/apps/content-manager/scripts/publishScheduled.js

# Set up cron job to run daily at 9 AM
CRON_JOB="0 9 * * * cd ~/apps/content-manager && node scripts/publishScheduled.js >> ~/apps/content-manager/logs/publish.log 2>&1"

# Create logs directory if it doesn't exist
mkdir -p ~/apps/content-manager/logs

# Check if the cron job is already in the crontab
if (crontab -l | grep -q "publishScheduled.js"); then
  echo "Cron job already exists"
else
  # Add the cron job to the crontab
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo "Cron job added to crontab"
fi

echo "Setup complete! The publishing job will run daily at 9:00 AM." 