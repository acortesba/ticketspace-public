import React, { useEffect } from 'react';
import { GlassInput, GlassButton } from '../../common/GlassComponents';
import { MapPin } from 'lucide-react';
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
const LocationSelector = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

// Component to recenter map when position changes programmatically
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);
  return null;
};

const StepLocation = ({ data, updateData, onNext, onBack }) => {
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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Address <span className="text-red-400">*</span></label>
          <div className="relative">
            <GlassInput 
              placeholder="e.g., 123 Main St, Madrid, 28001" 
              value={data.venueAddress}
              onChange={(e) => updateData({ venueAddress: e.target.value })}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Pin the exact location <span className="text-red-400">*</span></label>
          <p className="text-xs text-slate-400 mb-3">Click on the map to place the pin precisely where your venue entrance is.</p>
          <div className="p-1 rounded-xl bg-white/5 border border-white/10">
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
                <LocationSelector position={currentPos} setPosition={handlePositionChange} />
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
