// app/api/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false
});

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured in environment variables');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, income, children } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Validate input data
    if (!Array.isArray(children)) {
      return NextResponse.json(
        { error: 'Children data must be an array' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // Using a more reliable model
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that provides personalized recommendations for families looking to 
                    improve their children's future opportunities in their current location. Format your response as valid JSON. 
                    Your entire response must be valid JSON that can be parsed with JSON.parse().`
        },
        {
          role: "user",
          content: `Generate detailed, personalized recommendations for a family living at this address: ${address}.
                    Additional family information:
                    - Annual household income: ${income}
                    - Children: ${JSON.stringify(children)}
                    
                    Please include the following in your JSON response (your entire response must be valid JSON):
                    
                    1. townData: Information about their current town/city including name, website, and description.
                    
                    2. schoolData: Array of school recommendations with:
                       - name, rating (1-10), description, website
                       - schoolType: "elementary", "middle", "high", or "all" based on grade levels
                       - Make sure each school is appropriate for the children's ages:
                         * Ages 5-10: elementary schools
                         * Ages 11-13: middle schools
                         * Ages 14-18: high schools
                    
                    3. communityProgramData: Array of recommendations with:
                       - name, description, website
                       - ageRanges: Array of ["preschool", "elementary", "middle", "high", "all"]
                       - genderFocus: "all", "boys", or "girls" if applicable
                       - tags: Array of relevant categories like "stem", "arts", "sports", etc.
                       - Make recommendations based on the children's ages, genders, and family income
                    
                    Format everything as valid JSON.`
        }
      ]
    });

    // Extract the response content
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No content in the OpenAI response');
    }

    try {
      // Parse the JSON response
      const recommendations = JSON.parse(responseContent);
      return NextResponse.json(recommendations);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      throw new Error('Failed to parse the AI response as JSON');
    }
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: errorMessage },
      { status: 500 }
    );
  }
}