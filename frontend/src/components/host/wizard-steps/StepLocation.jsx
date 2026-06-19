import React, { useEffect, useState, useRef } from 'react';
import { GlassInput, GlassButton } from '../../common/GlassComponents';
import { MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const LocationSelector = ({ position, setPosition, fetchAddressFromCoords }) => {
  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      fetchAddressFromCoords(newPos.lat, newPos.lng);
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

// Component to recenter map when position changes programmatically
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.setView([position.lat, position.lng], map.getZoom() < 15 ? 15 : map.getZoom());
    }
  }, [position, map]);
  return null;
};

const StepLocation = ({ data, updateData, onNext, onBack }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const handleNext = () => {
    if (data.venueName && data.venueAddress && data.latitude && data.longitude) {
      onNext(true);
    } else {
      alert("Please enter the Venue Name, Address, and pin the location on the map.");
    }
  };

  const currentPos = data.latitude && data.longitude 
    ? { lat: data.latitude, lng: data.longitude } 
    : { lat: 40.4168, lng: -3.7038 }; // Default Madrid

  const handlePositionChange = (pos) => {
    updateData({ latitude: pos.lat, longitude: pos.lng });
  };

  // 1. Forward Geocoding: Search Address -> Get Coords
  const searchAddress = async (query) => {
    updateData({ venueAddress: query });
    
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const results = await res.json();
        setSuggestions(results);
      } catch (error) {
        console.error("Geocoding error", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce 500ms
  };

  const selectSuggestion = (suggestion) => {
    updateData({
      venueAddress: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    });
    setSuggestions([]);
  };

  // 2. Reverse Geocoding: Click Map -> Get Address
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const result = await res.json();
      if (result && result.display_name) {
        updateData({ venueAddress: result.display_name });
      }
    } catch (error) {
      console.error("Reverse geocoding error", error);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white mb-2">Location</h3>
        <p className="text-slate-400">Where is the event taking place?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Venue Name <span className="text-red-400">*</span></label>
          <GlassInput 
            placeholder="e.g., The Grand Theater" 
            value={data.venueName}
            onChange={(e) => updateData({ venueName: e.target.value })}
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Address <span className="text-red-400">*</span></label>
          <div className="relative">
            <GlassInput 
              placeholder="Start typing an address..." 
              value={data.venueAddress}
              onChange={(e) => searchAddress(e.target.value)}
              className="pl-10"
            />
            {isSearching ? (
               <div className="absolute left-3 top-3 w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            )}
          </div>
          
          {suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <div 
                  key={idx} 
                  className="p-3 hover:bg-white/10 cursor-pointer text-sm text-slate-300 border-b border-white/5 last:border-0"
                  onClick={() => selectSuggestion(s)}
                >
                  <MapPin className="inline w-3 h-3 mr-2 text-blue-400" />
                  {s.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Pin the exact location <span className="text-red-400">*</span></label>
          <p className="text-xs text-slate-400 mb-3">Click on the map to place the pin precisely where your venue entrance is.</p>
          <div className="p-1 rounded-xl bg-white/5 border border-white/10 relative z-0">
            <div className="h-64 w-full rounded-lg overflow-hidden relative z-0">
              <MapContainer 
                center={[currentPos.lat, currentPos.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <LocationSelector position={currentPos} setPosition={handlePositionChange} fetchAddressFromCoords={fetchAddressFromCoords} />
                <MapUpdater position={currentPos} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex justify-between">
        <GlassButton onClick={onBack} variant="ghost" className="text-slate-300 hover:text-white">
          Back
        </GlassButton>
        <GlassButton onClick={handleNext} className="px-8 bg-blue-600 hover:bg-blue-500">
          Continue to Tickets
        </GlassButton>
      </div>
    </div>
  );
};

export default StepLocation;
