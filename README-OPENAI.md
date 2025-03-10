# OpenAI Integration for Personalized Recommendations

This document explains how the OpenAI API integration works in the application and how to set it up.

## Overview

The application now uses OpenAI to generate personalized recommendations in both the "Stay & Improve" and "Move" sections based on the user's address, income, and family details provided in the assessment quiz.

## Setup Instructions

1. **Get an OpenAI API Key**:
   - Sign up or log in at [OpenAI Platform](https://platform.openai.com/)
   - Navigate to API Keys section
   - Create a new secret key

2. **Set up Environment Variables**:
   - Create a `.env.local` file in the root directory of the project
   - Add the following line to the file:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with your actual OpenAI API key

3. **Restart the Development Server**:
   - If the server is running, stop it and restart it to load the new environment variables

## How It Works

1. **User Flow**:
   - User completes the assessment form with their address, income, and family details
   - User navigates to the "Take Action" section and selects either "Stay & Improve" or "Move"
   - The application fetches personalized recommendations from OpenAI based on the provided information

2. **Technical Implementation**:
   - The `Stay.tsx` component fetches data from the `/api/openai` endpoint
   - The `Move.tsx` component fetches data from the `/api/openai-move` endpoint
   - Both API endpoints use the OpenAI API to generate personalized recommendations
   - The recommendations include township information, local schools, community programs, and more

## Customization

### Stay & Improve API

You can modify the prompt sent to OpenAI for the Stay & Improve component by editing the `/src/app/api/openai/route.ts` file. The current implementation requests:

1. Township information (name, website, description)
2. Local school recommendations (3 schools with details)
3. Community program recommendations (3 programs with details)

### Move API

You can modify the prompt sent to OpenAI for the Move component by editing the `/src/app/api/openai-move/route.ts` file. The current implementation requests:

1. Town information (name, website, description)
2. Neighborhood data (top neighborhoods with details)
3. School recommendations (elementary, middle, high school options)
4. Community program recommendations (programs with details)
5. Community demographics (population, median age, median household income, ethnic composition, education levels)
6. Housing options (different types with price ranges and descriptions)

## Testing

You can test the OpenAI Move API integration by visiting the `/test-openai-move` route in your browser. This page provides a simple form to test the API with different inputs and view the response.

## Fallback Mechanism

If the OpenAI API call fails for any reason (e.g., invalid API key, network issues), the application will fall back to using default static data to ensure the user experience is not disrupted.

## Troubleshooting

- **API Key Issues**: Ensure your API key is correctly set in the `.env.local` file
- **Rate Limiting**: OpenAI has rate limits. If you encounter errors, you might be hitting these limits
- **Model Availability**: The application uses the GPT-4 model. Ensure your OpenAI account has access to this model

## Security Considerations

- Never commit your `.env.local` file to version control
- The OpenAI API key is only used server-side and is never exposed to the client
