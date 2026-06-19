import React, { useState } from 'react';
import { GlassInput, GlassButton, GlassCard } from '../../common/GlassComponents';
import { Plus, Trash2, Ticket, Clock } from 'lucide-react';

const StepTickets = ({ data, updateData, onNext, onBack }) => {
  const [newTicket, setNewTicket] = useState({
    name: '',
    price: '',
    quantity: '',
    saleStart: '',
    saleEnd: ''
  });

  const addTicket = () => {
    if (!newTicket.name || !newTicket.price || !newTicket.quantity) {
      alert("Please fill in Name, Price, and Quantity for the ticket tier.");
      return;
    }
    
    updateData({
      tickets: [...data.tickets, { ...newTicket, id: Date.now() }]
    });
    
    // Reset form
    setNewTicket({
      name: '',
      price: '',
      quantity: '',
      saleStart: '',
      saleEnd: ''
    });
  };

  const removeTicket = (id) => {
    updateData({
      tickets: data.tickets.filter(t => t.id !== id)
    });
  };

  const handleNext = () => {
    if (data.tickets && data.tickets.length > 0) {
      onNext(true);
    } else {
      alert("Please add at least one ticket type or drop.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white mb-2">Ticket Types</h3>
        <p className="text-slate-400">Create the different types of tickets available for your event (e.g., General Admission, VIP, Early Bird).</p>
      </div>

      <div className="space-y-6">
        {/* Added Tickets List */}
        {data.tickets && data.tickets.length > 0 && (
          <div className="space-y-3 mb-8">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Configured Tickets</h4>
            {data.tickets.map(ticket => (
              <GlassCard key={ticket.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between border-blue-500/30">
                <div className="mb-3 md:mb-0">
                  <div className="flex items-center">
                    <Ticket className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="font-bold text-white text-lg">{ticket.name}</span>
                    <span className="ml-3 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                      €{ticket.price}
                    </span>
                    <span className="ml-2 text-sm text-slate-400">{ticket.quantity} tickets</span>
                  </div>
                  {(ticket.saleStart || ticket.saleEnd) && (
                    <div className="flex items-center text-xs text-slate-400 mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {ticket.saleStart ? new Date(ticket.saleStart).toLocaleString() : 'Now'} 
                      {' - '} 
                      {ticket.saleEnd ? new Date(ticket.saleEnd).toLocaleString() : 'Event Start'}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeTicket(ticket.id)}
                  className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors self-start md:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Add New Ticket Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-4">Add Ticket Type</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Ticket Name (e.g. VIP) *</label>
              <GlassInput 
                value={newTicket.name} 
                onChange={e => setNewTicket({...newTicket, name: e.target.value})} 
                placeholder="VIP Admission"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Price (€) *</label>
              <GlassInput 
                type="number" 
                min="0"
                step="0.01"
                value={newTicket.price} 
                onChange={e => setNewTicket({...newTicket, price: e.target.value})} 
                placeholder="15.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Quantity Available *</label>
              <GlassInput 
                type="number" 
                min="1"
                value={newTicket.quantity} 
                onChange={e => setNewTicket({...newTicket, quantity: e.target.value})} 
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sale Start (Optional)</label>
              <GlassInput 
                type="datetime-local" 
                value={newTicket.saleStart} 
                onChange={e => setNewTicket({...newTicket, saleStart: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sale End (Optional)</label>
              <GlassInput 
                type="datetime-local" 
                value={newTicket.saleEnd} 
                onChange={e => setNewTicket({...newTicket, saleEnd: e.target.value})} 
              />
            </div>
          </div>

          <GlassButton onClick={addTicket} variant="outline" className="w-full border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10">
            <Plus className="w-4 h-4 mr-2" /> Add Ticket Type
          </GlassButton>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex justify-between">
        <GlassButton onClick={onBack} variant="ghost" className="text-slate-300 hover:text-white">
          Back
        </GlassButton>
        <GlassButton onClick={handleNext} className="px-8 bg-blue-600 hover:bg-blue-500">
          Continue to Promoters
        </GlassButton>
      </div>
    </div>
  );
};

export default StepTickets;
