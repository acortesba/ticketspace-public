import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Globe, CreditCard, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput } from '../common/GlassComponents';
import { useAuth } from '../../context/AuthContext';

const ProfileTab = () => {
  const { user, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Settings */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Personal Info */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-400" /> Personal Information
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                <GlassInput defaultValue={user?.first_name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                <GlassInput defaultValue={user?.last_name} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <GlassInput defaultValue={user?.email} disabled className="opacity-70" />
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <GlassInput defaultValue={user?.phone || ''} placeholder="+1 234 567 890" />
                  <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <GlassButton type="submit" isLoading={isSaving}>Save Changes</GlassButton>
            </div>
          </form>
        </GlassCard>

        {/* Security */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" /> Security
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Current Password</label>
              <GlassInput type="password" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                <GlassInput type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                <GlassInput type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <GlassButton variant="outline">Update Password</GlassButton>
            </div>
          </form>
        </GlassCard>

      </div>

      {/* Right Column - Side Panels */}
      <div className="space-y-6">
        
        {/* Account Status */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Account Status</h3>
          <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-400">Email Verified</p>
              <p className="text-xs text-slate-400 mt-1">Your account is fully verified and ready to purchase tickets.</p>
            </div>
          </div>
        </GlassCard>

        {/* Preferences */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center">
            <Globe className="w-4 h-4 mr-2" /> Preferences
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <div className="flex gap-2">
              <GlassButton variant="outline" size="sm" className="flex-1 bg-blue-500/10 border-blue-500/30">English</GlassButton>
              <GlassButton variant="ghost" size="sm" className="flex-1">Español</GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* Billing Quick Link */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" /> Billing
          </h3>
          <p className="text-sm text-slate-400 mb-4">View your past receipts and payment methods.</p>
          <GlassButton variant="outline" className="w-full">View Billing History</GlassButton>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="p-6 border-red-500/20">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> Danger Zone
          </h3>
          <GlassButton 
            variant="ghost" 
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </GlassButton>
        </GlassCard>

      </div>
    </div>
  );
};

export default ProfileTab;
