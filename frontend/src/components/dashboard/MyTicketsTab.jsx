import React, { useState, useEffect } from 'react';
import { QrCode, Download, Calendar, MapPin, RefreshCcw, Ticket } from 'lucide-react';
import { GlassCard, GlassButton } from '../common/GlassComponents';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/api';

const MyTicketsTab = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketService.getMyTickets()
      .then(data => {
        setTickets(data.tickets || []);
      })
      .catch(err => {
        console.error('Failed to fetch tickets:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Ticket className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No upcoming tickets</h3>
        <p className="text-slate-400 mb-8 max-w-md">You don't have any tickets for upcoming events. Discover what's happening near you.</p>
        <GlassButton onClick={() => navigate('/events')}>Discover Events</GlassButton>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {tickets.map(ticket => {
        // Parse DATETIME string
        const eventDate = new Date(ticket.event_start);
        const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const location = ticket.venue_name + (ticket.venue_address ? `, ${ticket.venue_address}` : '');

        return (
          <GlassCard key={ticket.id} className="flex flex-col p-6 hover:border-blue-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                  ticket.status === 'active' || ticket.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {ticket.status.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">{ticket.event_name}</h3>
                <p className="text-sm text-blue-400 font-medium">{ticket.ticket_type}</p>
              </div>
              <GlassButton 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 px-3 py-2"
                onClick={() => navigate(`/ticket/${ticket.token}`)}
              >
                <QrCode className="w-5 h-5 text-white" />
              </GlassButton>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center text-sm text-slate-300">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                {formattedDate} at {formattedTime}
              </div>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {location}
              </a>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <div className="grid grid-cols-2 gap-2">
                <GlassButton variant="ghost" size="sm" className="text-xs">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                </GlassButton>
                <GlassButton variant="ghost" size="sm" className="text-xs">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Calendar
                </GlassButton>
              </div>
              <GlassButton variant="outline" size="sm" className="w-full mt-2 border-white/20">
                Add to Apple Wallet
              </GlassButton>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

export default MyTicketsTab;
