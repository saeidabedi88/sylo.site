const { OpenAI } = require('openai');

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

// Helper function to extract image URL from gpt-image-1 response
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
function generateImagePrompt(topic, platform) {
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
  
  return `${sceneAction} ${setting}. The scene shows Acetec security products seamlessly integrated into daily life. ${platformSpecifics} Clean, realistic lighting. No text or logos. 1024x1024.`;
}

/**
 * Generate content for WordPress blog post
 * @param {Object} contentInfo - Information about the content to generate
 * @returns {Object} Generated content and image URL
 */
async function generateWordPressContent(contentInfo) {
  try {
    const { topic, keywords } = contentInfo;
    
    // Generate a title based on the topic if not provided
    const title = `Enhancing Your Home Security: ${topic}`;
    
    // Generate blog post text using GPT-4o with improved prompts
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior content strategist for a smart home security brand called Acetec. Your writing is clear, structured, informative, and branded. Each blog post should:\n- Use an SEO-optimized title\n- Include a short, punchy intro with emotional pull\n- Structure with H2s and H3s using proper markdown\n- Include practical examples and use cases\n- End with a clear CTA related to the topic (e.g., get a quote, explore smart security options)"
        },
        {
          role: "user", 
          content: `Write a blog post titled "${title}". Target audience: GTA homeowners concerned about security. Include the following keywords: ${keywords || topic}. The post should be 600-800 words, well-structured with headings, lists, and examples. End with a CTA like "Contact Acetec today to explore smart security options for your home."`
        }
      ],
      max_tokens: 1200
    });
    
    const blogContent = completion.choices[0].message.content;
    
    // Generate featured image using gpt-image-1 with improved structured prompt
    const imagePrompt = generateImagePrompt(topic, 'wordpress');
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024"
    });
    
    return {
      content: blogContent,
      imageUrl: getImageUrl(imageResponse)
    };
  } catch (error) {
    console.error('Error generating WordPress content:', error);
    throw new Error('Failed to generate WordPress content');
  }
}

/**
 * Generate content for Facebook post
 * @param {Object} contentInfo - Information about the content to generate
 * @returns {Object} Generated content and image URL
 */
async function generateFacebookContent(contentInfo) {
  try {
    const { topic, keywords } = contentInfo;
    
    // Generate Facebook post text using GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are a social media marketing expert who specializes in creating engaging Facebook posts for Acetec, a smart home security company. Your posts are concise, include a call-to-action, and are designed to maximize engagement while highlighting security benefits."
        },
        {
          role: "user", 
          content: `Write a Facebook post about "${topic}". Include these keywords if possible: ${keywords || topic}. The post should be 80-120 words, engaging, and include a call-to-action. Focus on both the security and convenience benefits. Add 2-3 relevant hashtags at the end.`
        }
      ],
      max_tokens: 300
    });
    
    const postContent = completion.choices[0].message.content;
    
    // Generate image using gpt-image-1 with improved structured prompt
    const imagePrompt = generateImagePrompt(topic, 'facebook');
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024"
    });
    
    return {
      content: postContent,
      imageUrl: getImageUrl(imageResponse)
    };
  } catch (error) {
    console.error('Error generating Facebook content:', error);
    throw new Error('Failed to generate Facebook content');
  }
}

/**
 * Generate content for Instagram post
 * @param {Object} contentInfo - Information about the content to generate
 * @returns {Object} Generated content and image URL
 */
async function generateInstagramContent(contentInfo) {
  try {
    const { topic, keywords } = contentInfo;
    
    // Generate Instagram caption using GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are an Instagram marketing specialist who creates visually-focused captions for Acetec, a smart home security company. Your captions are engaging, include emojis, line breaks for readability, and relevant hashtags. They balance lifestyle appeal with security benefits."
        },
        {
          role: "user", 
          content: `Write an Instagram caption about "${topic}". Include these keywords if possible: ${keywords || topic}. The caption should be engaging, include emojis, and have 5-10 relevant hashtags at the end. Focus on how the technology enhances lifestyle while providing security. Format with line breaks for readability.`
        }
      ],
      max_tokens: 300
    });
    
    const captionContent = completion.choices[0].message.content;
    
    // Generate image using gpt-image-1 with improved structured prompt
    const imagePrompt = generateImagePrompt(topic, 'instagram');
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024"
    });
    
    return {
      content: captionContent,
      imageUrl: getImageUrl(imageResponse)
    };
  } catch (error) {
    console.error('Error generating Instagram content:', error);
    throw new Error('Failed to generate Instagram content');
  }
}

/**
 * Generate content based on platform
 * @param {Object} contentInfo - Information about the content to generate
 * @returns {Object} Generated content and image URL
 */
async function generateContent(contentInfo) {
  const { platform } = contentInfo;
  
  switch (platform) {
    case 'wordpress':
      return generateWordPressContent(contentInfo);
    case 'facebook':
      return generateFacebookContent(contentInfo);
    case 'instagram':
      return generateInstagramContent(contentInfo);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

module.exports = {
  generateContent,
  generateContentTopics
}; 