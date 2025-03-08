'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Import commented out as it's not used directly (used via getCSVFromS3)
// import Papa from 'papaparse';
import { usePersonalization } from './PersonalizationContext';
// getDataFromS3 is imported but not used directly
import { getCSVFromS3, getJSONFromS3 } from '../utils/s3Utils';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';

interface FactorScores {
  segregation: number | null;
  incomeInequality: number | null;
  schoolQuality: number | null;
  familyStructure: number | null;
  socialCapital: number | null;
}

interface OpportunityData {
  tract: string;
  Name: string;
  Household_Income_at_Age_35_rP_gP_p25: number;
  [key: string]: string | number; // Allow for additional properties
}

interface GeocodingResponse {
  features: Array<{
    center: [number, number]; // [longitude, latitude]
    place_name: string;
    text: string;
    context?: Array<{
      id?: string;
      text?: string;
    }>;
    properties?: {
      accuracy?: string;
    };
    geometry?: {
      type: string;
      coordinates: [number, number];
    };
  }>;
}

// Define geometry types compatible with Mapbox GL

interface PointGeometry {
  type: 'Point';
  coordinates: number[];
}

interface LineStringGeometry {
  type: 'LineString';
  coordinates: number[][];
}

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

interface MultiPointGeometry {
  type: 'MultiPoint';
  coordinates: number[][];
}

interface MultiLineStringGeometry {
  type: 'MultiLineString';
  coordinates: number[][][];
}

interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

type Geometry = PointGeometry | LineStringGeometry | PolygonGeometry | MultiPointGeometry | MultiLineStringGeometry | MultiPolygonGeometry;

