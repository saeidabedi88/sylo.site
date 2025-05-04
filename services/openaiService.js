const { OpenAI } = require('openai');
const Client = require('../models/Client');

// Initialize OpenAI client with organization ID (if provided in env) and timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Add organization ID if provided
  timeout: 60000 // 60 seconds timeout
});

/**
 * Generate diverse content topics based on a monthly theme
 * @param {Object} planInfo - Information about the content plan
 * @returns {Array} Array of diverse topic suggestions
 */
async function generateContentTopics(planInfo) {
  try {
    const { monthlyTheme, packageSize, keywords, distribution } = planInfo;
    
    // Generate topic suggestions using GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a content strategist who creates diverse, creative topic ideas for content calendars. Your job is to generate unique, engaging topics for different platforms based on a monthly theme."
        },
        {
          role: "user", 
          content: `Create diverse content topics based on the monthly theme: "${monthlyTheme}".
          
          I need:
          - ${distribution.wordpress} WordPress blog post topics (more in-depth, educational)
          - ${distribution.facebook} Facebook post topics (conversational, engagement-focused)
          - ${distribution.instagram} Instagram post topics (visual, trendy, hashtag-friendly)
          
          The topics should vary but all relate to the monthly theme. If relevant, incorporate these keywords: ${keywords || monthlyTheme}.
          
          Format your response as a list of topics, each with a platform (wordpress, facebook, or instagram) and a topic title.`
        }
      ]
    });
    
    // Get response content
    const responseText = completion.choices[0].message.content;
    
    // Parse the response into topics
    // This manually parses the text response into platform-specific topics
    const lines = responseText.split('\n').filter(line => line.trim() !== '');
    const topics = [];
    
    let currentPlatform = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is a platform heading
      if (trimmedLine.toLowerCase().includes('wordpress')) {
        currentPlatform = 'wordpress';
        continue;
      } else if (trimmedLine.toLowerCase().includes('facebook')) {
        currentPlatform = 'facebook';
        continue;
      } else if (trimmedLine.toLowerCase().includes('instagram')) {
        currentPlatform = 'instagram';
        continue;
      }
      
      // Skip lines that are likely headers or formatting
      if (trimmedLine.startsWith('#') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        // Extract topic from bullet points if present
        const match = trimmedLine.match(/[-*\d.]+\s+(.*)/);
        if (match && match[1] && currentPlatform) {
          topics.push({
            platform: currentPlatform,
            topic: match[1].trim()
          });
        }
        continue;
      }
      
      // If we have a current platform and this line isn't empty, add it as a topic
      if (currentPlatform && trimmedLine && !trimmedLine.toLowerCase().includes('topic')) {
        topics.push({
          platform: currentPlatform,
          topic: trimmedLine
        });
      }
    }
    
    // Since the type errors are likely due to TypeScript inference issues in a JavaScript file,
    // we'll use filter with explicit type guards to satisfy the type checker
    const wordpressTopics = topics
      .filter(t => typeof t === 'object' && t !== null && 'platform' in t && t.platform === 'wordpress')
      .slice(0, distribution.wordpress);
    
    const facebookTopics = topics
      .filter(t => typeof t === 'object' && t !== null && 'platform' in t && t.platform === 'facebook')
      .slice(0, distribution.facebook);
    
    const instagramTopics = topics
      .filter(t => typeof t === 'object' && t !== null && 'platform' in t && t.platform === 'instagram')
      .slice(0, distribution.instagram);
    
    // Fill in any missing topics with generic ones
    while (wordpressTopics.length < distribution.wordpress) {
      wordpressTopics.push({
        platform: 'wordpress',
        topic: `${monthlyTheme} - Blog Post ${wordpressTopics.length + 1}`
      });
    }
    
    while (facebookTopics.length < distribution.facebook) {
      facebookTopics.push({
        platform: 'facebook',
        topic: `${monthlyTheme} - Facebook Post ${facebookTopics.length + 1}`
      });
    }
    
    while (instagramTopics.length < distribution.instagram) {
      instagramTopics.push({
        platform: 'instagram',
        topic: `${monthlyTheme} - Instagram Post ${instagramTopics.length + 1}`
      });
    }
    
    // Combine all topics
    return [...wordpressTopics, ...facebookTopics, ...instagramTopics];
  } catch (error) {
    console.error('Error generating content topics:', error);
    throw new Error('Failed to generate content topics');
  }
}

/**
 * Helper function to extract image URL from gpt-image-1 response
 * @param {Object} imageResponse - Response from image generation API
 * @returns {string|null} Base64 image URL or null if not available
 */
function getImageUrl(imageResponse) {
  // Check if response exists and has data array
  if (imageResponse && imageResponse.data && imageResponse.data[0]) {
    // For gpt-image-1 which returns base64 data
    if (imageResponse.data[0].b64_json) {
      return `data:image/png;base64,${imageResponse.data[0].b64_json}`;
    }
  }
  
  console.error('Invalid image response format:', JSON.stringify(imageResponse));
  return null;
}

/**
 * Generate structured image prompt based on topic and platform
 * @param {string} topic - Content topic
 * @param {string} platform - Platform (wordpress, facebook, instagram)
 * @returns {string} Structured image prompt
 */
