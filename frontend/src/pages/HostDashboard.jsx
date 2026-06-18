import React, { useState } from 'react';
import { Plus, BarChart3, Users, Ticket, DollarSign, Calendar, MapPin, MoreHorizontal, TrendingUp } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { GlassCard, GlassButton } from '../components/common/GlassComponents';
import EventCreationWizard from '../components/host/EventCreationWizard';
import { useNavigate } from 'react-router-dom';

const HostDashboard = () => {
  const navigate = useNavigate();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Mock data for the dashboard
  const stats = [
    { label: 'Total Revenue', value: '€12,450', icon: DollarSign, trend: '+14%' },
    { label: 'Tickets Sold', value: '845', icon: Ticket, trend: '+22%' },
    { label: 'Page Views', value: '4.2K', icon: BarChart3, trend: '+5%' },
    { label: 'Active Promoters', value: '12', icon: Users, trend: '+2' }
  ];

  const activeEvents = [
    {
      id: 1,
      title: 'Neon Nights Festival',
      date: 'Aug 15, 2026',
      location: 'Main Arena, Madrid',
      sold: 450,
      capacity: 1000,
      revenue: '€6,750',
      status: 'On Sale'
    },
    {
      id: 2,
      title: 'Tech Conference 2026',
      date: 'Sep 10, 2026',
      location: 'Convention Center, Barcelona',
      sold: 395,
      capacity: 500,
      revenue: '€5,700',
      status: 'Selling Fast'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e17] relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 page-content">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Host Dashboard</h1>
            <p className="text-slate-400">Manage your events, staff, and track sales.</p>
          </div>
          <GlassButton onClick={() => setIsWizardOpen(true)} className="px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 border-blue-400/30">
            <Plus className="w-5 h-5 mr-2" /> Create New Event
          </GlassButton>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <stat.icon className="w-6 h-6 text-blue-400" />
                </div>
                <span className="inline-flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" /> {stat.trend}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white mb-1 relative z-10">{stat.value}</h3>
              <p className="text-sm text-slate-400 font-medium relative z-10">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Active Events List */}
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-bold text-white">Your Events</h2>
          <GlassButton variant="ghost" size="sm" className="text-blue-400">View All</GlassButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeEvents.map(event => (
            <GlassCard key={event.id} className="flex flex-col p-6 hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                    event.status === 'Selling Fast' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                    'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight mb-1">{event.title}</h3>
                </div>
                <GlassButton variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </GlassButton>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-300">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {event.date}
                </div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.location}
                </a>
              </div>

              {/* Progress bar for capacity */}
              <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Tickets Sold</span>
                  <span className="text-white font-medium">{event.sold} / {event.capacity}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-slate-400 block text-xs">Revenue</span>
                    <span className="text-white font-bold">{event.revenue}</span>
                  </div>
                  <GlassButton size="sm" variant="outline">Manage Event</GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </main>

      {/* Event Creation Wizard Modal */}
      {isWizardOpen && (
        <EventCreationWizard onClose={() => setIsWizardOpen(false)} />
      )}
    </div>
  );
};

export default HostDashboard;
