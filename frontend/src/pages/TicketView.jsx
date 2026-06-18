import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Maximize2, Ticket } from 'lucide-react';
import { GlassCard, GlassButton } from '../components/common/GlassComponents';
// We would normally import QRCode from a library like qrcode.react here
// import { QRCodeSVG } from 'qrcode.react';

const TicketView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [brightness, setBrightness] = useState(false);

  // Mock ticket data based on token
  const ticket = {
    event_name: 'Neon Nights Festival',
    ticket_type: 'VIP Pass',
    token: token,
    owner_name: 'Alberto Cortes'
  };

  const handleMaxBrightness = () => {
    setBrightness(!brightness);
    // In a real app with PWA features or native bridging, we'd boost screen brightness here.
    if (!brightness) {
      alert("Screen brightness optimized for scanning (mock).");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex flex-col pt-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pb-4 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-white font-bold tracking-widest text-sm uppercase">Access Pass</span>
        <button onClick={handleMaxBrightness} className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Ticket Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className={`w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${brightness ? 'ring-4 ring-blue-500 shadow-blue-500/50' : ''}`}>
          
          {/* Ticket Header (White bg) */}
          <div className="p-6 text-center border-b-2 border-dashed border-slate-200 relative">
            {/* Cutouts for dashed line */}
            <div className="absolute -left-3 bottom-[-13px] w-6 h-6 bg-[#0a0e17] rounded-full"></div>
            <div className="absolute -right-3 bottom-[-13px] w-6 h-6 bg-[#0a0e17] rounded-full"></div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-1">{ticket.event_name}</h2>
            <p className="text-blue-600 font-bold uppercase tracking-wide">{ticket.ticket_type}</p>
          </div>

          {/* QR Code Section */}
          <div className="p-8 flex flex-col items-center bg-white">
            <div className="w-64 h-64 bg-slate-100 rounded-xl flex items-center justify-center p-4 border border-slate-200 relative">
              {/* Fake QR for UI demo */}
              <div className="w-full h-full border-8 border-slate-900 flex items-center justify-center bg-white relative">
                 <div className="grid grid-cols-4 grid-rows-4 gap-1 w-3/4 h-3/4">
                    {Array.from({length: 16}).map((_, i) => (
                      <div key={i} className={`bg-slate-900 ${i % 3 === 0 || i % 7 === 0 ? 'opacity-0' : ''}`}></div>
                    ))}
                 </div>
                 {/* Center icon */}
                 <div className="absolute bg-white p-2">
                    <Ticket className="w-6 h-6 text-slate-900" />
                 </div>
              </div>
              {/* Real implementation: */}
              {/* <QRCodeSVG value={ticket.token} size={256} level="H" includeMargin={true} /> */}
            </div>
            
            <p className="mt-6 text-sm font-mono text-slate-500 tracking-widest break-all text-center">
              {ticket.token.substring(0, 16)}...
            </p>
          </div>

          {/* Footer details */}
          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Ticket Holder</p>
            <p className="font-bold text-slate-800">{ticket.owner_name}</p>
          </div>
        </div>
        
        <p className="mt-8 text-slate-400 text-sm text-center max-w-xs">
          Present this screen at the entrance. Turn up your screen brightness for faster scanning.
        </p>
      </div>
    </div>
  );
};

export default TicketView;
