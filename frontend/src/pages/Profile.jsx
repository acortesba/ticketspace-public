import React from 'react';
import ProfileTab from '../components/dashboard/ProfileTab';

const Profile = () => {
  return (
    <div className="w-full h-full flex flex-col pt-8 pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile & Account</h1>
        <p className="text-slate-400">Manage your settings, language, and billing history.</p>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 min-h-0">
        <ProfileTab />
      </div>
      
      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 text-center text-sm text-slate-500">
        <p>TicketSpace App Version 0.1.4</p>
        <p className="mt-1">
          Need help? <a href="mailto:support@ticketspace.es" className="text-blue-400 hover:text-blue-300 transition-colors">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default Profile;
