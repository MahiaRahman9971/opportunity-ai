// Test script for OpenAI Move API endpoint
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOpenAIMoveAPI() {
  try {
    console.log('Testing OpenAI Move API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/openai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: '123 Main St, Anytown, USA',
        zipCode: '90210',
        income: '50-75k',
        children: [
          { age: '5-10', gender: 'female', ethnicity: 'asian' }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned status code ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response (truncated):');
    console.log('Town Name:', data.townData?.name);
    console.log('Top Neighborhood:', data.neighborhoodData?.topNeighborhoods?.[0]?.name);
    console.log('First School:', data.schoolData?.[0]?.name);
    console.log('First Program:', data.communityProgramData?.[0]?.name);
    console.log('Population:', data.communityDemographics?.population);
    console.log('First Housing Option:', data.housingOptions?.[0]?.type);
    
    console.log('\nOpenAI Move API test successful!');
  } catch (error) {
    console.error('Error testing OpenAI Move API endpoint:');
    console.error(error.message);
  }
}

testOpenAIMoveAPI();
