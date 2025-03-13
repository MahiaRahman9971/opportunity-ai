# Opportunity AI Project Prompt

## Project Overview
I'm developing a web application called "Opportunity AI" that helps families assess economic mobility opportunities in their communities and make informed decisions about staying or moving to improve their children's future prospects. The application uses economic mobility data to visualize opportunity scores across different neighborhoods and provides personalized recommendations based on family circumstances.

## Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **Data Visualization**: Mapbox GL for interactive maps, Chart.js for data visualization
- **Data Storage**: AWS S3 for storing geospatial and census data - NOT USED NOW
- **Key Dependencies**: @aws-sdk/client-s3, mapbox-gl, react-map-gl, papaparse

## Core Features
1. **Interactive Opportunity Map**:
   - Choropleth map displaying economic mobility data by census tract
   - Color-coded visualization of household income at age 35 for children from different backgrounds
   - Address search and geocoding to locate user's neighborhood
   - Tract-level data display on hover/click

2. **Personalization System**:
   - Assessment quiz collecting family information (address, income, children's details)
   - Context-based data sharing across components
   - Opportunity score calculation based on location and income

3. **Neighborhood Insights**:
   - Detailed metrics on school quality, safety, healthcare, amenities, housing, and transportation
   - Score-based evaluation of neighborhood factors
   - Visualization of neighborhood strengths and weaknesses

4. **Personalized Action Plans**:
   - Two pathways: "Stay & Improve" or "Explore New Areas"
   - Personalized recommendations based on income level and children's characteristics (age, gender, ethnicity)
   - School selection, community program suggestions, and housing recommendations

5. **Data Integration**:
   - GeoJSON mapping data
   - Client and server-side caching for performance optimization

## Current Implementation
The application currently has these main components:
- `OpportunityMap.tsx`: Interactive choropleth map with census tract data
- `AssessQuiz.tsx`: Personalization quiz and context provider
- `NeighborhoodInsights.tsx`: Detailed neighborhood metrics
- `ActionPlan.tsx`, `Stay.tsx`, `Move.tsx`: Personalized action planning components

