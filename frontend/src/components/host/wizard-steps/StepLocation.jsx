import React from 'react';
import { GlassInput, GlassButton } from '../../common/GlassComponents';
import { MapPin } from 'lucide-react';

const StepLocation = ({ data, updateData, onNext, onBack }) => {
  const handleNext = () => {
    if (data.venueName && data.venueAddress) {
      onNext(true);
    } else {
      alert("Please enter the Venue Name and Address.");
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

        {/* Mock Map Preview */}
        {data.venueAddress && (
          <div className="mt-6 p-1 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <div className="bg-slate-900 rounded-lg h-48 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
              {/* Map background pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <MapPin className="w-8 h-8 text-red-500 mb-2 drop-shadow-lg z-10" />
              <p className="text-white font-medium z-10 text-center px-4">{data.venueName || "Venue"}</p>
              <p className="text-sm text-slate-400 z-10 text-center px-4">{data.venueAddress}</p>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white/50">Google Maps Preview</div>
            </div>
          </div>
        )}
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
