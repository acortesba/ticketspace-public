import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, History, User as UserIcon } from 'lucide-react';
import MyTicketsTab from '../components/dashboard/MyTicketsTab';
import PastEventsTab from '../components/dashboard/PastEventsTab';
import ProfileTab from '../components/dashboard/ProfileTab';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');

  const tabs = [
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'history', label: 'Past Events', icon: History },
    { id: 'profile', label: 'Profile & Account', icon: UserIcon },
  ];

  return (
    <div className="w-full h-full flex flex-col pt-8 pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.first_name}</h1>
        <p className="text-slate-400">Manage your tickets, profile, and account settings.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex space-x-1 glass-panel p-1 rounded-xl w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 min-h-0">
        {activeTab === 'tickets' && <MyTicketsTab />}
        {activeTab === 'history' && <PastEventsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
      
      {/* Dashboard Footer */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 text-center text-sm text-slate-500">
        <p>TicketSpace App Version 0.1.4</p>
        <p className="mt-1">
          Need help? <a href="mailto:support@ticketspace.es" className="text-blue-400 hover:text-blue-300 transition-colors">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
