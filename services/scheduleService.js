require('dotenv').config();
const Content = require('../models/Content');
const publishService = require('./publishService');

/**
 * Service to handle scheduled publishing of content
 */

// Check for content scheduled for today and publish it
async function publishScheduledContent() {
  try {
    console.log('Checking for scheduled content to publish...');
    
    // Get current date (midnight, local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get end of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find content scheduled for today that is approved but not published
    const scheduledContent = await Content.findAll({
      where: {
        publishDate: {
          $gte: today,
          $lt: tomorrow
        },
        status: 'approved'
      }
    });
    
    console.log(`Found ${scheduledContent.length} items scheduled for today`);
    
    // Publish each item
    for (const content of scheduledContent) {
      try {
        console.log(`Publishing scheduled content: ${content.id} - ${content.topic} (${content.platform})`);
        
        // Call publishing service
        const publishResult = await publishService.publishContent(content);
        
        // Update content status
        content.status = 'published';
        await content.save();
        
        console.log(`Successfully published content: ${content.id}`);
      } catch (error) {
        console.error(`Error publishing content ${content.id}:`, error);
      }
    }
    
    return {
      scheduled: scheduledContent.length,
      published: scheduledContent.filter(c => c.status === 'published').length
    };
  } catch (error) {
    console.error('Error in scheduled publishing:', error);
    throw new Error('Failed to process scheduled content');
  }
}

module.exports = {
  publishScheduledContent
}; 