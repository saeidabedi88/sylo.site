require('dotenv').config();
const { OpenAI } = require('openai');
const fs = require('fs');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testImageGeneration() {
  console.log('Starting image generation test...');
  try {
    // Try DALL-E 3 first
    console.log('Testing DALL-E 3...');
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A smart home security system with lights, simple clean illustration style",
      n: 1,
      size: "1024x1024"
    });
    console.log('✅ DALL-E 3 success:', dalleResponse.data[0].url);
    fs.writeFileSync('dalle-test-result.json', JSON.stringify(dalleResponse, null, 2));
  } catch (error) {
    console.error('❌ DALL-E 3 error:', error.message);
    if (error.error) {
      console.error('Error details:', JSON.stringify(error.error, null, 2));
    }
  }
  
  try {
    // Now try gpt-image-1
    console.log('\nTesting gpt-image-1...');
    const gptImageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: "A smart home security system with lights, simple clean illustration style",
      n: 1,
      size: "1024x1024"
    });
    console.log('✅ gpt-image-1 success:', gptImageResponse.data[0].url);
    fs.writeFileSync('gpt-image-test-result.json', JSON.stringify(gptImageResponse, null, 2));
  } catch (error) {
    console.error('❌ gpt-image-1 error:', error.message);
    if (error.error) {
      console.error('Error details:', JSON.stringify(error.error, null, 2));
    }
  }
  
  console.log('\nTest complete.');
}

testImageGeneration().catch(err => {
  console.error('Unhandled error:', err);
}); 