import React from 'react';
import { GlassButton } from '../../common/GlassComponents';
import { Building2, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

const StepPayouts = ({ data, updateData, onBack, onPublish, isSubmitting }) => {

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white mb-2">Payouts & Publishing</h3>
        <p className="text-slate-400">How do you want to get paid for your ticket sales?</p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Option A: Centralized */}
        <div 
          onClick={() => updateData({ payoutMethod: 'centralized' })}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            data.payoutMethod === 'centralized' 
            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-start">
            <div className={`p-3 rounded-xl mr-4 ${data.payoutMethod === 'centralized' ? 'bg-blue-500' : 'bg-slate-700'}`}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-lg font-bold text-white">TicketSpace Managed <span className="text-xs font-normal text-blue-300 ml-2 bg-blue-500/20 px-2 py-0.5 rounded">Easiest</span></h4>
                {data.payoutMethod === 'centralized' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
              </div>
              <p className="text-sm text-slate-400 mb-3">We handle the payments and liability. You receive a manual bank transfer 3 days after your event finishes.</p>
              <ul className="text-xs text-slate-300 space-y-1">
                <li className="flex items-center"><CheckCircle2 className="w-3 h-3 text-green-400 mr-2" /> Zero setup required. Start selling instantly.</li>
                <li className="flex items-center"><CheckCircle2 className="w-3 h-3 text-green-400 mr-2" /> We handle chargebacks and disputes.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Option B: Decentralized / Stripe Connect */}
        <div 
          onClick={() => updateData({ payoutMethod: 'stripe_connect' })}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            data.payoutMethod === 'stripe_connect' 
            ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-start">
            <div className={`p-3 rounded-xl mr-4 ${data.payoutMethod === 'stripe_connect' ? 'bg-purple-500' : 'bg-slate-700'}`}>
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-lg font-bold text-white">Direct Stripe Connect <span className="text-xs font-normal text-purple-300 ml-2 bg-purple-500/20 px-2 py-0.5 rounded">Pro</span></h4>
                {data.payoutMethod === 'stripe_connect' && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
              </div>
              <p className="text-sm text-slate-400 mb-3">Connect your own Stripe account. Ticket money goes directly into your bank account instantly as sales happen.</p>
              <ul className="text-xs text-slate-300 space-y-1">
                <li className="flex items-center"><CheckCircle2 className="w-3 h-3 text-green-400 mr-2" /> Instant payouts directly to you.</li>
                <li className="flex items-center"><CheckCircle2 className="w-3 h-3 text-green-400 mr-2" /> You control your own refunds.</li>
                <li className="flex items-center text-yellow-400 mt-2"><AlertCircle className="w-3 h-3 mr-2" /> Requires identity verification via Stripe (3 mins).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
        <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" /> Ready to Publish?
        </h4>
        <p className="text-sm text-blue-200/70">
          Double check your details. Once published, your event will be live and attendees can start buying tickets immediately according to your drop schedules.
        </p>
      </div>

      <div className="pt-6 border-t border-white/10 flex justify-between">
        <GlassButton onClick={onBack} variant="ghost" className="text-slate-300 hover:text-white" disabled={isSubmitting}>
          Back
        </GlassButton>
        <GlassButton onClick={onPublish} disabled={isSubmitting} className="px-8 bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]">
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </span>
          ) : (
            'Publish Event'
          )}
        </GlassButton>
      </div>
    </div>
  );
};

// We need to import Info here since it wasn't imported at the top
import { Info } from 'lucide-react';

export default StepPayouts;
