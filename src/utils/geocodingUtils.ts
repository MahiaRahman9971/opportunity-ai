/**
 * Utility functions for geocoding addresses and finding census tracts
 */

/**
 * Geocodes an address to get its coordinates
 * @param address - The address to geocode
 * @returns Promise with the coordinates {lng, lat} or null if geocoding fails
 */
export const geocodeAddress = async (address: string): Promise<{lng: number, lat: number} | null> => {
  try {
    // Using Mapbox Geocoding API
    const encodedAddress = encodeURIComponent(address);
    const accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}&country=us&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lng, lat };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Finds the census tract containing the given coordinates
 * @param map - The Mapbox GL map instance
 * @param coordinates - The coordinates {lng, lat}
 * @param sourceLayer - The source layer name for census tracts
 * @returns The census tract feature or null if not found
 */
export const findCensusTract = (
  map: mapboxgl.Map,
  coordinates: {lng: number, lat: number}
  // sourceLayer parameter removed as it was unused
): mapboxgl.MapboxGeoJSONFeature | null => {
  try {
    // Query the map for features at the given point
    const point = map.project([coordinates.lng, coordinates.lat]);
    const features = map.queryRenderedFeatures(point, {
      layers: ['census-tracts-layer']
    });
    
    if (features && features.length > 0) {
      return features[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error finding census tract:', error);
    return null;
  }
};

/**
 * Zooms and highlights a census tract on the map
 * @param map - The Mapbox GL map instance
 * @param tractId - The census tract ID (GEOID)
 * @param sourceLayer - The source layer name for census tracts
 */
export const highlightCensusTract = (
  map: mapboxgl.Map,
  tractId: string
): void => {
  try {
    // Set the filter to highlight the tract
    if (map.getLayer('census-tracts-hover')) {
      map.setFilter('census-tracts-hover', ['==', 'GEOID', tractId]);
    }
  } catch (error) {
    console.error('Error highlighting census tract:', error);
  }
};
