import React from 'react';
import { NavLink } from 'react-router-dom';
import { GlassButton } from '../components/common/GlassComponents';
import { Ticket, Calendar, Shield, CreditCard } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <Ticket className="w-4 h-4" />
          <span>Next Generation Ticketing</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Experience Events <br />
          <span className="text-gradient">Like Never Before</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mb-10">
          Secure, digital-first event ticketing with smart QR codes and seamless wallet integration. Your access to unforgettable moments.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <NavLink to="/events">
            <GlassButton size="lg" className="w-full sm:w-auto">
              Browse Events
            </GlassButton>
          </NavLink>
          <NavLink to="/register">
            <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto">
              Host an Event
            </GlassButton>
          </NavLink>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Secure QR Tickets</h3>
            <p className="text-slate-400">Cryptographically signed digital tickets that prevent fraud and duplication.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Seamless Payments</h3>
            <p className="text-slate-400">Multiple payment options including credit cards, PayPal, and bank transfers.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Any Event Type</h3>
            <p className="text-slate-400">From general admission to seated venues, we handle all ticket types easily.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
