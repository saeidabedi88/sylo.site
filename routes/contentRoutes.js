const express = require('express');
const router = express.Router();
const { Content } = require('../models');
const openaiService = require('../services/openaiService');
const publishService = require('../services/publishService');
const { authenticateToken, customerFilter, checkRole } = require('../middleware/auth');

// Apply authentication and customer filtering to all routes
router.use(authenticateToken);
router.use(customerFilter);

// Get all content or filter by platform
router.get('/', async (req, res) => {
  try {
    // Start with customer filter
    const filter = { ...req.customerFilter || {} };

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
    const { topic, keywords, platform, publishDate } = req.body;

    if (!topic || !platform || !publishDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newContent = await Content.create({
      topic,
      keywords,
      platform,
      publishDate,
      status: 'planned',
      customer_id: req.user.customer_id
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
      topicSuggestions
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
          topic: `${monthlyTheme} - Social Update ${platformTopics.facebook.length + 1}`
        });
      }

      while (platformTopics.instagram.length < distribution.instagram) {
        platformTopics.instagram.push({
          platform: 'instagram',
          topic: `${monthlyTheme} - Visual Story ${platformTopics.instagram.length + 1}`
        });
      }
    }

    // Create content items with proper spacing
    let currentDate = new Date(startDateObj);

    // WordPress posts - spaced weekly
    for (const topic of platformTopics.wordpress) {
      contentItems.push({
        topic: topic.topic,
        platform: 'wordpress',
        publishDate: new Date(currentDate),
        status: 'planned',
        customer_id: req.user.customer_id
      });
      currentDate.setDate(currentDate.getDate() + 7); // Add 7 days
    }

    // Reset date for social media posts
    currentDate = new Date(startDateObj);
    currentDate.setDate(currentDate.getDate() + 2); // Start social posts 2 days after first blog

    // Facebook posts - spaced 3-4 days apart
    for (const topic of platformTopics.facebook) {
      contentItems.push({
        topic: topic.topic,
        platform: 'facebook',
        publishDate: new Date(currentDate),
        status: 'planned',
        customer_id: req.user.customer_id
      });
      currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 2) + 3); // Add 3-4 days
    }

    // Instagram posts - spaced 2-3 days apart
    currentDate = new Date(startDateObj);
    currentDate.setDate(currentDate.getDate() + 1); // Start Instagram posts 1 day after first blog

    for (const topic of platformTopics.instagram) {
      contentItems.push({
        topic: topic.topic,
        platform: 'instagram',
        publishDate: new Date(currentDate),
        status: 'planned',
        customer_id: req.user.customer_id
      });
      currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 2) + 2); // Add 2-3 days
    }

    // Bulk create all content items
    const createdContent = await Content.bulkCreate(contentItems);

    res.status(201).json(createdContent);
  } catch (error) {
    console.error('Error creating content plan:', error);
    res.status(500).json({ error: 'Failed to create content plan' });
  }
});

// Generate content for a specific item
router.post('/:id/generate', async (req, res) => {
  try {
    const content = await Content.findOne({
      where: {
        id: req.params.id,
        customer_id: req.user.customer_id
      }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const generatedContent = await openaiService.generateContent({
      topic: content.topic,
      platform: content.platform,
      keywords: content.keywords
    });

    await content.update({
      content: generatedContent.content,
      imageUrl: generatedContent.imageUrl,
      status: 'generated'
    });

    res.json(content);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Publish content
router.post('/:id/publish', async (req, res) => {
  try {
    const content = await Content.findOne({
      where: {
        id: req.params.id,
        customer_id: req.user.customer_id
      }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.status !== 'generated') {
      return res.status(400).json({ error: 'Content must be generated before publishing' });
    }

    const publishResult = await publishService.publishContent(content);

    await content.update({
      status: 'published',
      publishedUrl: publishResult.url
    });

    res.json(content);
  } catch (error) {
    console.error('Error publishing content:', error);
    res.status(500).json({ error: 'Failed to publish content' });
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