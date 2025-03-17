// app/api/openai-move/route.ts
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
    const { zipCode, income, children } = body;

    if (!zipCode) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
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
      // Note: Not using response_format: { type: "json_object" } with project-scoped API keys
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that provides personalized recommendations for families looking to 
                    move to improve their children's future opportunities. Format your response as valid JSON. 
                    Your entire response must be valid JSON that can be parsed with JSON.parse().`
        },
        {
          role: "user",
          content: `Generate detailed, personalized recommendations for a family considering moving to ZIP code: ${zipCode}.
                    Additional family information:
                    - Annual household income: ${income}
                    - Children: ${JSON.stringify(children)}
                    
                    Please include the following in your JSON response (your entire response must be valid JSON):
                    
                    1. townData: Information about the town/city in this ZIP code including name, website, and description.
                    
                    2. neighborhoodData: Object with a topNeighborhoods array listing top 3 neighborhoods with scores (1-10) and descriptions.
                    
                    3. schoolData: Array of school recommendations with:
                       - name, rating (1-10), description, website
                       - schoolType: "elementary", "middle", "high", or "all" based on grade levels
                       - Make sure each school is appropriate for the children's ages:
                         * Ages 5-10: elementary schools
                         * Ages 11-13: middle schools
                         * Ages 14-18: high schools
                    
                    4. communityProgramData: Array of recommendations with:
                       - name, description, website
                       - ageRanges: Array of ["preschool", "elementary", "middle", "high", "all"]
                       - genderFocus: "all", "boys", or "girls" if applicable
                       - tags: Array of relevant categories like "stem", "arts", "sports", etc.
                       - Make recommendations based on the children's ages, genders, and family income
                    
                    5. communityDemographics: Include the following data:
                       - population: Total population number
                       - medianAge: Median age of residents
                       - ethnicComposition: Array of objects with group name and percentage
                       - medianHousehold: Median household income
                       - educationLevel: Array of objects with education level and percentage
                       - religiousComposition: Array of objects with religion name and percentage (include major religions like Christian, Jewish, Muslim, Hindu, Non-religious, etc.)
                    
                    6. housingOptions: Array with different housing types, price ranges, and sizes
                       - Include a suitability field (1-5) indicating how suitable each option is for this family's size and income
                    
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
      
      // Validate the response structure
      if (!recommendations.townData || !recommendations.schoolData) {
        console.error('Invalid response structure:', recommendations);
        // Instead of throwing an error, return the data we have with a warning
        return NextResponse.json({
          ...recommendations,
          warning: 'Response may be missing some required fields'
        });
      }
      
      return NextResponse.json(recommendations);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      
      // Try to determine if the response is actually valid JSON but not in our expected format
      try {
        // If this is valid JSON but not in our expected format, let's return it anyway
        const jsonData = JSON.parse(responseContent);
        console.log('Response is valid JSON but not in expected format');
        
        return NextResponse.json({
          ...jsonData,
          warning: 'Response format may not match expected structure'
        });
      } catch {
        // If we get here, it's really not valid JSON
        return NextResponse.json(
          { error: 'Failed to parse the AI response as JSON', rawResponse: responseContent },
          { status: 500 }
        );
      }
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