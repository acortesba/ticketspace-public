import React, { useState } from 'react';
import { X, CheckCircle2, Info, MapPin, Ticket, Users, CreditCard, ChevronRight, Copy, ExternalLink, Share2 } from 'lucide-react';
import { GlassButton, GlassCard } from '../common/GlassComponents';
import { eventService } from '../../services/api';
import toast from 'react-hot-toast';

// Importing the individual step components
import StepBasicInfo from './wizard-steps/StepBasicInfo';
import StepLocation from './wizard-steps/StepLocation';
import StepTickets from './wizard-steps/StepTickets';
import StepPromoters from './wizard-steps/StepPromoters';
import StepPayouts from './wizard-steps/StepPayouts';

const steps = [
  { id: 'basic', label: 'Basic Info', icon: Info },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'tickets', label: 'Tickets & Drops', icon: Ticket },
  { id: 'promoters', label: 'Staff & Promoters', icon: Users },
  { id: 'payouts', label: 'Payouts', icon: CreditCard }
];

const EventCreationWizard = ({ onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Master state object for the entire event
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    doorsOpen: '',
    venueName: '',
    venueAddress: '',
    latitude: 40.4168,
    longitude: -3.7038,
    tickets: [],
    promoters: [],
    staff: [],
    payoutMethod: 'centralized'
  });

  const [completedSteps, setCompletedSteps] = useState({
    basic: false,
    location: false,
    tickets: false,
    promoters: false,
    payouts: false
  });

  const handleNext = (stepId, isComplete) => {
    if (isComplete) {
      setCompletedSteps(prev => ({ ...prev, [stepId]: true }));
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const result = await eventService.createEvent(eventData);
      toast.success('Event published successfully!');
      setSuccessData(result.data);
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error(error.response?.data?.message || 'Failed to publish event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const CurrentStepComponent = [
    StepBasicInfo,
    StepLocation,
    StepTickets,
    StepPromoters,
    StepPayouts
  ][currentStepIndex];

  if (successData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-[#0f1523] border border-blue-500/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
          <button onClick={() => { onClose(); window.location.reload(); }} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 z-10">
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Event Published!</h2>
            <p className="text-slate-400 mb-8 max-w-md">Your event is now live and tickets are ready to be sold.</p>
            
            {successData.promoters && successData.promoters.length > 0 && (
              <div className="w-full text-left mb-8">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Promoter Quick Share Links</h3>
                <div className="space-y-3">
                  {successData.promoters.map((promoter, idx) => (
                    <GlassCard key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-medium mb-1">UID: {promoter.uid}</div>
                        {promoter.promoCode && <div className="text-xs text-blue-400">Code: {promoter.promoCode}</div>}
                      </div>
                      <div className="flex gap-2">
                        <GlassButton size="sm" variant="outline" onClick={() => window.open(`mailto:?subject=Your Promoter Link for ${eventData.title}&body=Here is your tracking link: ${promoter.shareUrl}`)} className="px-3">
                          <Share2 className="w-4 h-4" />
                        </GlassButton>
                        <GlassButton size="sm" onClick={() => copyToClipboard(promoter.shareUrl)} className="px-3">
                          <Copy className="w-4 h-4 mr-2" /> Copy Link
                        </GlassButton>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
            
            <GlassButton size="lg" className="w-full sm:w-auto px-10" onClick={() => { onClose(); window.location.reload(); }}>
              Back to Dashboard
            </GlassButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[90vh] bg-[#0f1523] border border-white/10 rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-full md:w-64 bg-slate-900/50 border-r border-white/5 p-6 flex flex-col hidden md:flex">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white tracking-wide">Create Event</h2>
          </div>
          
          <nav className="flex-1 space-y-2">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = completedSteps[step.id];
              const Icon = step.icon;
              
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (index < currentStepIndex || isCompleted || completedSteps[steps[currentStepIndex].id]) {
                      setCurrentStepIndex(index);
                    }
                  }}
                  className={`w-full flex items-center p-3 rounded-xl transition-all text-left ${
                    isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 
                    isCompleted ? 'hover:bg-white/5 text-slate-300' : 
                    'opacity-50 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${isActive ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium block">{step.label}</span>
                    <span className="text-xs opacity-60">Step {index + 1} of 5</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80">
          <h2 className="text-lg font-bold text-white">Step {currentStepIndex + 1}: {steps[currentStepIndex].label}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10 hidden md:block">
            <X className="w-5 h-5" />
          </button>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              <CurrentStepComponent 
                data={eventData} 
                updateData={(newData) => setEventData({ ...eventData, ...newData })} 
                onNext={(isComplete) => handleNext(steps[currentStepIndex].id, isComplete)}
                onBack={handleBack}
                onPublish={handlePublish}
                isFirstStep={currentStepIndex === 0}
                isLastStep={currentStepIndex === steps.length - 1}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventCreationWizard;