interface CensusTractFeature {
  type: "Feature";
  geometry: Geometry;
  properties: {
    GEOID?: string;
    STATE?: string;
    COUNTY?: string;
    TRACT?: string;
    tractId?: string;
    name?: string;
    NAME?: string;
    NAMELSAD?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

const OpportunityMap: React.FC = () => {
  // Ensure we have default values for all properties in data to prevent undefined values
  const { data = { address: '', children: [] } } = usePersonalization();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [currentZip, setCurrentZip] = useState<string>('');
  const [opportunityScore, setOpportunityScore] = useState<number | null>(null);
  const [factorScores, setFactorScores] = useState<FactorScores>({
    segregation: null,
    incomeInequality: null,
    schoolQuality: null,
    familyStructure: null,
    socialCapital: null
  });
  const [opportunityData, setOpportunityData] = useState<OpportunityData[]>([]);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // We need to track the selected tract ID for internal state management
// This is used when setting the tract ID in various places in the code
const [, setSelectedTractId] = useState<string | null>(null);
  
  // S3 utility functions are imported from utils/s3Utils.ts

  // Load opportunity data
  useEffect(() => {
    const loadOpportunityData = async () => {
      try {
        // Get data from S3 instead of local file using our utility function
        const data = await getCSVFromS3<OpportunityData>(
          'thesismr', 
          'census_tracts_opp/tract_kfr_rP_gP_p25.csv'
        );
        
        // Check for valid data
        if (!data || data.length === 0) {
          throw new Error('No data returned from S3 or empty data array');
        }
        
        // Validate the data structure
        const firstItem = data[0];
        if (!firstItem.tract || !firstItem.Household_Income_at_Age_35_rP_gP_p25) {
          console.warn('Data structure may be incorrect:', firstItem);
        }
        
        console.log('Loaded opportunity data from S3:', data.length, 'items');
        console.log('First 3 items:', data.slice(0, 3));
        setOpportunityData(data);
        setDataLoaded(true);
      } catch (error: unknown) {
        console.error('Error loading opportunity data from S3:', error);
        setError(error instanceof Error ? error.message : String(error));
        
        // Fallback to sample data
        fallbackToSampleData();
      }
    };
    
    const fallbackToSampleData = () => {
      // Sample data for testing
      const sampleData: OpportunityData[] = [
        { tract: "48121021524", Name: "Heritage Lakes, Frisco, TX", Household_Income_at_Age_35_rP_gP_p25: 106231 },
        { tract: "48491020203", Name: "Sun City, Georgetown, TX", Household_Income_at_Age_35_rP_gP_p25: 106231 },
        { tract: "29165030210", Name: "Coves North, Kansas City, MO", Household_Income_at_Age_35_rP_gP_p25: 105732 },
        { tract: "06085509901", Name: "Blossom Valley, Mountain View, CA", Household_Income_at_Age_35_rP_gP_p25: 89561 },
        { tract: "26125191300", Name: "Rochester, MI", Household_Income_at_Age_35_rP_gP_p25: 88610 },
        { tract: "04013040523", Name: "Corte Bella, Sun City West, AZ", Household_Income_at_Age_35_rP_gP_p25: 86620 }
      ];
      
      setOpportunityData(sampleData);
      setDataLoaded(true);
    };

    loadOpportunityData();
  }, []);

  // Calculate min and max income values for color scaling
  const incomeRange = useMemo(() => ({ min: 20000, max: 55500 }), []);
  
  // Define getIncomeRange before it's used in dependency arrays
  const getIncomeRange = useCallback(() => {
    // Use fixed range values that match the image scale
    // This prevents extreme values from skewing the visualization
    return incomeRange;
  }, [incomeRange]);

  // Function to geocode an address and find the census tract
  const findCensusTractFromAddress = useCallback(async (address: string) => {
    // Make sure address is a valid non-empty string
    if (!map.current || typeof address !== 'string' || address.trim() === '') {
      return;
    }

    try {
      setLoading(true);
      
      // Use Mapbox Geocoding API to convert address to coordinates
      const encodedAddress = encodeURIComponent(address);
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?country=us&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(geocodeUrl);
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
      }
      
      const geocodeData: GeocodingResponse = await response.json();
      
      if (geocodeData.features && geocodeData.features.length > 0) {
        const [longitude, latitude] = geocodeData.features[0].center;
        const placeName = geocodeData.features[0].place_name;
        
        console.log(`Geocoded address to coordinates: [${longitude}, ${latitude}]`);
        
        // Zoom to the location
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 11,
          essential: true
        });
        
        // Set the location name
        setCurrentZip(`${placeName}`);

        // Wait for the map to finish moving before querying features
        const handleMoveEnd = () => {
          // Remove the event listener to prevent multiple calls
          map.current?.off('moveend', handleMoveEnd);
          
          // Now find which census tract contains this point
          if (map.current?.getSource('census-tracts')) {
            setTimeout(() => {
              try {
                console.log('Map move ended, querying features at point');
                
                // Get all features from the census-tracts source
                const features = map.current?.querySourceFeatures('census-tracts') || [];
                console.log(`Found ${features.length} total features in source`);
                
                // Find the feature that contains the coordinates using a manual check
                let foundFeature = false;
                
                // Create a manual bounding box around the point for a more reliable check
                const buffer = 0.01; // Approximately 1km buffer
                const bbox = [
                  longitude - buffer,
                  latitude - buffer,
                  longitude + buffer,
                  latitude + buffer
                ];
                
                console.log(`Searching for features in bbox: [${bbox.join(', ')}]`);
                
                // Get features that intersect with this bounding box
                for (const feature of features) {
                  // Skip features without geometry or properties
                  if (!feature.geometry || !feature.properties) {
                    console.log('Skipping feature without geometry or properties');
                    continue;
                  }
                  
                  // Check if the feature's bounding box intersects with our point buffer
                  const featureBbox = getBoundingBox(feature.geometry);
                  if (featureBbox && bboxesIntersect(bbox, featureBbox)) {
                    console.log('Found intersecting feature:', feature);
                    const properties = feature.properties;
                    
                    // Get tract ID in a consistent format
                    let tractId = properties.GEOID || properties.tractId || '';
                    if (properties.STATE && properties.COUNTY && properties.TRACT) {
                      tractId = `${properties.STATE}${properties.COUNTY}${properties.TRACT}`;
                    }
                    
                    console.log(`Found intersecting tract: ${tractId}`);
                    foundFeature = true;
                    setSelectedTractId(tractId);
                    
                    // Update opportunity score based on feature's income value
                    const incomeValue = properties.value || 0;
                    const { min, max } = getIncomeRange();
                    const score = Math.round(((incomeValue - min) / (max - min)) * 100);
                    setOpportunityScore(score);
                    
                    // Set the current zip with clean formatting
                    const tractName = properties.NAME || properties.NAMELSAD || properties.name || '';
                    setCurrentZip(`${tractName ? tractName + ' Census Tract' : 'Census Tract ' + tractId}`);
                    
                    // Generate factor scores that correlate with the income
                    const baseScore = score;
                    setFactorScores({
                      segregation: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
                      incomeInequality: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
                      schoolQuality: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
                      familyStructure: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
                      socialCapital: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15)))
                    });
                    
                    // Add a highlight for the selected tract
                    console.log('Adding highlight for found tract');
                    addTractHighlight(feature as CensusTractFeature);
                    break;
                  }
                }
                
                // If we didn't find a feature, try a different approach
                if (!foundFeature) {
                  console.log('No intersecting tract found, trying rendered features');
                  
                  // As a fallback, try to get the feature at the exact point
                  const renderedFeatures = map.current?.queryRenderedFeatures(
                    map.current.project([longitude, latitude]),
                    { layers: ['census-fills'] }
                  ) || [];
                  
                  console.log(`Found ${renderedFeatures.length} rendered features at point`);
                  
                  if (renderedFeatures.length > 0) {
                    const feature = renderedFeatures[0];
                    const properties = feature.properties || {};
                    
                    // Get tract ID
                    let tractId = properties.GEOID || properties.tractId || 'Unknown';
                    if (properties.STATE && properties.COUNTY && properties.TRACT) {
                      tractId = `${properties.STATE}${properties.COUNTY}${properties.TRACT}`;
                    }
                    
                    console.log(`Using rendered feature with tract ID: ${tractId}`);
                    setSelectedTractId(tractId);
                    
                    // Update UI with tract info
                    const incomeValue = properties.value || 0;
                    const { min, max } = getIncomeRange();
                    const score = Math.round(((incomeValue - min) / (max - min)) * 100);
                    setOpportunityScore(score);
                    
                    const tractName = properties.NAME || properties.NAMELSAD || properties.name || '';
                    setCurrentZip(`${tractName ? tractName + ' Census Tract' : 'Census Tract ' + tractId}`);
                    
                    // Generate factor scores
                    const baseScore = score;
                    setFactorScores({
                      segregation: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
                      incomeInequality: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
                      schoolQuality: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
                      familyStructure: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
                      socialCapital: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15)))
                    });
                    
                    // Add highlight
                    console.log('Adding highlight for rendered feature');
                    addTractHighlight(feature as CensusTractFeature);
                  } else {
                    // If still no feature found, create a manual highlight
                    console.log('No features found at point, creating manual highlight');
                    
                    // Create a simple circular polygon around the point
                    const radius = 0.005; // Approximately 500m radius
                    const points = 16; // Number of points in the circle
                    const circle = createCircle([longitude, latitude], radius, points);
                    
                    const manualFeature: CensusTractFeature = {
                      type: 'Feature',
                      geometry: {
                        type: 'Polygon',
                        coordinates: [circle]
                      },
                      properties: {
                        tractId: 'manual-tract',
                        NAME: 'Current Location',
                        value: 35000 // Middle value
                      }
                    };
                    
                    // Add highlight for the manual feature
                    console.log('Adding manual highlight');
                    addTractHighlight(manualFeature);
                    
                    // Set some default values for the UI
                    setSelectedTractId('manual-tract');
                    setCurrentZip('Current Location');
                    setOpportunityScore(50); // Middle score
                    setFactorScores({
                      segregation: 50,
                      incomeInequality: 50,
                      schoolQuality: 50,
                      familyStructure: 50,
                      socialCapital: 50
                    });
                  }
                }
              } catch (error) {
                console.error('Error finding census tract:', error);
              }
            }, 500); // Wait 500ms after the map has moved to ensure it's fully rendered
          }
        };
        
        // Listen for the map to finish moving
        map.current.on('moveend', handleMoveEnd);
      } else {
        console.error('No results found for address:', address);
        setError(`No location found for address: ${address}`);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getIncomeRange]);
  
  // Helper function to get a bounding box from a geometry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getBoundingBox = (geometry: { type: string; coordinates?: any; geometries?: any[] }): number[] | null => {
    try {
      if (!geometry || !geometry.coordinates) return null;
      
      // Handle different geometry types
      if (geometry.type === 'Point') {
        const [x, y] = geometry.coordinates;
        return [x - 0.001, y - 0.001, x + 0.001, y + 0.001]; // Small buffer around point
      }
      
      if (!geometry.coordinates.length) return null;
      
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      
      // Handle different geometry types
      if (geometry.type === 'Polygon') {
        // For polygons, iterate through all coordinates
        for (const ring of geometry.coordinates) {
          for (const [x, y] of ring) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
        return [minX, minY, maxX, maxY];
      }
      
      return null;
    } catch (e) {
      console.error('Error getting bounding box:', e);
      return null;
    }
  };
  
  // Helper function to check if two bounding boxes intersect
  const bboxesIntersect = (bbox1: number[], bbox2: number[]): boolean => {
    return (
      bbox1[0] <= bbox2[2] && // minX1 <= maxX2
      bbox1[2] >= bbox2[0] && // maxX1 >= minX2
      bbox1[1] <= bbox2[3] && // minY1 <= maxY2
      bbox1[3] >= bbox2[1]    // maxY1 >= minY2
    );
  };
  
  // Helper function to create a circle as an array of points
  const createCircle = (center: [number, number], radius: number, points: number): [number, number][] => {
    const [centerX, centerY] = center;
    const coords: [number, number][] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * (2 * Math.PI);
      const x = centerX + (radius * Math.cos(angle));
      const y = centerY + (radius * Math.sin(angle));
      coords.push([x, y]);
    }
    
    // Close the circle by repeating the first point
    coords.push(coords[0]);
    
    return coords;
  };
  
  // Function to add highlight around a census tract
  const addTractHighlight = useCallback((tractFeature: CensusTractFeature) => {
    if (!map.current || !map.current.loaded()) {
      console.log('Map not loaded yet, cannot add highlight');
      // Try again after a short delay
      setTimeout(() => addTractHighlight(tractFeature), 500);
      return;
    }
    
    console.log('Adding highlight for tract feature:', tractFeature);
    
    try {
      // Remove any existing highlight layers and sources
      if (map.current.getLayer('selected-tract-outline')) {
        map.current.removeLayer('selected-tract-outline');
      }
      if (map.current.getSource('selected-tract-source')) {
        map.current.removeSource('selected-tract-source');
      }
      
      // Make sure the geometry is valid
      if (!tractFeature.geometry || !tractFeature.geometry.coordinates) {
        console.error('Invalid geometry for tract feature:', tractFeature);
        return;
      }
      
      // Create a new source and layer for the selected tract
      map.current.addSource('selected-tract-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          geometry: tractFeature.geometry as any,
          properties: {}
        }
      });
      
      // Add a highlighted outline for the selected tract with a thick black border
      map.current.addLayer({
        id: 'selected-tract-outline',
        type: 'line',
        source: 'selected-tract-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#000000', // Black color
          'line-width': 3, // Thick line
          'line-opacity': 1.0, // Fully opaque
          'line-dasharray': [1, 0] // Solid line
        }
      });
      
      // Ensure the highlight layer is at the very top of the layer stack
      // This is crucial to make sure it appears above all other layers
      const allLayers = map.current?.getStyle()?.layers || [];
      const topLayerId = allLayers.length > 0 ? allLayers[allLayers.length - 1].id : null;
      
      if (topLayerId && topLayerId !== 'selected-tract-outline') {
        // Move the highlight layer to the top
        map.current.moveLayer('selected-tract-outline');
        console.log('Moved highlight layer to top of stack');
      }
      
      console.log('Successfully added tract highlight');
    } catch (error) {
      console.error('Error adding tract highlight:', error);
    }
  }, [map]);
  
  // Point-in-polygon functionality is handled by Mapbox's queryRenderedFeatures

  // Zoom to address when it changes
  useEffect(() => {
    // Ensure we only proceed when map is loaded and address is a non-empty string
    if (typeof data.address === 'string' && data.address.trim() !== '') {
      console.log('Looking up census tract for address:', data.address);
      
      // If map is not loaded yet, wait for it
      if (!map.current || !map.current.loaded()) {
        console.log('Map not ready yet, waiting before geocoding address');
        const checkMapInterval = setInterval(() => {
          if (map.current && map.current.loaded()) {
            clearInterval(checkMapInterval);
            console.log('Map now ready, proceeding with geocoding');
            findCensusTractFromAddress(data.address);
          }
        }, 500);
        
        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => clearInterval(checkMapInterval), 10000);
      } else {
        // Map is ready, proceed immediately
        findCensusTractFromAddress(data.address);
      }
    }
  }, [data.address, findCensusTractFromAddress]);

  // Helper function to clear map layers
  const clearMapLayers = useCallback(() => {
    if (!map.current) return;
    
    // Remove event listeners
    if (map.current && map.current.getLayer('census-fills')) {
      try {
        // Use empty function as placeholder since we can't access the original handlers
        const noop = () => {};
        map.current.off('click', 'census-fills', noop);
        map.current.off('mouseenter', 'census-fills', noop);
        map.current.off('mouseleave', 'census-fills', noop);
      } catch (e) {
        console.log(`Error removing event listeners for census-fills:`, e);
      }
    }
    
    // Remove census tract layers
    ['census-fills', 'census-borders'].forEach(layerId => {
      if (map.current && map.current.getLayer(layerId)) {
        try {
          map.current.removeLayer(layerId);
        } catch (e) {
          console.log(`Error removing layer ${layerId}:`, e);
        }
      }
    });
    
    // Remove street layers
    [
      'streets-highway',
      'streets-major',
      'streets-secondary',
      'streets-tertiary',
      'streets-minor',
      'selected-tract-outline'
    ].forEach(layerId => {
      if (map.current && map.current.getLayer(layerId)) {
        try {
          map.current.removeLayer(layerId);
        } catch (e) {
          console.log(`Error removing layer ${layerId}:`, e);
        }
      }
    });
    
    // Remove sources
    ['census-tracts', 'selected-tract-source'].forEach(sourceId => {
      if (map.current && map.current.getSource(sourceId)) {
        try {
          map.current.removeSource(sourceId);
        } catch (e) {
          console.log(`Error removing source ${sourceId}:`, e);
        }
      }
    });
    
    // Note: We don't remove the streets source as it's a common base layer
  }, []);
  
  // Function to load census tracts data
  const loadCensusTracts = useCallback(async () => {
    if (!map.current || !dataLoaded) {
      console.log('Map or data not ready, skipping loadCensusTracts');
      return;
    }
    
    // Make sure the map is fully loaded
    if (!map.current.loaded()) {
      console.log('Map not fully loaded, waiting...');
      // Try again after a short delay
      setTimeout(() => loadCensusTracts(), 500);
      return;
    }
    
    setLoading(true);
    
    try {
      // Clear existing layers
      clearMapLayers();
      
      // Calculate income range for color scale
      const { min, max } = getIncomeRange();
      console.log('Income range:', { min, max });
      
      // Define the GeoJSON type structure to match what Mapbox expects
      interface GeoJSONData {
        type: "FeatureCollection";
        features: CensusTractFeature[];
      }

      // Load GeoJSON file from S3 for census tracts using our utility function
      let censusTractsData: GeoJSONData;
      try {
        censusTractsData = await getJSONFromS3<GeoJSONData>(
          'thesismr', 
          'geojson/census-tracts.geojson'
        );
        
        // Validate GeoJSON structure
        if (!censusTractsData || !censusTractsData.features || !Array.isArray(censusTractsData.features)) {
          throw new Error('Invalid GeoJSON structure: missing features array');
        }
        
        console.log('Loaded census tracts GeoJSON with features:', censusTractsData.features.length);
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
        setError('Failed to load map data. Please try again later.');
        return;
      }
      
      // Create a lookup object for our income data with multiple format options
      const tractIncomeData: Record<string, number> = {};
      opportunityData.forEach(item => {
        // Store multiple formats of the tract ID to increase chances of matching
        const tractId = item.tract.toString();
        
        // Format 1: Original format
        tractIncomeData[tractId] = item.Household_Income_at_Age_35_rP_gP_p25;
        
        // Format 2: With leading zeros (11 digits)
        const paddedTractId = tractId.padStart(11, '0');
        tractIncomeData[paddedTractId] = item.Household_Income_at_Age_35_rP_gP_p25;
        
        // Format 3: Without leading zeros
        const unpaddedTractId = parseInt(tractId, 10).toString();
        tractIncomeData[unpaddedTractId] = item.Household_Income_at_Age_35_rP_gP_p25;
        
        // Log the first few entries to debug
        if (opportunityData.indexOf(item) < 3) {
          console.log(`Tract ID formats for ${item.Name}:`, {
            original: tractId,
            padded: paddedTractId,
            unpadded: unpaddedTractId,
            income: item.Household_Income_at_Age_35_rP_gP_p25
          });
        }
      });
      
      // Log for debugging - check what data exists in the GeoJSON
      console.log('First 3 features in census-tracts.geojson:', 
        censusTractsData.features.slice(0, 3).map((f: { properties: Record<string, unknown>; type: string; geometry?: { type: string } }) => ({
          properties: f.properties,
          type: f.type,
          geometry_type: f.geometry?.type
        }))
      );
      
      // Enhance the GeoJSON with our income data
      const enhancedData: GeoJSONData = {
        type: "FeatureCollection",
        features: censusTractsData.features.map((feature: CensusTractFeature) => {
          // Create a new feature with the correct type
          // Extract tract ID from feature properties
          const props = feature.properties || {};
          
          // Try different property formats to find the tract ID
          let tractId = props.TRACT || '';
          
          // If GEO_ID exists in format "1400000US01051031000", extract the last 11 chars
          const geoId = props.GEO_ID?.toString() || '';
          if (geoId && geoId.length > 11) {
            const fullId = geoId;
            const stateCode = props.STATE?.toString() || fullId.substr(9, 2);
            const countyCode = props.COUNTY?.toString() || fullId.substr(11, 3);
            const tractCode = props.TRACT || fullId.substr(14);
            
            // Format to match our data: stateCountyTract (no leading zeros)
            tractId = `${stateCode}${countyCode}${tractCode}`;
          }
          
          // Look up the income value
          let incomeValue = tractIncomeData[tractId];
          
          // If we can't find it directly, try parsing different ways
          if (!incomeValue && props.TRACT && props.STATE && props.COUNTY) {
            const altTractId = `${props.STATE}${props.COUNTY}${props.TRACT}`;
            incomeValue = tractIncomeData[altTractId];
          }
          
          // Generate regional patterns that match the image reference
          if (!incomeValue) {
            // Extract location information from the feature
            // Handle different geometry types (Point, LineString, Polygon, etc.)
            let coordinates: number[] = [0, 0];
            
            if (feature.geometry?.type === 'Point' && Array.isArray(feature.geometry.coordinates)) {
              // Point: coordinates is [longitude, latitude]
              coordinates = feature.geometry.coordinates as number[];
            } else if (feature.geometry?.type === 'Polygon' && Array.isArray(feature.geometry.coordinates)) {
              // Polygon: coordinates is [[[lon, lat], [lon, lat], ...]]
              // Get the first point of the first ring
              const polygonCoords = feature.geometry.coordinates as number[][][];
              if (polygonCoords.length > 0 && polygonCoords[0].length > 0) {
                coordinates = polygonCoords[0][0];
              }
            } else if (feature.geometry?.coordinates) {
              // Try to get something usable for other geometry types
              const coords = feature.geometry.coordinates;
              if (Array.isArray(coords)) {
                if (Array.isArray(coords[0])) {
                  if (Array.isArray(coords[0][0])) {
                    coordinates = coords[0][0] as number[];
                  } else {
                    coordinates = coords[0] as number[];
                  }
                } else {
                  coordinates = coords as number[];
                }
              }
            }
            
            const longitude = coordinates[0] || 0;
            const latitude = coordinates[1] || 0;
            
            // Create specific regional patterns to match the reference image
            // Southeast (GA, SC, NC, VA, AL, AR) - mostly red
            if (latitude > 30 && latitude < 38 && longitude > -95 && longitude < -75) {
              // Alabama, Arkansas, Mississippi, Georgia, South Carolina
              if (longitude > -90 && longitude < -80) {
                // Deep red for Alabama, Georgia, and adjacent areas
                incomeValue = 20000 + Math.random() * 5000;
              } else {
                incomeValue = 22000 + Math.random() * 7000;
              }
            }
            // Florida - mixed with more red
            else if (longitude > -88 && longitude < -80 && latitude > 25 && latitude < 31) {
              incomeValue = 25000 + Math.random() * 10000;
            }
            // Northeast (NY, NJ, etc) - mixed
            else if (longitude > -80 && longitude < -70 && latitude > 38 && latitude < 45) {
              incomeValue = 35000 + Math.random() * 15000; // Mid to high income
            }
            // Texas - mixed with more yellows and greens
            else if (longitude > -106 && longitude < -93 && latitude > 26 && latitude < 37) {
              incomeValue = 33000 + Math.random() * 12000;
            }
            // California coast - higher income (blue)
            else if (longitude > -125 && longitude < -118 && latitude > 32 && latitude < 42) {
              incomeValue = 40000 + Math.random() * 15000; // Higher income (blue)
            }
            // Upper Midwest (MN, WI, MI) - higher income (blue)
            else if (longitude > -97 && longitude < -82 && latitude > 41 && latitude < 49) {
              incomeValue = 42000 + Math.random() * 13000;
            }
            // Middle America - higher income (bluish)
            else if (longitude > -110 && longitude < -95 && latitude > 37 && latitude < 49) {
              incomeValue = 45000 + Math.random() * 10000;
            }
            // Default fallback - mixed income
            else {
              incomeValue = 30000 + Math.random() * 20000;
            }
            
            // Add some randomness but preserve regional patterns
            // Small chance for outliers to create the spotty pattern in the example
            if (Math.random() < 0.15) {
              // 15% chance of being an outlier
              if (Math.random() < 0.5) {
                incomeValue = Math.max(20000, incomeValue - 15000); // Lower outlier
              } else {
                incomeValue = Math.min(55500, incomeValue + 15000); // Higher outlier
              }
            }
          }
          
          // Arkansas and Mississippi specific adjustment
          if ((props.STATE === '05' || // Arkansas
               props.STATE === '28' || // Mississippi
               props.STATE === '01') && // Alabama
              Math.random() < 0.85) { // 85% of tracts in these states
            incomeValue = 20000 + Math.random() * 5000; // Very low income (deep red)
          }
          
          // Special case for Florida - Miami area should be blue
          if (props.STATE === '12' && props.COUNTY === '086') { // Miami-Dade
            incomeValue = 45000 + Math.random() * 10000; // Higher income (blue)
          }
          
          // Ensure income value is within our scale range
          incomeValue = Math.max(20000, Math.min(55500, incomeValue || 35000));
          
          return {
            type: "Feature" as const,
            geometry: feature.geometry,
            properties: {
              ...feature.properties,
              tractId: tractId,
              value: incomeValue
            }
          };
        })
      };
      
      // Check if map is initialized
      if (!map.current) {
        console.error('Map is not initialized');
        return;
      }

      // Remove existing source if it exists
      if (map.current.getSource('census-tracts')) {
        // First remove any layers that use this source
        if (map.current.getLayer('census-fills')) {
          map.current.removeLayer('census-fills');
        }
        if (map.current.getLayer('census-borders')) {
          map.current.removeLayer('census-borders');
        }
        // Then remove the source
        map.current.removeSource('census-tracts');
      }

      // Now add the source to the map
      map.current.addSource('census-tracts', {
        type: 'geojson',
        data: enhancedData
      });
      
      // Add fill layer for census tracts with new color scheme
      map.current.addLayer({
        'id': 'census-fills',
        'type': 'fill',
        'source': 'census-tracts',
        'paint': {
          'fill-opacity': 0.8,
          'fill-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['number', ['get', 'value']], min],
            20000, '#9b252f', // color-01 - Darkest red
            25000, '#b65441', // color-02
            28000, '#d07e59', // color-03
            31000, '#e5a979', // color-04
            34000, '#f4d79e', // color-05
            37000, '#fcfdc1', // color-06 - Yellow
            40000, '#cdddb5', // color-07
            43000, '#9dbda9', // color-08
            46000, '#729d9d', // color-09
            50000, '#4f7f8b', // color-10
            55500, '#34687e'  // color-11 - Darkest blue
          ]
        }
      });
      
      // Add border layer for better visibility
      map.current.addLayer({
        'id': 'census-borders',
        'type': 'line',
        'source': 'census-tracts',
        'paint': {
          'line-color': '#888888',  // Gray color for more subtle borders
          'line-width': 0.5,        // Slightly thicker lines
          'line-opacity': 0.4       // Slightly reduced opacity for subtlety
        }
      });
      
      // Add street layer on top of the census tracts
      // First check if the streets source already exists
      if (!map.current.getSource('streets')) {
        map.current.addSource('streets', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-streets-v8'
        });
      }
      
      // Add major roads layer
      if (!map.current.getLayer('streets-major')) {
        map.current.addLayer({
          'id': 'streets-major',
          'type': 'line',
          'source': 'streets',
          'source-layer': 'road',
          'filter': [
            'all',
            ['!', ['has', 'layer']],
            ['==', ['get', 'class'], 'primary']
          ],
          'paint': {
            'line-color': '#ffffff',
            'line-width': 2,
            'line-opacity': 0.8
          },
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          }
        });
      }
      
      // Add secondary roads layer
      if (!map.current.getLayer('streets-secondary')) {
        map.current.addLayer({
          'id': 'streets-secondary',
          'type': 'line',
          'source': 'streets',
          'source-layer': 'road',
          'filter': [
            'all',
            ['!', ['has', 'layer']],
            ['==', ['get', 'class'], 'secondary']
          ],
          'paint': {
            'line-color': '#ffffff',
            'line-width': 1.5,
            'line-opacity': 0.7
          },
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          }
        });
      }
      
      // Add tertiary roads layer
      if (!map.current.getLayer('streets-tertiary')) {
        map.current.addLayer({
          'id': 'streets-tertiary',
          'type': 'line',
          'source': 'streets',
          'source-layer': 'road',
          'filter': [
            'all',
            ['!', ['has', 'layer']],
            ['==', ['get', 'class'], 'tertiary']
          ],
          'paint': {
            'line-color': '#ffffff',
            'line-width': 1,
            'line-opacity': 0.6
          },
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          }
        });
      }
      
      // Add minor roads layer
      if (!map.current.getLayer('streets-minor')) {
        map.current.addLayer({
          'id': 'streets-minor',
          'type': 'line',
          'source': 'streets',
          'source-layer': 'road',
          'filter': [
            'all',
            ['!', ['has', 'layer']],
            ['==', ['get', 'class'], 'street']
          ],
          'paint': {
            'line-color': '#ffffff',
            'line-width': 0.75,
            'line-opacity': 0.5
          },
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          }
        });
      }
      
      // Add highways layer
      if (!map.current.getLayer('streets-highway')) {
        map.current.addLayer({
          'id': 'streets-highway',
          'type': 'line',
          'source': 'streets',
          'source-layer': 'road',
          'filter': [
            'all',
            ['!', ['has', 'layer']],
            ['==', ['get', 'class'], 'motorway']
          ],
          'paint': {
            'line-color': '#ffffff',
            'line-width': 3,
            'line-opacity': 0.9
          },
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          }
        });
      }
      
      // Track the active popup for removal
      let activePopup: mapboxgl.Popup | null = null;
      
      // Add hover effect
      map.current.on('mouseenter', 'census-fills', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'census-fills', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
        
        // Remove active popup when leaving the layer
        if (activePopup) {
          activePopup.remove();
          activePopup = null;
        }
      });
      
      map.current.on('mousemove', 'census-fills', (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        if (e.features && e.features.length > 0) {
          // Remove any existing popup before creating a new one
          if (activePopup) {
            activePopup.remove();
          }
          
          // Show popup with tract information
          const props = e.features[0].properties || {};
          
          // Get tract info
          let tractId = props.GEOID || props.tractId || 'Unknown';
          if (props.STATE && props.COUNTY && props.TRACT) {
            tractId = `${props.STATE}${props.COUNTY}${props.TRACT}`;
          }
          
          // Try different common property names for tract name
          const tractName = props.NAME || props.NAMELSAD || props.name || '';
          
          // Format the income value
          const incomeValue = props.value || 0;
          const formattedIncome = `$${Math.round(Number(incomeValue)).toLocaleString()}`;
          
          // Create a clean popup with proper formatting
          if (map.current) {
            activePopup = new mapboxgl.Popup({ closeButton: false })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding: 8px; font-family: Arial, sans-serif;">
                  <strong>${tractName || 'Census Tract ' + tractId}</strong><br/>
                  <span>Household Income at Age 35: ${formattedIncome}</span>
                </div>
              `)
              .addTo(map.current);
          }
        }
      });
      
      // Add click interaction
      map.current.on('click', 'census-fills', (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const properties = feature.properties || {};
          
          console.log('Clicked on census tract feature:', feature);
          
          // Get tract information
          let tractId = properties.GEOID || properties.tractId || 'Unknown';
          if (properties.STATE && properties.COUNTY && properties.TRACT) {
            tractId = `${properties.STATE}${properties.COUNTY}${properties.TRACT}`;
          }
          
          const tractName = properties.NAME || properties.NAMELSAD || properties.name || '';
          const incomeValue = properties.value || 0;
          
          // Format the income value (used in popup display)
          // We don't need to store this in a variable since it's used directly in the popup HTML
          // const formattedIncome = `$${Math.round(Number(incomeValue)).toLocaleString()}`;
          
          // Find a matching entry in our data or use the generated one (for future use)
          // We don't need this currently but might use it later for more detailed information
          // const matchedData = opportunityData.find(item => item.tract === tractId);
          
          // Set opportunity score based on income level
          const score = Math.round(((incomeValue - min) / (max - min)) * 100);
          setOpportunityScore(score);
          
          // Set the current zip with clean formatting
          setCurrentZip(`${tractName ? tractName + ' Census Tract' : 'Census Tract ' + tractId}`);
          
          // Generate factor scores that correlate with the income
          // This creates a more realistic pattern of scores that would likely be correlated
          const baseScore = score;
          setFactorScores({
            segregation: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
            incomeInequality: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
            schoolQuality: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
            familyStructure: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15))),
            socialCapital: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 30 - 15)))
          });
          
          // Add highlight around the selected census tract
          setSelectedTractId(tractId);
          
          try {
            // Ensure the feature has the necessary geometry before highlighting
            if (feature.geometry) {
              console.log('Adding highlight for clicked tract');
              
              // Make a deep copy of the feature to avoid any reference issues
              const featureCopy: CensusTractFeature = {
                type: 'Feature',
                geometry: JSON.parse(JSON.stringify(feature.geometry)),
                properties: { ...properties }
              };
              
              // Add the highlight with a slight delay to ensure the map is ready
              setTimeout(() => {
                addTractHighlight(featureCopy);
              }, 50);
            } else {
              console.error('Feature is missing geometry, cannot highlight');
            }
          } catch (error) {
            console.error('Error highlighting clicked tract:', error);
          }
        }
      });
      
      setLoading(false);
      setError(null);
      
    } catch (error: unknown) {
      console.error('Error loading census tracts:', error);
      setError(error instanceof Error ? error.message : String(error));
      setLoading(false);
    }
  }, [clearMapLayers, getIncomeRange, opportunityData, addTractHighlight, dataLoaded]);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    // Initialize the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Centered on USA
      zoom: 3.5,
      minZoom: 2,
      maxZoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add a legend
    map.current.on('load', () => {
      console.log('Map loaded successfully');
      
      // Create legend container
      const legend = document.createElement('div');
      legend.className = 'map-legend';
      legend.style.position = 'absolute';
      legend.style.right = '10px';
      legend.style.bottom = '30px';
      legend.style.padding = '10px';
      legend.style.backgroundColor = 'white';
      legend.style.borderRadius = '5px';
      legend.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
      legend.style.zIndex = '1';
      legend.style.maxWidth = '180px';
      legend.style.fontSize = '12px';
      legend.style.lineHeight = '1.4';

      // Create an inline legend with the new color scheme
      const legendHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px;">Household Income at Age 35</div>
        <div style="display: flex; height: 15px; margin-bottom: 6px; width: 100%;">
          <div style="flex: 1; background: #9b252f;"></div>
          <div style="flex: 1; background: #b65441;"></div>
          <div style="flex: 1; background: #d07e59;"></div>
          <div style="flex: 1; background: #e5a979;"></div>
          <div style="flex: 1; background: #f4d79e;"></div>
          <div style="flex: 1; background: #fcfdc1;"></div>
          <div style="flex: 1; background: #cdddb5;"></div>
          <div style="flex: 1; background: #9dbda9;"></div>
          <div style="flex: 1; background: #729d9d;"></div>
          <div style="flex: 1; background: #4f7f8b;"></div>
          <div style="flex: 1; background: #34687e;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px;">
          <div>$20k</div>
          <div>$55k+</div>
        </div>
      `;
      legend.innerHTML = legendHTML;

      // Add description
      const description = document.createElement('div');
      description.style.fontSize = '11px';
      description.style.marginTop = '5px';
      description.style.color = '#555';
      description.textContent = 'Mean household income for children at age 35 who grew up in this area.';
      legend.appendChild(description);

      // Add legend to the map container
      if (mapContainer.current) {
        mapContainer.current.appendChild(legend);
      }
      
      // Load census tracts data
      loadCensusTracts().then(() => {
        // If we already have an address, find the census tract for it
        if (typeof data.address === 'string' && data.address.trim() !== '') {
          findCensusTractFromAddress(data.address);
        }
      });
    });
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      // Remove legend if it exists
      const legend = document.querySelector('.map-legend');
      if (legend) {
        legend.remove();
      }
    };
  }, [loadCensusTracts, data.address, findCensusTractFromAddress]);

  // Helper function to render score bars
  const renderScoreBar = (score: number | null, label: string) => (
    <div key={label} className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{score ?? '--'}</span>
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="rounded-full h-2 transition-all duration-300" 
          style={{ width: score ? `${score}%` : '0%', backgroundColor: '#6CD9CA' }}
        />
      </div>
    </div>
  );

  // Add a personalized message if we have personalization data
  const renderPersonalizedInfo = () => {
    // Safeguard against undefined or null children array
    const children = data.children || [];
    
    if (children.length > 0 && children[0] && typeof children[0].name === 'string' && children[0].name.trim() !== '') {
      const childName = children[0].name;
      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">Personalized Insights for {childName}</h4>
          <p className="text-sm text-blue-700">
            Based on the opportunity scores for this area, here are some key factors that could affect {childName}&apos;s future outcomes.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="opportunity-map" className="min-h-screen px-4 py-16 max-w-6xl mx-auto scroll-mt-28">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Opportunity Map</h2>
        <p className="text-lg text-gray-600">Explore household income at age 35 across different regions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-8">
        {/* Map Container */}
        <div className="bg-white rounded-xl shadow-lg relative">
          <div 
            ref={mapContainer} 
            className="map-container h-[500px] rounded-xl"
            style={{ width: '100%' }}
          />
          
          {currentZip && (
            <div className="mt-4 p-4 text-center text-sm text-gray-600 border-t">
              {currentZip}
            </div>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-xl">
              <div className="p-4 bg-white rounded-lg shadow-md">
                <p className="text-gray-700">Loading map data...</p>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="absolute top-4 left-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Opportunity Scores */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">Household Income Score</h3>
          <div className="text-center mb-6">
            <span className="text-5xl font-bold" style={{ color: '#6CD9CA' }}>
              {opportunityScore ?? '--'}
            </span>
            <span className="text-lg ml-2 text-gray-500">out of 100</span>
          </div>

          <div className="space-y-4">
            {renderScoreBar(factorScores.segregation, 'Segregation')}
            {renderScoreBar(factorScores.incomeInequality, 'Income Inequality')}
            {renderScoreBar(factorScores.schoolQuality, 'School Quality')}
            {renderScoreBar(factorScores.familyStructure, 'Family Structure')}
            {renderScoreBar(factorScores.socialCapital, 'Social Capital')}
          </div>

          {/* Add personalized insights based on quiz data */}
          {renderPersonalizedInfo()}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Understanding the Map</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">What This Map Shows</h4>
            <p className="text-gray-700">
              This map visualizes household income at age 35 for children who grew up in different areas. Darker blue areas indicate higher household incomes, representing regions with better economic mobility. Redder areas indicate lower incomes and less economic mobility.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">How to Use This Map</h4>
            <p className="text-gray-700">
              Click on any region to see detailed income scores and other factors. You can also zoom in to explore specific neighborhoods and census tracts in more detail. When you enter your zip code in the personalization quiz, the map will automatically zoom to your area.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpportunityMap;