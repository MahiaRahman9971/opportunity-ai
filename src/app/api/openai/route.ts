import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define interfaces for the request data
interface Child {
  age?: string | number;
  gender?: string;
  ethnicity?: string;
}

interface RequestData {
  address: string;
  income?: string;
  children?: Child[];
}

// Response interfaces
interface TownData {
  name: string;
  website: string;
  description: string;
}

interface SchoolData {
  name: string;
  rating: number;
  description: string;
  website: string;
}

interface CommunityProgramData {
  name: string;
  description: string;
  website: string;
}

interface RecommendationsResponse {
  townData: TownData;
  schoolData: SchoolData[];
  communityProgramData: CommunityProgramData[];
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
});

export async function POST(request: NextRequest) {
  try {
    const { address, income, children } = await request.json() as RequestData;

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
      ${children?.map((child: Child, index: number) => `
      - Child ${index + 1}:
        - Age: ${child.age || 'Not specified'}
        - Gender: ${child.gender || 'Not specified'}
        - Ethnicity: ${child.ethnicity || 'Not specified'}
      `).join('') || ''}
      
      Please provide the following information in JSON format:
      1. Township information (name, website, description)
      2. Local school recommendations (3 schools with name, rating, description, website)
      3. Community program recommendations (3 programs with name, description, website)
      
      The response should be structured EXACTLY as follows, with no extra fields or nested objects:
      {
        "townData": {
          "name": "Township Name",
          "website": "https://example.com",
          "description": "Description text"
        },
        "schoolData": [
          {
            "name": "School Name",
            "rating": 4.5,
            "description": "School description",
            "website": "https://school.example.com"
          }
        ],
        "communityProgramData": [
          {
            "name": "Program Name",
            "description": "Program description",
            "website": "https://program.example.com"
          }
        ]
      }
      
      Ensure your response follows this format exactly and is valid JSON. Do not include any trailing commas, comments, or malformed JSON syntax.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides personalized recommendations for families based on their location and demographics. Your responses should be accurate, helpful, and formatted precisely as requested with valid JSON only."
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

    // Parse the JSON response with error handling
    let recommendations: RecommendationsResponse;
    try {
      recommendations = JSON.parse(content);
      
      // Validate the structure
      if (!recommendations.townData || !Array.isArray(recommendations.schoolData) || !Array.isArray(recommendations.communityProgramData)) {
        throw new Error('Response does not match expected format');
      }
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, '\nContent:', content);
      return NextResponse.json(
        { 
          error: 'Failed to parse recommendations', 
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    return NextResponse.json(recommendations);
  } catch (error: unknown) {
    console.error('Error generating recommendations:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStatus = (error as { status?: number })?.status || 500;
    
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