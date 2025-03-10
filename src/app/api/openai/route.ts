import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
});

export async function POST(request: NextRequest) {
  try {
    const { address, income, children } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Create a prompt for OpenAI based on the user's information
    const prompt = `
      Generate personalized recommendations for a family living at ${address}.
      
      Family details:
      - Income bracket: ${income || 'Not specified'}
      - Number of children: ${children?.length || 0}
      ${children?.map((child: any, index: number) => `
      - Child ${index + 1}:
        - Age: ${child.age || 'Not specified'}
        - Gender: ${child.gender || 'Not specified'}
        - Ethnicity: ${child.ethnicity || 'Not specified'}
      `).join('') || ''}
      
      Please provide the following information in JSON format:
      1. Township information (name, website, description)
      2. Local school recommendations (3 schools with name, rating, description, website)
      3. Community program recommendations (3 programs with name, description, website)
      
      The response should be structured as follows:
      {
        "townData": {
          "name": "...",
          "website": "...",
          "description": "..."
        },
        "schoolData": [
          {
            "name": "...",
            "rating": 0.0,
            "description": "...",
            "website": "..."
          },
          ...
        ],
        "communityProgramData": [
          {
            "name": "...",
            "description": "...",
            "website": "..."
          },
          ...
        ]
      }
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides personalized recommendations for families based on their location and demographics. Your responses should be accurate, helpful, and formatted as requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Extract the content from the response
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    const recommendations = JSON.parse(content);

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    
    // Provide more detailed error information
    const errorMessage = error.message || 'Unknown error';
    const errorStatus = error.status || 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: errorStatus }
    );
  }
}
