'use client'

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';

const OpportunityMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapView, setMapView] = useState<'commuting' | 'census'>('commuting');

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Centered on USA
      zoom: 3,
      projection: 'mercator', // Use mercator for a flat projection
      renderWorldCopies: false // Prevent rendering multiple world copies
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());
  }, []);

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
          </div>
        </div>

        {/* Opportunity Scores */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">Opportunity Score</h3>
          <div className="text-center mb-6">
            <span className="text-5xl font-bold text-primary">
              --
            </span>
            <span className="text-lg ml-2 text-gray-500">out of 100</span>
          </div>

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