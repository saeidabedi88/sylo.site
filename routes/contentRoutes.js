const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const Content = require('../models/Content');
const openaiService = require('../services/openaiService');
const publishService = require('../services/publishService');
=======
const { Content } = require('../models');
const openaiService = require('../services/openaiService');
const publishService = require('../services/publishService');
const { authenticateToken, customerFilter, checkRole } = require('../middleware/auth');

// Apply authentication and customer filtering to all routes
router.use(authenticateToken);
router.use(customerFilter);
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e

// Get all content or filter by platform
router.get('/', async (req, res) => {
  try {
<<<<<<< HEAD
    const filter = {};
    
=======
    // Start with customer filter
    const filter = { ...req.customerFilter || {} };

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Add platform filter if provided
    if (req.query.platform && req.query.platform !== 'all') {
      filter.platform = req.query.platform;
    }
<<<<<<< HEAD
    
    const content = await Content.findAll({ 
      where: filter,
      order: [['publishDate', 'ASC']] 
    });
    
=======

    const content = await Content.findAll({
      where: filter,
      order: [['publishDate', 'ASC']]
    });

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Create new content
router.post('/', async (req, res) => {
  try {
    const { topic, keywords, platform, publishDate } = req.body;
<<<<<<< HEAD
    
    if (!topic || !platform || !publishDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
=======

    if (!topic || !platform || !publishDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    const newContent = await Content.create({
      topic,
      keywords,
      platform,
      publishDate,
<<<<<<< HEAD
      status: 'planned'
    });
    
=======
      status: 'planned',
      customer_id: req.user.customer_id
    });

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Create monthly content plan
router.post('/monthly-plan', async (req, res) => {
  try {
<<<<<<< HEAD
    const { 
      monthlyTheme, 
      packageSize, 
      startDate, 
      keywords, 
      distribution, 
      topicSuggestions 
    } = req.body;
    
    if (!monthlyTheme || !packageSize || !startDate || !distribution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
=======
    const {
      monthlyTheme,
      packageSize,
      startDate,
      keywords,
      distribution,
      topicSuggestions
    } = req.body;

    if (!monthlyTheme || !packageSize || !startDate || !distribution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Validate distribution counts
    const totalCount = distribution.wordpress + distribution.facebook + distribution.instagram;
    if (totalCount !== packageSize) {
      return res.status(400).json({ error: 'Distribution count does not match package size' });
    }
<<<<<<< HEAD
    
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Generate topics based on monthly theme using AI if no specific topics provided
    let topics = [];
    if (topicSuggestions && topicSuggestions.trim() !== '') {
      // Use provided topics
      topics = topicSuggestions.split('\n')
        .filter(topic => topic.trim() !== '')
        .map(topic => ({ topic }));
<<<<<<< HEAD
      
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
    
    // Create content items
    const contentItems = [];
    const startDateObj = new Date(startDate);
    
=======

    // Create content items
    const contentItems = [];
    const startDateObj = new Date(startDate);

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Calculate publishing dates and create content
    const platformTopics = {
      wordpress: topics.filter(topic => topic.platform === 'wordpress'),
      facebook: topics.filter(topic => topic.platform === 'facebook'),
      instagram: topics.filter(topic => topic.platform === 'instagram')
    };
<<<<<<< HEAD
    
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // If user provided topics without platform specification, 
    // assign them to platforms based on distribution
    if (topicSuggestions && topicSuggestions.trim() !== '') {
      let currentTopicIndex = 0;
<<<<<<< HEAD
      
      platformTopics.wordpress = [];
      platformTopics.facebook = [];
      platformTopics.instagram = [];
      
=======

      platformTopics.wordpress = [];
      platformTopics.facebook = [];
      platformTopics.instagram = [];

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
      
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
      
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
      
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
      // If not enough topics provided, fill with generic ones
      while (platformTopics.wordpress.length < distribution.wordpress) {
        platformTopics.wordpress.push({
          platform: 'wordpress',
          topic: `${monthlyTheme} - Blog ${platformTopics.wordpress.length + 1}`
        });
      }
<<<<<<< HEAD
      
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
      while (platformTopics.facebook.length < distribution.facebook) {
        platformTopics.facebook.push({
          platform: 'facebook',
          topic: `${monthlyTheme} - Facebook ${platformTopics.facebook.length + 1}`
        });
      }
<<<<<<< HEAD
      
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
      while (platformTopics.instagram.length < distribution.instagram) {
        platformTopics.instagram.push({
          platform: 'instagram',
          topic: `${monthlyTheme} - Instagram ${platformTopics.instagram.length + 1}`
        });
      }
    }
<<<<<<< HEAD
    
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // WordPress content (weekly spacing)
    for (let i = 0; i < distribution.wordpress; i++) {
      const publishDate = new Date(startDateObj);
      publishDate.setDate(publishDate.getDate() + (i * 7)); // Weekly spacing
<<<<<<< HEAD
      
      const topicData = platformTopics.wordpress[i];
      
=======

      const topicData = platformTopics.wordpress[i];

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
      const newContent = await Content.create({
        topic: topicData.topic,
        keywords,
        platform: 'wordpress',
        publishDate,
        status: 'planned'
      });
<<<<<<< HEAD
      
      contentItems.push(newContent);
    }
    
=======

      contentItems.push(newContent);
    }

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Facebook content (every 3-4 days)
    for (let i = 0; i < distribution.facebook; i++) {
      const publishDate = new Date(startDateObj);
      publishDate.setDate(publishDate.getDate() + (i * 3) + 1); // Every 3 days
<<<<<<< HEAD
      
      const topicData = platformTopics.facebook[i];
      
=======

      const topicData = platformTopics.facebook[i];

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
      const newContent = await Content.create({
        topic: topicData.topic,
        keywords,
        platform: 'facebook',
        publishDate,
        status: 'planned'
      });
<<<<<<< HEAD
      
      contentItems.push(newContent);
    }
    
=======

      contentItems.push(newContent);
    }

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Instagram content (every 3-4 days, offset by 1)
    for (let i = 0; i < distribution.instagram; i++) {
      const publishDate = new Date(startDateObj);
      publishDate.setDate(publishDate.getDate() + (i * 3) + 2); // Every 3 days, offset by 1
<<<<<<< HEAD
      
      const topicData = platformTopics.instagram[i];
      
=======

      const topicData = platformTopics.instagram[i];

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
      const newContent = await Content.create({
        topic: topicData.topic,
        keywords,
        platform: 'instagram',
        publishDate,
        status: 'planned'
      });
<<<<<<< HEAD
      
      contentItems.push(newContent);
    }
    
=======

      contentItems.push(newContent);
    }

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
=======

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Only generate if content is in 'planned' status
    if (content.status !== 'planned') {
      return res.status(400).json({ error: 'Content has already been generated' });
    }
<<<<<<< HEAD
    
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Call OpenAI service to generate content
    const generatedContent = await openaiService.generateContent({
      topic: content.topic,
      keywords: content.keywords,
      platform: content.platform
    });
<<<<<<< HEAD
    
=======

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Update content with generated text and image
    content.status = 'generated';
    content.content = generatedContent.content;
    content.imageUrl = generatedContent.imageUrl;
<<<<<<< HEAD
    
    await content.save();
    
=======

    await content.save();

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
=======

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Only allow editing if content is in 'generated' status
    if (content.status !== 'generated') {
      return res.status(400).json({ error: 'Only generated content can be edited' });
    }
<<<<<<< HEAD
    
    // Update content text
    content.content = req.body.content;
    await content.save();
    
=======

    // Update content text
    content.content = req.body.content;
    await content.save();

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    content.status = 'approved';
    await content.save();
    
=======

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    content.status = 'approved';
    await content.save();

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
=======

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    // Only allow publishing if content is in 'approved' status
    if (content.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved content can be published' });
    }
<<<<<<< HEAD
    
    // Call publishing service
    const publishResult = await publishService.publishContent(content);
    
    // Update content status
    content.status = 'published';
    await content.save();
    
=======

    // Call publishing service
    const publishResult = await publishService.publishContent(content);

    // Update content status
    content.status = 'published';
    await content.save();

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    await content.destroy();
    
=======

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await content.destroy();

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router; 