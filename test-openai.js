// Test script for OpenAI API integration
const { OpenAI } = require('openai');
require('dotenv').config({ path: '.env.local' });

async function testOpenAIConnection() {
  try {
    console.log('Testing OpenAI API connection...');
    console.log('API Key (first 5 chars):', process.env.OPENAI_API_KEY.substring(0, 5) + '...');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Hello, this is a test message. Please respond with a simple 'Connection successful!' message."
        }
      ],
    });

    console.log('Response:', response.choices[0]?.message?.content);
    console.log('OpenAI API connection test successful!');
  } catch (error) {
    console.error('Error testing OpenAI API connection:');
    console.error(error.message);
    console.error('Full error:', error);
  }
}

testOpenAIConnection();
