import React, { useState, useEffect } from 'react';
import { GlassInput, GlassButton, GlassCard } from '../../common/GlassComponents';
import { Plus, Trash2, UserPlus, Tag, Percent, Euro, Users, Mail, CheckCircle2 } from 'lucide-react';
import { eventService } from '../../../services/api';

const StepPromoters = ({ data, updateData, onNext, onBack }) => {
  const [activeTab, setActiveTab] = useState('existing'); // existing, past, new
  const [pastPromoters, setPastPromoters] = useState([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  
  const [commissionType, setCommissionType] = useState('percentage');
  const [commissionValue, setCommissionValue] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // Tab 1 state
  const [uidInput, setUidInput] = useState('');

  // Tab 3 state
  const [emailInput, setEmailInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');

  useEffect(() => {
    if (activeTab === 'past' && pastPromoters.length === 0) {
      fetchPastPromoters();
    }
  }, [activeTab]);

  const fetchPastPromoters = async () => {
    setIsLoadingPast(true);
    try {
      const result = await eventService.getMyPromoters();
      setPastPromoters(result || []);
    } catch (error) {
      console.error("Failed to fetch past promoters", error);
    } finally {
      setIsLoadingPast(false);
    }
  };

  const addPromoterToState = (promoterData) => {
    if (!commissionValue) {
      alert("Please enter a Commission value.");
      return;
    }
    
    updateData({
      promoters: [...data.promoters, { 
        ...promoterData, 
        promoCode,
        commissionType,
        commissionValue,
        id: Date.now() 
      }]
    });
    
    // Reset common form
    setCommissionValue('');
    setPromoCode('');
    setUidInput('');
    setEmailInput('');
    setFirstNameInput('');
    setLastNameInput('');
  };

  const handleAddExisting = () => {
    if (!uidInput) return alert("Please enter a UID");
    addPromoterToState({ uid: uidInput });
  };

  const handleAddPast = (pastPromoter) => {
    addPromoterToState({ uid: pastPromoter.uid });
  };

  const handleAddNew = () => {
    if (!emailInput) return alert("Email is required to invite a new promoter");
    addPromoterToState({ email: emailInput, firstName: firstNameInput, lastName: lastNameInput });
  };

  const removePromoter = (id) => {
    updateData({
      promoters: data.promoters.filter(p => p.id !== id)
    });
  };

  const isAlreadyAdded = (uid) => {
    return data.promoters.some(p => p.uid === uid);
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
              <GlassCard key={promoter.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between border-green-500/30">
                <div className="mb-3 md:mb-0">
                  <div className="flex items-center text-white font-medium mb-1">
                    <UserPlus className="w-4 h-4 mr-2 text-green-400" />
                    {promoter.uid ? `UID: ${promoter.uid}` : `Invite: ${promoter.email}`}
                  </div>
                  <div className="flex items-center gap-3 text-sm mt-2">
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

        {/* Add Promoter Area */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button 
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'existing' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              onClick={() => setActiveTab('existing')}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add Existing
            </button>
            <button 
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'past' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              onClick={() => setActiveTab('past')}
            >
              <Users className="w-4 h-4 mr-2" /> Past Used
            </button>
            <button 
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'new' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              onClick={() => setActiveTab('new')}
            >
              <Mail className="w-4 h-4 mr-2" /> Invite New
            </button>
          </div>

          <div className="p-5">
            {/* Common Commission Settings */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-6">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">1. Set Commission & Tracking</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Commission Type *</label>
                  <div className="flex bg-slate-800 p-1 rounded-xl border border-white/10">
                    <button 
                      className={`flex-1 py-2 text-xs rounded-lg transition-colors ${commissionType === 'percentage' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      onClick={() => setCommissionType('percentage')}
                    >
                      %
                    </button>
                    <button 
                      className={`flex-1 py-2 text-xs rounded-lg transition-colors ${commissionType === 'fixed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      onClick={() => setCommissionType('fixed')}
                    >
                      € Fixed
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Value *</label>
                  <GlassInput 
                    type="number" 
                    min="0"
                    step={commissionType === 'percentage' ? "1" : "0.01"}
                    value={commissionValue} 
                    onChange={e => setCommissionValue(e.target.value)} 
                    placeholder={commissionType === 'percentage' ? "10" : "5.00"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Promo Code (Optional)</label>
                  <GlassInput 
                    value={promoCode} 
                    onChange={e => setPromoCode(e.target.value.toUpperCase())} 
                    placeholder="SUMMER26"
                  />
                </div>
              </div>
            </div>

            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">2. Select User</h5>

            {/* Tab Content 1: Existing */}
            {activeTab === 'existing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Promoter UID *</label>
                  <GlassInput 
                    value={uidInput} 
                    onChange={e => setUidInput(e.target.value)} 
                    placeholder="e.g. 8f9b2..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Ask the promoter for their UID from their dashboard.</p>
                </div>
                <GlassButton onClick={handleAddExisting} variant="outline" className="w-full border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10">
                  <Plus className="w-4 h-4 mr-2" /> Add Existing Promoter
                </GlassButton>
              </div>
            )}

            {/* Tab Content 2: Past Promoters */}
            {activeTab === 'past' && (
              <div className="space-y-4">
                {isLoadingPast ? (
                  <div className="text-center py-4 text-slate-400 text-sm">Loading past promoters...</div>
                ) : pastPromoters.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-sm">You haven't used any promoters yet.</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {pastPromoters.map(p => (
                      <div key={p.uid} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5">
                        <div>
                          <div className="text-sm font-medium text-white">{p.first_name} {p.last_name}</div>
                          <div className="text-xs text-slate-500">{p.email}</div>
                        </div>
                        {isAlreadyAdded(p.uid) ? (
                          <span className="text-xs text-green-400 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Added</span>
                        ) : (
                          <GlassButton onClick={() => handleAddPast(p)} variant="ghost" className="px-3 py-1 text-xs hover:bg-blue-500/20 hover:text-blue-400">
                            Select
                          </GlassButton>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content 3: Invite New */}
            {activeTab === 'new' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Address *</label>
                  <GlassInput 
                    type="email"
                    value={emailInput} 
                    onChange={e => setEmailInput(e.target.value)} 
                    placeholder="promoter@example.com"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">We will send them an invite link to set their password.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">First Name (Optional)</label>
                    <GlassInput 
                      value={firstNameInput} 
                      onChange={e => setFirstNameInput(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Last Name (Optional)</label>
                    <GlassInput 
                      value={lastNameInput} 
                      onChange={e => setLastNameInput(e.target.value)} 
                    />
                  </div>
                </div>
                <GlassButton onClick={handleAddNew} variant="outline" className="w-full border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10">
                  <Mail className="w-4 h-4 mr-2" /> Send Invite & Add
                </GlassButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex justify-between">
        <GlassButton onClick={onBack} variant="ghost" className="text-slate-300 hover:text-white">
          Back
        </GlassButton>
        <GlassButton onClick={() => onNext(true)} className="px-8 bg-blue-600 hover:bg-blue-500">
          Continue to Payouts
        </GlassButton>
      </div>
    </div>
  );
};

export default StepPromoters;
