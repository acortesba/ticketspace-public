import React from 'react';
import { GlassInput, GlassButton } from '../../common/GlassComponents';

const StepBasicInfo = ({ data, updateData, onNext, isFirstStep }) => {
  const handleNext = () => {
    // Basic validation
    if (data.title && data.startDate && data.endDate) {
      onNext(true);
    } else {
      alert("Please fill in all required fields (Title, Start Date, End Date).");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white mb-2">Event Details</h3>
        <p className="text-slate-400">Let's start with the basics. What are you organizing?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Event Title <span className="text-red-400">*</span></label>
          <GlassInput 
            placeholder="e.g., Summer Music Festival 2026" 
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            className="text-lg py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all min-h-[120px] resize-y"
            placeholder="Tell your attendees what to expect..."
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Event Type <span className="text-red-400">*</span></label>
            <select
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
              value={data.eventType}
              onChange={(e) => updateData({ eventType: e.target.value })}
            >
              <option value="party">Party / Clubbing</option>
              <option value="concert">Live Concert</option>
              <option value="festival">Festival</option>
              <option value="conference">Conference / Meetup</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Allocation Type <span className="text-red-400">*</span></label>
            <select
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
              value={data.allocationType}
              onChange={(e) => updateData({ allocationType: e.target.value })}
            >
              <option value="general_admission">General Admission (Standing)</option>
              <option value="seated">Seated</option>
              <option value="mixed">Mixed (Standing & Seated)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Start Date & Time <span className="text-red-400">*</span></label>
            <GlassInput 
              type="datetime-local" 
              value={data.startDate}
              onChange={(e) => updateData({ startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">End Date & Time <span className="text-red-400">*</span></label>
            <GlassInput 
              type="datetime-local" 
              value={data.endDate}
              onChange={(e) => updateData({ endDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Doors Open (Optional)</label>
          <GlassInput 
            type="time" 
            value={data.doorsOpen}
            onChange={(e) => updateData({ doorsOpen: e.target.value })}
          />
          <p className="text-xs text-slate-500 mt-2">If different from the start time, let attendees know when they can arrive.</p>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
        <GlassButton onClick={handleNext} className="px-8 bg-blue-600 hover:bg-blue-500">
          Continue to Location
        </GlassButton>
      </div>
    </div>
  );
};

export default StepBasicInfo;
