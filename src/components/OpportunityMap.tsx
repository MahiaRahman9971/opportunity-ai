'use client'

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { geocodeAddress, findCensusTract, highlightCensusTract } from '../utils/geocodingUtils';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';

interface OpportunityMapProps {
  address?: string;
}

const OpportunityMap: React.FC<OpportunityMapProps> = ({ address }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapView, setMapView] = useState<'commuting' | 'census'>('census'); // Always using census view now
  const [selectedTract, setSelectedTract] = useState<any>(null);
  const [mapStyleLoaded, setMapStyleLoaded] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [userTractId, setUserTractId] = useState<string | null>(null);
  const [userTractGeometry, setUserTractGeometry] = useState<any>(null);
  const sourceLayerRef = useRef<string>('ct_tract_kfr_rP_gP_p25-8tx22d');

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Centered on USA
      zoom: 3,
      projection: 'mercator',
      renderWorldCopies: false,
      preserveDrawingBuffer: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Set up event listener for map loading
    map.current.on('load', () => {
      console.log('Map fully loaded');
      setMapStyleLoaded(true);
      
      // Add sources immediately on load
      if (map.current) {
        try {
          // Add streets source
          map.current.addSource('mapbox-streets', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-streets-v8'
          });
          
          // Add data source
          map.current.addSource('ct-opportunity-data', {
            type: 'vector',
            url: 'mapbox://mahiar.bdsxlspn'
          });
          
          // Add layers
          addMapLayers('ct_tract_kfr_rP_gP_p25-8tx22d');
        } catch (error) {
          console.error('Error setting up map on load:', error);
        }
      }
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Note: Map sources are added in the map.on('load') callback

  // Function to add map layers with the correct source layer
  const addMapLayers = (sourceLayer: string) => {
    if (!map.current) return;
    
    try {
      console.log('Adding census tract fill layer with source layer:', sourceLayer);
      
      // Add the main fill layer for census tracts first (so it appears below the streets)
      map.current.addLayer({
        id: 'census-tracts-layer',
        type: 'fill',
        source: 'ct-opportunity-data',
        'source-layer': sourceLayer,
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            // First try with exact property name from image 2
            ['coalesce', 
              ['get', 'Household_Income_at_Age_35_rP_gP_p25'], 
              ['get', 'household_income_at_age_35_rp_gp_p25'],
              ['get', 'Household_Income_at_Age_35-rP_gP_p25'],
              0
            ],
            10000, '#9b252f',  // <$10k - accent1 (dark red)
            25000, '#b65441',  // 25k - accent2 (red)
            28000, '#d07e59',  // 28k - accent3 (orange)
            30000, '#e5a979',  // 30k - accent4 (light orange)
            32000, '#f4d79e',  // 32k - accent5 (yellow)
            34000, '#fcfdc1',  // 34k - accent6 (light yellow)
            36000, '#cdddb5',  // 36k - accent7 (light green)
            38000, '#9dbda9',  // 38k - accent8 (green)
            41000, '#729d9d',  // 41k - accent9 (teal)
            45000, '#4f7f8b',  // 45k - accent10 (blue)
            60000, '#34687e'   // >$60k - accent11 (dark blue)
          ],
          'fill-opacity': 0.8, // Less transparent to match second image
          'fill-outline-color': '#000000'
        }
      }, 'poi-label'); // Place below POI labels
      
      // Now add street layers on top of the census tracts
      // Add a background layer for streets (creates a white outline effect)
      map.current.addLayer({
        id: 'streets-background',
        type: 'line',
        source: 'mapbox-streets',
        'source-layer': 'road',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.25,  // At zoom level 8, street outlines are extremely thin
            10, 0.4, // At zoom level 10, street outlines are very thin
            12, 0.6, // At zoom level 12, street outlines are thin
            15, 0.8, // At zoom level 15, street outlines are medium-thin
            20, 1.2  // At zoom level 20, street outlines are thinner than before
          ],
          'line-opacity': 0.8
        }
      }); // No need to specify a layer to insert before, it will go on top
      
      // Add regular street layer on top of the background
      map.current.addLayer({
        id: 'streets-layer',
        type: 'line',
        source: 'mapbox-streets',
        'source-layer': 'road',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#f7f7f7', // Slightly off-white for the inner part
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.25, // At zoom level 8, streets are extremely thin
            10, 0.5, // At zoom level 10, streets are very thin
            12, 0.75, // At zoom level 12, streets are thin
            15, 1,   // At zoom level 15, streets are medium
            20, 1.5  // At zoom level 20, streets are slightly thicker
          ],
          'line-opacity': 0.7
        }
      }); // No need to specify a layer to insert before, it will go on top
      
      // Add a background layer for major roads (creates a white outline effect)
      map.current.addLayer({
        id: 'major-streets-background',
        type: 'line',
        source: 'mapbox-streets',
        'source-layer': 'road',
        filter: ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.4, // At zoom level 8, major street outlines are very thin
            10, 0.6, // At zoom level 10, major street outlines are thin
            12, 0.8, // At zoom level 12, major street outlines are medium-thin
            15, 1.2, // At zoom level 15, major street outlines are medium
            20, 1.8  // At zoom level 20, major street outlines are thinner than before
          ],
          'line-opacity': 0.9
        }
      }); // No need to specify a layer to insert before, it will go on top
      
      // Add major streets layer on top of everything
      map.current.addLayer({
        id: 'major-streets-layer',
        type: 'line',
        source: 'mapbox-streets',
        'source-layer': 'road',
        filter: ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#f0f0f0', // Slightly off-white for the inner part
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.5,  // At zoom level 8, major streets are thin
            10, 0.75, // At zoom level 10, major streets are thin
            12, 1,   // At zoom level 12, major streets are medium
            15, 1.5, // At zoom level 15, major streets are thicker
            20, 2.5  // At zoom level 20, major streets are thick but still subtle
          ],
          'line-opacity': 0.8
        }
      }); // No need to specify a layer to insert before, it will go on top
      
      // Add an outline layer to make census tract boundaries more visible
      map.current.addLayer({
        id: 'census-tracts-outline',
        type: 'line',
        source: 'ct-opportunity-data',
        'source-layer': sourceLayer,
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#000000',
          'line-width': 0.5
        }
      });

      // Add a hover layer with thicker lines to highlight selected tracts
      map.current.addLayer({
        id: 'census-tracts-hover',
        type: 'line',
        source: 'ct-opportunity-data',
        'source-layer': sourceLayer,
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#000',
          'line-width': 3,
          'line-opacity': 0.9
        },
        filter: ['==', 'GEOID', ''] // Default empty filter
      });
      
      // Add a custom source for the user's location
      map.current.addSource('user-location-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        }
      });
      
      // Add a symbol layer with a large black dot for the user's location
      map.current.addLayer({
        id: 'user-location-symbol',
        type: 'circle',
        source: 'user-location-source',
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#000000',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });
      
      // Add a custom source for the user's tract outline
      map.current.addSource('user-tract-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[]]
          },
          properties: {}
        }
      });
      
      // Add a thick black outline layer for the user's tract (slightly less thick)
      map.current.addLayer({
        id: 'user-tract-outline',
        type: 'line',
        source: 'user-tract-source',
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#000000',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 3,   // At zoom level 8, width is 3px
            10, 5,  // At zoom level 10, width is 5px
            12, 8,  // At zoom level 12, width is 8px
            14, 12   // At zoom level 14, width is 12px
          ]
        }
      });
      
      // Remove the white inner outline
      
      // Log available properties in the first feature to help debug
      try {
        const features = map.current.querySourceFeatures('ct-opportunity-data', {
          sourceLayer: sourceLayer,
          validate: false
        });
        
        if (features && features.length > 0) {
          console.log('Example feature properties:', features[0].properties);
          console.log('Available property keys:', Object.keys(features[0].properties));
        } else {
          console.log('No features found in source');
        }
      } catch (err) {
        console.log('Could not query source features:', err);
      }
      
      // Add event handlers for the layers
      addEventHandlers();
      
      console.log('Successfully added layers with source layer:', sourceLayer);
    } catch (error) {
      console.error('Error adding map layers:', error);
    }
  };
  
  // Function to add event handlers to the map layers
  const addEventHandlers = () => {
    if (!map.current) return;
    
    // Function to handle feature click
    const handleFeatureClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const properties = feature.properties;
        console.log('Clicked feature properties:', properties);
        setSelectedTract(properties);
        
        // Update the hover layer to highlight the selected tract
        if (map.current?.getLayer('census-tracts-hover')) {
          // Check if GEOID exists and is a valid value before using it
          const geoid = properties.GEOID || properties.GEO_ID || '';
          if (geoid) {
            map.current.setFilter('census-tracts-hover', ['==', 'GEOID', geoid]);
            
            // Keep the user's tract highlighted if it exists
            if (userTractId && userTractGeometry && map.current.getSource('user-tract-source')) {
              (map.current.getSource('user-tract-source') as mapboxgl.GeoJSONSource).setData({
                type: 'Feature',
                geometry: userTractGeometry,
                properties: {}
              });
            }
          } else {
            // Reset filter if no valid GEOID is found
            map.current.setFilter('census-tracts-hover', ['==', 'GEOID', '']);
          }
        }
        
        // Log properties to help debug
        console.log('Feature properties for popup:', properties);
        
        // Get property values with fallbacks
        const geoid = properties.GEOID || properties.GEO_ID || 'N/A';
        
        // Format household income
        let householdIncome = 'N/A';
        if (properties.Household_Income_at_Age_35_rP_gP_p25) {
          const income = properties.Household_Income_at_Age_35_rP_gP_p25;
          householdIncome = '$' + Math.round(income).toLocaleString();
        }
        
        const county = properties.county || properties.COUNTY || 'N/A';
        const state = properties.state || properties.STATE || 'N/A';
        
        // Create popup with info
        if (popupRef.current) {
          popupRef.current.remove();
        }
        
        popupRef.current = new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="font-sans p-1">
              <h4 class="font-bold text-sm">Census Tract ${geoid}</h4>
              <p class="text-xs">Household Income: ${householdIncome}</p>
              <p class="text-xs">County: ${county}</p>
              <p class="text-xs">State: ${state}</p>
            </div>
          `)
          .addTo(map.current);
      }
    };
    
    // Add click events for the layers
    map.current.on('click', 'census-tracts-layer', handleFeatureClick);
    
    // Setup cursor behavior for the layer
    map.current.on('mouseenter', 'census-tracts-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    
    map.current.on('mouseleave', 'census-tracts-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };
  
  // Update layer visibility when mapView changes
  useEffect(() => {
    if (!map.current || !mapStyleLoaded) return;
    
    // Check if layers exist
    const hasLayers = map.current.getLayer('census-tracts-layer') && 
                     map.current.getLayer('census-tracts-outline') && 
                     map.current.getLayer('census-tracts-hover');
    
    if (hasLayers) {
      // Update layer visibility based on the current view
      map.current.setLayoutProperty(
        'census-tracts-layer', 
        'visibility', 
        mapView === 'census' ? 'visible' : 'none'
      );
      map.current.setLayoutProperty(
        'census-tracts-outline', 
        'visibility', 
        mapView === 'census' ? 'visible' : 'none'
      );
      map.current.setLayoutProperty(
        'census-tracts-hover', 
        'visibility', 
        mapView === 'census' ? 'visible' : 'none'
      );
      
      // Also update user tract outline visibility
      if (map.current.getLayer('user-tract-outline')) {
        map.current.setLayoutProperty(
          'user-tract-outline',
          'visibility',
          mapView === 'census' ? 'visible' : 'none'
        );
      }
      
      if (map.current.getLayer('user-location-symbol')) {
        map.current.setLayoutProperty(
          'user-location-symbol',
          'visibility',
          mapView === 'census' ? 'visible' : 'none'
        );
      }
      
      // No inner outline layer anymore
      
      // Make streets more visible when in census view
      if (map.current.getLayer('streets-layer')) {
        map.current.setPaintProperty(
          'streets-layer',
          'line-opacity',
          mapView === 'census' ? 0.9 : 0.5
        );
      }
      
      if (map.current.getLayer('major-streets-layer')) {
        map.current.setPaintProperty(
          'major-streets-layer',
          'line-opacity',
          mapView === 'census' ? 0.9 : 0.5
        );
      }
    } else if (mapStyleLoaded && map.current) {
      // If layers don't exist yet but map is loaded, try adding them directly
      try {
        // Add streets source
        if (!map.current.getSource('mapbox-streets')) {
          map.current.addSource('mapbox-streets', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-streets-v8'
          });
        }
        
        // Add data source
        if (!map.current.getSource('ct-opportunity-data')) {
          map.current.addSource('ct-opportunity-data', {
            type: 'vector',
            url: 'mapbox://mahiar.bdsxlspn'
          });
        }
        
        // Add layers
        addMapLayers('ct_tract_kfr_rP_gP_p25-8tx22d');
      } catch (error) {
        console.error('Error setting up map sources and layers:', error);
      }
    }
    
    // Clear any selected tract when switching views
    if (mapView !== 'census') {
      setSelectedTract(null);
      if (popupRef.current) popupRef.current.remove();
    }
  }, [mapView, mapStyleLoaded]);

  // Effect to handle address changes and zoom to the corresponding census tract
  useEffect(() => {
    const zoomToAddress = async () => {
      if (!address || !map.current || !mapStyleLoaded) return;
      
      try {
        console.log('Geocoding address:', address);
        
        // Geocode the address to get coordinates
        const coordinates = await geocodeAddress(address);
        if (!coordinates) {
          console.error('Failed to geocode address:', address);
          return;
        }
        
        console.log('Coordinates:', coordinates);
        
        // Fly to the coordinates
        map.current.flyTo({
          center: [coordinates.lng, coordinates.lat],
          zoom: 12,
          essential: true
        });
        
        // Wait for the map to finish moving before querying for features
        map.current.once('moveend', () => {
          if (!map.current) return;
          
          // Find the census tract at these coordinates
          const point = map.current.project([coordinates.lng, coordinates.lat]);
          const features = map.current.queryRenderedFeatures(point, {
            layers: ['census-tracts-layer']
          });
          
          if (features && features.length > 0) {
            const feature = features[0];
            const properties = feature.properties;
            console.log('Found census tract:', properties);
            
            // Get the tract ID
            const tractId = properties.GEOID || properties.GEO_ID || '';
            if (tractId) {
              setUserTractId(tractId);
              
              // Highlight the tract
              if (map.current.getLayer('census-tracts-hover')) {
                map.current.setFilter('census-tracts-hover', ['==', 'GEOID', tractId]);
              }
              
              // Store the geometry for the user's tract
              if (feature.geometry) {
                setUserTractGeometry(feature.geometry);
                
                // Update the user tract source with the new geometry
                if (map.current.getSource('user-tract-source')) {
                  (map.current.getSource('user-tract-source') as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: feature.geometry,
                    properties: {}
                  });
                }
                
                // Also update the user location point
                if (map.current.getSource('user-location-source')) {
                  (map.current.getSource('user-location-source') as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [coordinates.lng, coordinates.lat]
                    },
                    properties: {}
                  });
                }
              }
              
              // Set the selected tract to show its details
              setSelectedTract(properties);
              
              // Create a popup with the tract info
              if (popupRef.current) {
                popupRef.current.remove();
              }
              
              // Format household income
              let householdIncome = 'N/A';
              if (properties.Household_Income_at_Age_35_rP_gP_p25) {
                const income = properties.Household_Income_at_Age_35_rP_gP_p25;
                householdIncome = '$' + Math.round(income).toLocaleString();
              }
              
              const county = properties.county || properties.COUNTY || 'N/A';
              const state = properties.state || properties.STATE || 'N/A';
              
              popupRef.current = new mapboxgl.Popup()
                .setLngLat([coordinates.lng, coordinates.lat])
                .setHTML(`
                  <div class="font-sans p-1">
                    <h4 class="font-bold text-sm">Your Location</h4>
                    <p class="text-xs">Census Tract ${tractId}</p>
                    <p class="text-xs">Household Income: ${householdIncome}</p>
                    <p class="text-xs">County: ${county}</p>
                    <p class="text-xs">State: ${state}</p>
                  </div>
                `)
                .addTo(map.current);
            }
          } else {
            console.log('No census tract found at coordinates');
          }
        });
      } catch (error) {
        console.error('Error processing address:', error);
      }
    };
    
    zoomToAddress();
  }, [address, mapStyleLoaded]);

  return (
    <section id="opportunity-map" className="min-h-screen px-4 py-16 max-w-6xl mx-auto scroll-mt-28">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Opportunity Map</h2>
        <p className="text-lg text-gray-600">Explore economic mobility across different regions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-8">
        {/* Map Container */}
        <div className="bg-white rounded-xl shadow-lg">
          <div 
            ref={mapContainer} 
            className="map-container h-[500px] rounded-t-xl"
          />
          <div className="p-4 border-t">
            {/* Map Legend - Only visible when census tracts view is active */}
            {mapView === 'census' && (
              <div className="mb-2 p-2 bg-gray-50 rounded-lg w-3/4 mx-auto">
                <h4 className="text-xs font-semibold mb-1">Household Income at Age 35</h4>
                <div className="flex h-3 w-full">
                  <div className="h-full" style={{ backgroundColor: '#9b252f', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#b65441', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#d07e59', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#e5a979', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#f4d79e', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#fcfdc1', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#cdddb5', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#9dbda9', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#729d9d', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#4f7f8b', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#34687e', width: '9.1%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] mt-1">
                  <span>&lt;$10k</span>
                  <span>25k</span>
                  <span>28k</span>
                  <span>30k</span>
                  <span>32k</span>
                  <span>34k</span>
                  <span>36k</span>
                  <span>38k</span>
                  <span>41k</span>
                  <span>45k</span>
                  <span>&gt;$60k</span>
                </div>
              </div>
            )}
            {/* Buttons removed as requested */}
          </div>
        </div>

        {/* Opportunity Scores */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">Household Income</h3>
          <div className="text-center mb-6">
            <span className="text-5xl font-bold text-primary">
              {selectedTract && selectedTract.Household_Income_at_Age_35_rP_gP_p25 
                ? '$' + Math.round(selectedTract.Household_Income_at_Age_35_rP_gP_p25).toLocaleString() 
                : '--'}
            </span>
            <span className="text-lg ml-2 text-gray-500">income</span>
          </div>

          {selectedTract ? (
            <div className="text-sm text-gray-600 mb-4">
              <p><span className="font-semibold">Census Tract:</span> {selectedTract.GEOID || selectedTract.GEO_ID || 'N/A'}</p>
              <p><span className="font-semibold">County:</span> {selectedTract.county || selectedTract.COUNTY || 'N/A'}</p>
              <p><span className="font-semibold">State:</span> {selectedTract.state || selectedTract.STATE || 'N/A'}</p>
              <p className="mt-2 text-xs">Click on the map to view data for different areas</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-4">Click on a census tract to view detailed information</p>
          )}

          <div className="space-y-4">
            {[
              'Segregation',
              'Income Inequality', 
              'School Quality', 
              'Family Structure', 
              'Social Capital'
            ].map((label) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{label}</span>
                  <span className="text-sm text-gray-500">--</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2" 
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpportunityMap;