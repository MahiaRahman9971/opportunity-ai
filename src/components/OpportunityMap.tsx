'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';

interface FactorScores {
  segregation: number | null;
  incomeInequality: number | null;
  schoolQuality: number | null;
  familyStructure: number | null;
  socialCapital: number | null;
}

const OpportunityMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapView, setMapView] = useState<'commuting' | 'census'>('commuting');
  const [currentZip, setCurrentZip] = useState<string>('');
  const [opportunityScore, setOpportunityScore] = useState<number | null>(null);
  const [factorScores, setFactorScores] = useState<FactorScores>({
    segregation: null,
    incomeInequality: null,
    schoolQuality: null,
    familyStructure: null,
    socialCapital: null
  });

  // Helper function to clear map layers
  const clearMapLayers = useCallback(() => {
    if (!map.current) return;
    
    const layers = ['census-fills', 'census-borders', 'commuting-fills', 'commuting-borders'];
    
    // First, try to clean up event handlers by using empty handlers
    try {
      if (map.current.getLayer('census-fills')) {
        // Type assertion to work around TypeScript limitations with mapbox-gl
        map.current.off('click', 'census-fills', undefined as never);
        map.current.off('mouseenter', 'census-fills', undefined as never);
        map.current.off('mouseleave', 'census-fills', undefined as never);
      }
      
      if (map.current.getLayer('commuting-fills')) {
        map.current.off('click', 'commuting-fills', undefined as never);
        map.current.off('mouseenter', 'commuting-fills', undefined as never);
        map.current.off('mouseleave', 'commuting-fills', undefined as never);
      }
    } catch (e) {
      console.log('Error removing event handlers:', e);
    }
    
    // Then remove the layers
    layers.forEach(layer => {
      if (map.current && map.current.getLayer(layer)) {
        map.current.removeLayer(layer);
      }
    });
    
    // Optionally remove sources if needed
    ['census-tracts', 'counties', 'commuting-zones'].forEach(source => {
      if (map.current && map.current.getSource(source)) {
        try {
          map.current.removeSource(source);
        } catch (e) {
          console.log(`Error removing source ${source}:`, e);
        }
      }
    });
  }, []);
  
  // Function to load census tracts data
  const loadCensusTracts = useCallback(() => {
    if (!map.current || !map.current.loaded()) {
      console.log('Map not loaded yet');
      return;
    }
    
    // Clear any existing layers
    clearMapLayers();
    
    try {
      // Check if the source already exists
      if (!map.current.getSource('census-tracts')) {
        // Use a simplified GeoJSON for testing
        map.current.addSource('census-tracts', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [] // Empty for now, will be populated with real data
          }
        });
      }
      
      // For testing purposes, let's add a simplified county dataset
      if (!map.current.getSource('counties')) {
        map.current.addSource('counties', {
          type: 'vector',
          url: 'mapbox://mapbox.us-census-tract-10-710'
        });
      }
      
      // Add the counties layer as a temporary placeholder for census tracts
      if (!map.current.getLayer('census-fills')) {
        map.current.addLayer({
          'id': 'census-fills',
          'type': 'fill',
          'source': 'counties',
          'source-layer': 'tract',
          'paint': {
            'fill-opacity': 0.6,
            'fill-color': [
              'step',
              ['get', 'ALAND'],
              '#f8d5cc', 10000,
              '#f4bfb6', 100000,
              '#f1a8a1', 1000000,
              '#ee8f8b', 10000000,
              '#eb7876', 100000000,
              '#e35f64', 1000000000,
              '#d43d51'
            ]
          }
        });
      }
      
      // Add census tract borders
      if (!map.current.getLayer('census-borders')) {
        map.current.addLayer({
          'id': 'census-borders',
          'type': 'line',
          'source': 'counties',
          'source-layer': 'tract',
          'layout': {},
          'paint': {
            'line-color': '#627BC1',
            'line-width': 0.5
          }
        });
      }
      
      // Add click interaction
      map.current.on('click', 'census-fills', (e: mapboxgl.MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const properties = feature.properties || {};
          const tractId = properties.GEOID10 || feature.id || 'Unknown';
          
          // Generate random data for testing
          const mockOpportunityScore = Math.floor(Math.random() * 100);
          setOpportunityScore(mockOpportunityScore);
          
          // Update factor scores with random values
          setFactorScores({
            segregation: Math.floor(Math.random() * 100),
            incomeInequality: Math.floor(Math.random() * 100),
            schoolQuality: Math.floor(Math.random() * 100),
            familyStructure: Math.floor(Math.random() * 100),
            socialCapital: Math.floor(Math.random() * 100)
          });
          
          setCurrentZip(`Census Tract: ${tractId}`);
        }
      });
      
      // Change cursor on hover
      map.current.on('mouseenter', 'census-fills', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'census-fills', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      
    } catch (error) {
      console.error('Error loading census tracts:', error);
    }
  }, [clearMapLayers]);
  
  // Function to load commuting zones
  const loadCommutingZones = useCallback(() => {
    if (!map.current || !map.current.loaded()) {
      console.log('Map not loaded yet');
      return;
    }
    
    // Clear any existing layers
    clearMapLayers();
    
    try {
      // For testing purposes, let's use counties data as placeholder for commuting zones
      if (!map.current.getSource('commuting-zones')) {
        map.current.addSource('commuting-zones', {
          type: 'vector',
          url: 'mapbox://mapbox.82pkq93d'
        });
      }
      
      // Add fill layer for commuting zones
      if (!map.current.getLayer('commuting-fills')) {
        map.current.addLayer({
          'id': 'commuting-fills',
          'type': 'fill',
          'source': 'commuting-zones',
          'source-layer': 'original',
          'paint': {
            'fill-opacity': 0.6,
            'fill-color': [
              'step',
              ['get', 'CENSUSAREA'],
              '#ccedf5', 10,
              '#a8dff1', 50,
              '#85d2ed', 100,
              '#61c4e9', 500,
              '#3ea1d9', 1000,
              '#2181c4', 5000,
              '#0d60b0', 10000,
              '#08529c'
            ]
          }
        });
      }
      
      // Add border layer for commuting zones
      if (!map.current.getLayer('commuting-borders')) {
        map.current.addLayer({
          'id': 'commuting-borders',
          'type': 'line',
          'source': 'commuting-zones',
          'source-layer': 'original',
          'layout': {},
          'paint': {
            'line-color': '#627BC1',
            'line-width': 1
          }
        });
      }
      
      // Add click interaction
      map.current.on('click', 'commuting-fills', (e: mapboxgl.MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const properties = feature.properties || {};
          const zoneId = properties.COUNTY || feature.id || 'Unknown';
          
          // Generate random data for testing
          const mockOpportunityScore = Math.floor(Math.random() * 100);
          setOpportunityScore(mockOpportunityScore);
          
          // Update factor scores with random values
          setFactorScores({
            segregation: Math.floor(Math.random() * 100),
            incomeInequality: Math.floor(Math.random() * 100),
            schoolQuality: Math.floor(Math.random() * 100),
            familyStructure: Math.floor(Math.random() * 100),
            socialCapital: Math.floor(Math.random() * 100)
          });
          
          setCurrentZip(`Commuting Zone: ${zoneId}`);
        }
      });
      
      // Change cursor on hover
      map.current.on('mouseenter', 'commuting-fills', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'commuting-fills', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      
    } catch (error) {
      console.error('Error loading commuting zones:', error);
    }
  }, [clearMapLayers]);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    // Initialize the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Centered on USA
      zoom: 3,
      minZoom: 2,
      maxZoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());
    
    // Handle map load event
    map.current.on('load', () => {
      console.log('Map loaded successfully');
      
      // Default to commuting zones view
      loadCommutingZones();
    });
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [loadCommutingZones]);
  
  // Handle switching between map views
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    if (mapView === 'census') {
      loadCensusTracts();
    } else {
      loadCommutingZones();
    }
  }, [mapView, loadCensusTracts, loadCommutingZones]);

  // Helper function to render score bars
  const renderScoreBar = (score: number | null, label: string) => (
    <div key={label} className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{score ?? '--'}</span>
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary rounded-full h-2 transition-all duration-300" 
          style={{ width: score ? `${score}%` : '0%' }}
        />
      </div>
    </div>
  );

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
            style={{ width: '100%' }}
          />
          <div className="p-4 border-t">
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setMapView('commuting')}
                className={`px-4 py-2 rounded-full ${
                  mapView === 'commuting' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Commuting Zones
              </button>
              <button 
                onClick={() => setMapView('census')}
                className={`px-4 py-2 rounded-full ${
                  mapView === 'census' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Census Tracts
              </button>
            </div>
            
            {currentZip && (
              <div className="mt-4 text-center text-sm text-gray-600">
                {currentZip}
              </div>
            )}
          </div>
        </div>

        {/* Opportunity Scores */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">Opportunity Score</h3>
          <div className="text-center mb-6">
            <span className="text-5xl font-bold text-primary">
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
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Understanding the Map</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">What are Census Tracts?</h4>
            <p className="text-gray-700">
              Census tracts are small, relatively permanent statistical subdivisions of a county, usually containing between 1,200 and 8,000 people. They provide a stable set of geographic units for presenting decennial census data.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">How to Use This Map</h4>
            <p className="text-gray-700">
              Click on any region to see detailed opportunity scores. Blue areas indicate higher opportunity, while red areas represent lower opportunity. You can toggle between viewing commuting zones (larger areas) and census tracts (smaller, more detailed areas).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpportunityMap;