// app/api/openai-move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that provides personalized recommendations for families looking to 
                    move to improve their children's future opportunities. Format your response as JSON.`
        },
        {
          role: "user",
          content: `Generate detailed, personalized recommendations for a family considering moving to ZIP code: ${zipCode}.
                    Additional family information:
                    - Annual household income: ${income}
                    - Children: ${JSON.stringify(children)}
                    
                    Please include the following in your JSON response:
                    
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
                    
                    5. communityDemographics: Population info, ethnic composition, education levels, etc.
                    
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
      return NextResponse.json(recommendations);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      throw new Error('Failed to parse the AI response as JSON');
    }
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error.message },
      { status: 500 }
    );
  }
}