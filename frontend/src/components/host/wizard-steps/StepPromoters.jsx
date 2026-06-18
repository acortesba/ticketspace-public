import React, { useState } from 'react';
import { GlassInput, GlassButton, GlassCard } from '../../common/GlassComponents';
import { Plus, Trash2, UserPlus, Tag, Percent, Euro } from 'lucide-react';

const StepPromoters = ({ data, updateData, onNext, onBack }) => {
  const [newPromoter, setNewPromoter] = useState({
    uid: '',
    promoCode: '',
    commissionType: 'percentage', // or 'fixed'
    commissionValue: ''
  });

  const addPromoter = () => {
    if (!newPromoter.uid || !newPromoter.commissionValue) {
      alert("Please enter a UID and Commission value.");
      return;
    }
    
    updateData({
      promoters: [...data.promoters, { ...newPromoter, id: Date.now() }]
    });
    
    setNewPromoter({
      uid: '',
      promoCode: '',
      commissionType: 'percentage',
      commissionValue: ''
    });
  };

  const removePromoter = (id) => {
    updateData({
      promoters: data.promoters.filter(p => p.id !== id)
    });
  };

  const handleNext = () => {
    // Promoters are optional, so we can just proceed
    onNext(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white mb-2">Staff & Promoters</h3>
        <p className="text-slate-400">Add event staff or generate promo codes for your promoters to track sales. (Optional)</p>
      </div>

      <div className="space-y-6">
        {/* Promoters List */}
        {data.promoters && data.promoters.length > 0 && (
          <div className="space-y-3 mb-8">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Added Promoters</h4>
            {data.promoters.map(promoter => (
              <GlassCard key={promoter.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0">
                  <div className="flex items-center text-white font-medium mb-1">
                    <UserPlus className="w-4 h-4 mr-2 text-blue-400" />
                    UID: {promoter.uid}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {promoter.promoCode ? (
                      <span className="flex items-center text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                        <Tag className="w-3 h-3 mr-1" /> {promoter.promoCode}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">(Tracking Only - No Code)</span>
                    )}
                    <span className="flex items-center text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                      {promoter.commissionType === 'percentage' ? <Percent className="w-3 h-3 mr-1" /> : <Euro className="w-3 h-3 mr-1" />}
                      {promoter.commissionValue}{promoter.commissionType === 'percentage' ? '%' : ' per ticket'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => removePromoter(promoter.id)}
                  className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors self-start md:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Add Promoter Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-4">Add a Promoter</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Promoter UID *</label>
              <GlassInput 
                value={newPromoter.uid} 
                onChange={e => setNewPromoter({...newPromoter, uid: e.target.value})} 
                placeholder="e.g. 8f9b2..."
              />
              <p className="text-[10px] text-slate-500 mt-1">Ask the promoter for their UID from their dashboard.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Promo/Discount Code (Optional)</label>
              <GlassInput 
                value={newPromoter.promoCode} 
                onChange={e => setNewPromoter({...newPromoter, promoCode: e.target.value.toUpperCase()})} 
                placeholder="e.g. SUMMER20"
              />
              <p className="text-[10px] text-slate-500 mt-1">If blank, this is just a hidden tracking link.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Commission Type *</label>
              <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10">
                <button 
                  className={`flex-1 py-2 text-sm rounded-lg transition-colors ${newPromoter.commissionType === 'percentage' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setNewPromoter({...newPromoter, commissionType: 'percentage'})}
                >
                  Percentage (%)
                </button>
                <button 
                  className={`flex-1 py-2 text-sm rounded-lg transition-colors ${newPromoter.commissionType === 'fixed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setNewPromoter({...newPromoter, commissionType: 'fixed'})}
                >
                  Fixed (€)
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Commission Value *</label>
              <div className="relative">
                <GlassInput 
                  type="number" 
                  min="0"
                  step={newPromoter.commissionType === 'percentage' ? "1" : "0.01"}
                  value={newPromoter.commissionValue} 
                  onChange={e => setNewPromoter({...newPromoter, commissionValue: e.target.value})} 
                  placeholder={newPromoter.commissionType === 'percentage' ? "10" : "5.00"}
                  className="pl-8"
                />
                <span className="absolute left-3 top-3 text-slate-400 font-bold">
                  {newPromoter.commissionType === 'percentage' ? '%' : '€'}
                </span>
              </div>
            </div>
          </div>

          <GlassButton onClick={addPromoter} variant="outline" className="w-full border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10">
            <Plus className="w-4 h-4 mr-2" /> Add Promoter
          </GlassButton>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex justify-between">
        <GlassButton onClick={onBack} variant="ghost" className="text-slate-300 hover:text-white">
          Back
        </GlassButton>
        <GlassButton onClick={handleNext} className="px-8 bg-blue-600 hover:bg-blue-500">
          Continue to Payouts
        </GlassButton>
      </div>
    </div>
  );
};

export default StepPromoters;
