#!/usr/bin/env node

/**
 * Script to publish content scheduled for today
 * This script can be run via cron job once a day
 * Example cron entry: 0 9 * * * cd /path/to/app && node scripts/publishScheduled.js
 */

require('dotenv').config();
const scheduleService = require('../services/scheduleService');

async function run() {
  console.log('Starting scheduled publishing job...');
  console.log('Time:', new Date().toISOString());
  
  try {
    const result = await scheduleService.publishScheduledContent();
    console.log(`Publishing job completed. Attempted to publish ${result.scheduled} items. Successfully published ${result.published} items.`);
    process.exit(0);
  } catch (error) {
    console.error('Error running publishing job:', error);
    process.exit(1);
  }
}

// Run the script
run(); 