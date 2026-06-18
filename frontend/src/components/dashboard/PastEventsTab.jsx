import React, { useState } from 'react';
import { Download, Calendar, MapPin, Star } from 'lucide-react';
import { GlassCard, GlassButton } from '../common/GlassComponents';

const PastEventsTab = () => {
  // Mock data
  const [tickets] = useState([
    {
      id: 99,
      event_name: 'Summer Vibes 2025',
      date: 'Aug 20, 2025',
      time: '18:00',
      location: 'Beach Club, Ibiza',
      ticket_type: 'Standard',
      status: 'used',
    }
  ]);

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No past events</h3>
        <p className="text-slate-400 mb-8 max-w-md">You haven't attended any events yet. When you do, they'll appear here for your records.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {tickets.map(ticket => (
        <GlassCard key={ticket.id} className="flex flex-col md:flex-row md:items-center p-5 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex-1 mb-4 md:mb-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-300 border border-white/10 mb-2">
              {ticket.status.toUpperCase()}
            </span>
            <h3 className="text-lg font-bold text-white mb-1">{ticket.event_name}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {ticket.date}</span>
              <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {ticket.location}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 md:ml-auto">
            <GlassButton variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Receipt
            </GlassButton>
            <GlassButton variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400">
              <Star className="w-4 h-4 mr-2" /> Review
            </GlassButton>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default PastEventsTab;
