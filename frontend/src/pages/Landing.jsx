import React from 'react';
import { NavLink } from 'react-router-dom';
import { GlassButton } from '../components/common/GlassComponents';
import { Ticket, Calendar, Shield, CreditCard } from 'lucide-react';

const Landing = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-5">
          <Ticket className="w-4 h-4" />
          <span>Next Generation Ticketing</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
          Experience Events{' '}
          <span className="text-gradient">Like Never Before</span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-xl mb-7">
          Secure, digital-first event ticketing with smart QR codes and seamless wallet integration. Your access to unforgettable moments.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
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
      </div>

      {/* Features — compact, horizontal cards */}
      <div className="w-full max-w-4xl mt-10 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Secure QR Tickets</h3>
            <p className="text-xs text-slate-400">Cryptographically signed digital tickets that prevent fraud and duplication.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Seamless Payments</h3>
            <p className="text-xs text-slate-400">Multiple payment options including credit cards, PayPal, and bank transfers.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Any Event Type</h3>
            <p className="text-xs text-slate-400">From general admission to seated venues, we handle all ticket types easily.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
