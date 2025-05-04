const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const openaiService = require('../services/openaiService');
const publishService = require('../services/publishService');

// Get all content or filter by platform
router.get('/', async (req, res) => {
  try {
    const filter = {};
    
    // Add platform filter if provided
    if (req.query.platform && req.query.platform !== 'all') {
      filter.platform = req.query.platform;
    }
    
    const content = await Content.findAll({ 
      where: filter,
      order: [['publishDate', 'ASC']] 
    });
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Create new content
router.post('/', async (req, res) => {
  try {
    const { topic, keywords, platform, publishDate, clientId } = req.body;
    
    if (!topic || !platform || !publishDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newContent = await Content.create({
      topic,
      keywords,
      platform,
      publishDate,
      clientId,
      status: 'planned'
    });
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Create monthly content plan
router.post('/monthly-plan', async (req, res) => {
  try {
    const { 
      monthlyTheme, 
      packageSize, 
      startDate, 
      keywords, 
      distribution, 
      topicSuggestions,
      clientId 
    } = req.body;
    
    if (!monthlyTheme || !packageSize || !startDate || !distribution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate distribution counts
    const totalCount = distribution.wordpress + distribution.facebook + distribution.instagram;
    if (totalCount !== packageSize) {
      return res.status(400).json({ error: 'Distribution count does not match package size' });
    }
    
    // Generate topics based on monthly theme using AI if no specific topics provided
    let topics = [];
    if (topicSuggestions && topicSuggestions.trim() !== '') {
      // Use provided topics
      topics = topicSuggestions.split('\n')
        .filter(topic => topic.trim() !== '')
        .map(topic => ({ topic }));
      
      // Assign platforms later in the code
    } else {
      // Generate diverse topics with AI
      topics = await openaiService.generateContentTopics({
        monthlyTheme,
        packageSize,
        keywords,
        distribution
      });
    }
    
    // Create content items
    const contentItems = [];
    const startDateObj = new Date(startDate);
    
    // Calculate publishing dates and create content
    const platformTopics = {
      wordpress: topics.filter(topic => topic.platform === 'wordpress'),
      facebook: topics.filter(topic => topic.platform === 'facebook'),
      instagram: topics.filter(topic => topic.platform === 'instagram')
    };
    
    // If user provided topics without platform specification, 
    // assign them to platforms based on distribution
    if (topicSuggestions && topicSuggestions.trim() !== '') {
      let currentTopicIndex = 0;
      
      platformTopics.wordpress = [];
      platformTopics.facebook = [];
      platformTopics.instagram = [];
      
      // Assign to WordPress
      for (let i = 0; i < distribution.wordpress; i++) {
        if (currentTopicIndex < topics.length) {
          platformTopics.wordpress.push({
            platform: 'wordpress',
            topic: topics[currentTopicIndex].topic
          });
          currentTopicIndex++;
        }
      }
      
      // Assign to Facebook
      for (let i = 0; i < distribution.facebook; i++) {
        if (currentTopicIndex < topics.length) {
          platformTopics.facebook.push({
            platform: 'facebook',
            topic: topics[currentTopicIndex].topic
          });
          currentTopicIndex++;
        }
      }
      
      // Assign to Instagram
      for (let i = 0; i < distribution.instagram; i++) {
        if (currentTopicIndex < topics.length) {
          platformTopics.instagram.push({
            platform: 'instagram',
            topic: topics[currentTopicIndex].topic
          });
          currentTopicIndex++;
        }
      }
      
      // If not enough topics provided, fill with generic ones
      while (platformTopics.wordpress.length < distribution.wordpress) {
        platformTopics.wordpress.push({
          platform: 'wordpress',
          topic: `${monthlyTheme} - Blog ${platformTopics.wordpress.length + 1}`
        });
      }
      
      while (platformTopics.facebook.length < distribution.facebook) {
        platformTopics.facebook.push({
          platform: 'facebook',
          topic: `${monthlyTheme} - Facebook ${platformTopics.facebook.length + 1}`
        });
      }
      
      while (platformTopics.instagram.length < distribution.instagram) {
        platformTopics.instagram.push({
          platform: 'instagram',
          topic: `${monthlyTheme} - Instagram ${platformTopics.instagram.length + 1}`
        });
      }
    }
    
    // WordPress content (weekly spacing)
    for (let i = 0; i < distribution.wordpress; i++) {
      const publishDate = new Date(startDateObj);
      publishDate.setDate(publishDate.getDate() + (i * 7)); // Weekly spacing
      
      const topicData = platformTopics.wordpress[i];
      
      const newContent = await Content.create({
        topic: topicData.topic,
        keywords,
        platform: 'wordpress',
        publishDate,
        clientId,
        status: 'planned'
      });
      
      contentItems.push(newContent);
    }
    
    // Facebook content (every 3-4 days)
    for (let i = 0; i < distribution.facebook; i++) {
      const publishDate = new Date(startDateObj);
      publishDate.setDate(publishDate.getDate() + (i * 3) + 1); // Every 3 days
      
      const topicData = platformTopics.facebook[i];
      
      const newContent = await Content.create({
        topic: topicData.topic,
        keywords,
        platform: 'facebook',
        publishDate,
        clientId,
        status: 'planned'
      });
      
      contentItems.push(newContent);
    }
    
    // Instagram content (every 3-4 days, offset by 1)
    for (let i = 0; i < distribution.instagram; i++) {
      const publishDate = new Date(startDateObj);
      publishDate.setDate(publishDate.getDate() + (i * 3) + 2); // Every 3 days, offset by 1
      
      const topicData = platformTopics.instagram[i];
      
      const newContent = await Content.create({
        topic: topicData.topic,
        keywords,
        platform: 'instagram',
        publishDate,
        clientId,
        status: 'planned'
      });
      
      contentItems.push(newContent);
    }
    
    res.status(201).json(contentItems);
  } catch (error) {
    console.error('Error creating monthly plan:', error);
    res.status(500).json({ error: 'Failed to create monthly plan' });
  }
});

// Generate content with OpenAI
router.post('/:id/generate', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Only generate if content is in 'planned' status
    if (content.status !== 'planned') {
      return res.status(400).json({ error: 'Content has already been generated' });
    }
    
    // Call OpenAI service to generate content
    const generatedContent = await openaiService.generateContent({
      topic: content.topic,
      keywords: content.keywords,
      platform: content.platform,
      clientId: content.clientId
    });
    
    // Update content with generated text, structured JSON, and image
    content.status = 'generated';
    content.content = generatedContent.content;
    content.contentJson = generatedContent.contentJson;
    content.imageUrl = generatedContent.imageUrl;
    
    await content.save();
    
    res.json(content);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Edit content text
router.post('/:id/edit', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Only allow editing if content is in 'generated' status
    if (content.status !== 'generated') {
      return res.status(400).json({ error: 'Only generated content can be edited' });
    }
    
    // Update content text
    content.content = req.body.content;
    await content.save();
    
    res.json(content);
  } catch (error) {
    console.error('Error editing content:', error);
    res.status(500).json({ error: 'Failed to edit content' });
  }
});

// Approve content
router.post('/:id/approve', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    content.status = 'approved';
    await content.save();
    
    res.json(content);
  } catch (error) {
    console.error('Error approving content:', error);
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

// Publish content
router.post('/:id/publish', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Only allow publishing if content is in 'approved' status
    if (content.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved content can be published' });
    }
    
    // Call publishing service
    const publishResult = await publishService.publishContent(content);
    
    // Update content status
    content.status = 'published';
    await content.save();
    
    res.json({
      content,
      publishResult
    });
  } catch (error) {
    console.error('Error publishing content:', error);
    res.status(500).json({ error: 'Failed to publish content' });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    await content.destroy();
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router; 