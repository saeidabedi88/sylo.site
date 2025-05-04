require('dotenv').config();

/**
 * Service for publishing content to various platforms
 */

// WordPress publishing
async function publishToWordPress(content) {
  try {
    console.log('Publishing to WordPress:', content.topic);
    
    // Getting required libraries
    const axios = require('axios');
    
    // WordPress configuration - use environment variable or default
    const wpBaseUrl = process.env.WP_SITE_URL || 'https://acetec.ca';
    const customApiUrl = `${wpBaseUrl}/wp-json/acetec/v1/post`;
    
    // API key authentication (from .env)
    const apiKey = process.env.WORDPRESS_API_KEY;
    if (!apiKey) {
      throw new Error('WordPress API key is required. Add WORDPRESS_API_KEY to .env file');
    }
    
    // Prepare post data
    const postData = {
      api_key: apiKey,
      title: content.topic,
      content: content.content,
      status: content.status || 'publish', // Allow draft status to be passed in
      category_id: content.categoryId || 5 // Allow category to be specified or use default
    };
    
    console.log(`Sending post to ${customApiUrl}`);
    
    // Create the post using the custom API
    const response = await axios.post(customApiUrl, postData);
    
    // Check response
    if (!response.data || !response.data.success) {
      throw new Error('Failed to publish post: ' + JSON.stringify(response.data));
    }
    
    console.log(`Successfully published to WordPress. Post ID: ${response.data.post_id}`);
    
    return {
      success: true,
      publishedUrl: response.data.post_url,
      postId: response.data.post_id
    };
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    
    // Fallback to mock success for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using fallback mock response for WordPress publishing');
      return {
        success: true,
        publishedUrl: `https://acetec.ca/blog/${encodeURIComponent(content.topic.toLowerCase().replace(/\s+/g, '-'))}`,
        mock: true
      };
    }
    
    throw new Error('Failed to publish to WordPress: ' + error.message);
  }
}

// Facebook publishing
async function publishToFacebook(content) {
  try {
    console.log('Publishing to Facebook:', content.topic);
    
    // Real Facebook API implementation
    const axios = require('axios');
    const graphApiVersion = 'v17.0';
    
    // For business pages, we need the page ID
    // This can be retrieved once and stored, but for now we'll use env var
    const fbPageId = process.env.FACEBOOK_PAGE_ID || '101189246087599'; // Default to a test page ID
    
    let postId;
    
    // If we have an image, publish with the image
    if (content.imageUrl) {
      // First, we need to download the image (it's an external URL from OpenAI)
      const imageResponse = await axios.get(content.imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageResponse.data, 'binary');
      
      // Create FormData object for the file upload
      const formData = new FormData();
      formData.append('source', buffer);
      formData.append('message', content.content);
      formData.append('access_token', process.env.FACEBOOK_ACCESS_TOKEN);
      
      // Post photo to Facebook
      const response = await axios.post(
        `https://graph.facebook.com/${graphApiVersion}/${fbPageId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      postId = response.data.id || response.data.post_id;
    } else {
      // If no image, just post the content as a status update
      const response = await axios.post(
        `https://graph.facebook.com/${graphApiVersion}/${fbPageId}/feed`,
        {
          message: content.content,
          access_token: process.env.FACEBOOK_ACCESS_TOKEN
        }
      );
      
      postId = response.data.id;
    }
    
    return {
      success: true,
      publishedUrl: `https://facebook.com/${postId}`
    };
  } catch (error) {
    console.error('Error publishing to Facebook:', error);
    
    // Fallback to mock success for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using fallback mock response for Facebook publishing');
      return {
        success: true,
        publishedUrl: 'https://facebook.com/acetec/posts/123456789',
        mock: true
      };
    }
    
    throw new Error('Failed to publish to Facebook');
  }
}

// Instagram publishing
async function publishToInstagram(content) {
  try {
    console.log('Publishing to Instagram:', content.topic);
    
    // Real Instagram Graph API implementation
    const axios = require('axios');
    const graphApiVersion = 'v17.0';
    
    // Instagram business account ID - either from env or stored value
    const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
    
    if (!igAccountId) {
      throw new Error('Instagram account ID is required. Set INSTAGRAM_ACCOUNT_ID in .env');
    }
    
    if (!content.imageUrl) {
      throw new Error('Instagram posts require an image');
    }
    
    // First, let's grab the caption and prepare it
    const caption = content.content;
    
    // Now create a container for the media post
    const containerResponse = await axios.post(
      `https://graph.facebook.com/${graphApiVersion}/${igAccountId}/media`, 
      {
        image_url: content.imageUrl,
        caption: caption,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
      }
    );
    
    if (!containerResponse.data || !containerResponse.data.id) {
      throw new Error('Failed to create Instagram media container');
    }
    
    const creationId = containerResponse.data.id;
    
    // Now publish the post using the creation ID
    const publishResponse = await axios.post(
      `https://graph.facebook.com/${graphApiVersion}/${igAccountId}/media_publish`,
      {
        creation_id: creationId,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
      }
    );
    
    // The response has the IG media ID
    const igMediaId = publishResponse.data.id;
    
    return {
      success: true,
      publishedUrl: `https://instagram.com/p/${igMediaId}`,
      mediaId: igMediaId
    };
  } catch (error) {
    console.error('Error publishing to Instagram:', error);
    
    // Fallback to mock success for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using fallback mock response for Instagram publishing');
      return {
        success: true,
        publishedUrl: 'https://instagram.com/p/Abc123Xyz',
        mock: true
      };
    }
    
    throw new Error('Failed to publish to Instagram');
  }
}

// Publish content based on platform
async function publishContent(content) {
  const { platform } = content;
  
  switch (platform) {
    case 'wordpress':
      return publishToWordPress(content);
    case 'facebook':
      return publishToFacebook(content);
    case 'instagram':
      return publishToInstagram(content);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

module.exports = {
  publishContent
}; 