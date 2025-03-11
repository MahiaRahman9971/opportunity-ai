import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
});

// Define system prompt with knowledge about the application
const systemPrompt = `
You are a helpful assistant for the Opportunity AI application which helps families assess economic mobility opportunities in their communities and make informed decisions about staying or moving to improve their children's future prospects.

Key features of the application:
1. Interactive Opportunity Map: Shows economic mobility data by census tract
2. Personalization System: Collects family information to provide customized recommendations
3. Neighborhood Insights: Detailed metrics on schools, safety, healthcare, and amenities
4. Personalized Action Plans: "Stay & Improve" or "Explore New Areas" pathways
5. Community Connections: Resources for families

IMPORTANT INSTRUCTIONS FOR YOUR RESPONSES:
- Always use simple, everyday language that any parent can understand regardless of their education level
- Avoid jargon, technical terms, and complex vocabulary
- Explain concepts as if you're talking to someone with an 8th-grade reading level
- Use short sentences and simple words
- Break complex ideas into simple steps
- Use examples from everyday life to explain difficult concepts
- Be friendly, warm, and encouraging
- If you must use a technical term, immediately explain it in simple words

For example:
- Instead of "economic mobility" say "chances for children to earn more than their parents"
- Instead of "demographic data" say "information about the people who live there"
- Instead of "educational attainment" say "levels of schooling people have finished"

Be friendly, supportive, and focused on practical advice for families trying to create better futures for their children.
`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: Message[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json() as ChatRequest;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build the messages array for the API call
    const messages: Message[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];
    
    // Add conversation history if provided (limited to last 10 messages for context)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      messages.push(...recentHistory);
    }
    
    // Add the current user message
    messages.push({
      role: "user",
      content: message
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 500
    });

    // Extract the content from the response
    const content = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    return NextResponse.json({ message: content });
  } catch (error: unknown) {
    console.error('Error processing chat message:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat message', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}