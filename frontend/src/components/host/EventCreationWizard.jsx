import React, { useState } from 'react';
import { X, CheckCircle2, Info, MapPin, Ticket, Users, CreditCard, ChevronRight } from 'lucide-react';
import { GlassButton } from '../common/GlassComponents';

// Importing the individual step components (we'll create these next)
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
  
  // Master state object for the entire event
  const [eventData, setEventData] = useState({
    // Step 1
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    doorsOpen: '',
    // Step 2
    venueName: '',
    venueAddress: '',
    // Step 3
    tickets: [],
    // Step 4
    promoters: [],
    staff: [],
    // Step 5
    payoutMethod: 'centralized' // or 'stripe_connect'
  });

  // Track which steps have been completed (validated)
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

  const handlePublish = () => {
    console.log("Publishing Event with Data:", eventData);
    // TODO: Connect to backend
    onClose();
  };

  const CurrentStepComponent = [
    StepBasicInfo,
    StepLocation,
    StepTickets,
    StepPromoters,
    StepPayouts
  ][currentStepIndex];

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
                    // Only allow jumping back, or jumping forward to completed steps
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

        {/* Mobile Header (replaces sidebar on small screens) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80">
          <h2 className="text-lg font-bold text-white">Step {currentStepIndex + 1}: {steps[currentStepIndex].label}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Desktop Close Button */}
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
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventCreationWizard;