function generateImagePrompt(topic, platform, clientName = 'Acetec') {
  let sceneAction, setting, platformSpecifics;
  
  // Determine if topic is about security, lighting, automation, or other
  const isAboutSecurity = /security|camera|motion|sensor|alarm|detect/i.test(topic);
  const isAboutLighting = /light|illuminat|glow|bright|lamp/i.test(topic);
  const isAboutAutomation = /automat|smart|control|remote|voice|assistant/i.test(topic);
  
  // Set scene action based on topic focus
  if (isAboutSecurity) {
    sceneAction = "A homeowner checking a smartphone app showing security camera feeds";
  } else if (isAboutLighting) {
    sceneAction = "Smart lights automatically illuminating as a person enters a room";
  } else if (isAboutAutomation) {
    sceneAction = "A person using voice commands to control multiple smart home devices";
  } else {
    sceneAction = "A family enjoying their modern smart home with various connected devices";
  }
  
  // Set setting based on platform
  if (platform === 'wordpress') {
    setting = "in a modern, upscale residential home with sleek architecture";
    platformSpecifics = "Clean, professional lighting with subtle branding elements. Designed for a blog post header. Focus on technical details and clarity.";
  } else if (platform === 'facebook') {
    setting = "in a warm, inviting living space with contemporary furniture";
    platformSpecifics = "Bright, eye-catching colors with strong visual impact. Designed for social media scrolling. Focus on emotional connection and lifestyle benefits.";
  } else { // instagram
    setting = "in a stylish, magazine-worthy home interior with aesthetic appeal";
    platformSpecifics = "Highly visual, Instagram-worthy composition with trendy elements. Designed for visual discovery. Focus on aspirational lifestyle and visual storytelling.";
  }
  
  return `${sceneAction} ${setting}. The scene shows ${clientName} security products seamlessly integrated into daily life. ${platformSpecifics} Clean, realistic lighting. No text or logos. 1024x1024.`;
}

/**
 * Generate platform-specific structured content using client profile
 * @param {Object} contentInfo - Information about the content to generate
 * @returns {Object} Generated structured content and image URL
 */
async function generateStructuredContent(contentInfo) {
  try {
    const { topic, keywords, platform, clientId } = contentInfo;
    
    // Get client profile or use default if not specified
    let clientProfile = {
      client_name: "Acetec.ca",
      tone: "professional, trustworthy, and supportive",
      audience: "general public, families, and caregivers",
      cta: "Learn more at acetec.ca",
      hashtags: ["#acetec", "#independentliving", "#sharedservices"]
    };
    
    // If clientId is provided, fetch the client profile
    if (clientId) {
      const client = await Client.findByPk(clientId);
      if (client && client.config) {
        clientProfile = {
          client_name: client.name,
          ...client.config
        };
      }
    }
    
    // Convert hashtags to JSON string for prompt
    const hashtagsJson = JSON.stringify(clientProfile.hashtags);
    
    // Unified prompt for all platforms
    const promptTemplate = `You are a content generator for ${clientProfile.client_name}.

Write content in a ${clientProfile.tone} tone for an audience of ${clientProfile.audience}.

Generate content for the topic: "${topic}" ${keywords ? `with these keywords: ${keywords}` : ''}.

Return structured JSON with platform-specific outputs:

{
  "wordpress": {
    "title": "Post title",
    "body": "Full blog content with proper formatting",
    "summary": "Meta description for SEO"
  },
  "facebook": {
    "text": "Main post with emojis and formatting",
    "cta": "${clientProfile.cta}"
  },
  "instagram": {
    "caption": "Short caption that's engaging and concise",
    "hashtags": ${hashtagsJson}
  }
}`;

    // Generate structured content using GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert content strategist who generates high-quality, structured content for multiple platforms. You always return valid JSON that matches exactly the required structure."
        },
        {
          role: "user", 
          content: promptTemplate
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the structured JSON content
    const contentJson = JSON.parse(completion.choices[0].message.content);
    
    // Extract content for requested platform
    let platformContent = '';
    if (platform === 'wordpress') {
      platformContent = contentJson.wordpress.body;
    } else if (platform === 'facebook') {
      platformContent = contentJson.facebook.text;
    } else if (platform === 'instagram') {
      platformContent = contentJson.instagram.caption + '\n\n' + contentJson.instagram.hashtags.join(' ');
    }
    
    // Generate image using gpt-image-1 with improved structured prompt
    const imagePrompt = generateImagePrompt(topic, platform, clientProfile.client_name);
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024"
    });
    
    return {
      content: platformContent,  // Legacy field for backward compatibility
      contentJson: contentJson,  // New structured content for all platforms
      imageUrl: getImageUrl(imageResponse)
    };
  } catch (error) {
    console.error('Error generating structured content:', error);
    throw new Error('Failed to generate structured content');
  }
}

/**
 * Generate content based on platform
 * @param {Object} contentInfo - Information about the content to generate
 * @returns {Object} Generated content and image URL
 */
async function generateContent(contentInfo) {
  // Always use the new structured approach
  return generateStructuredContent(contentInfo);
}

module.exports = {
  generateContent,
  generateContentTopics
}; 