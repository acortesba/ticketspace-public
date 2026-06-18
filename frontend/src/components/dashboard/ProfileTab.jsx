import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Globe, CreditCard, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput } from '../common/GlassComponents';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const ProfileTab = () => {
  const { user, logout } = useAuth();
  
  // Profile Form State
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg({ text: '', type: '' });
    
    try {
      const res = await userService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone
      });
      if (res.success) {
        setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
        // Optionally update AuthContext user here if needed
      }
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setIsSavingPassword(true);
    setPasswordMsg({ text: '', type: '' });

    try {
      const res = await userService.updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      if (res.success) {
        setPasswordMsg({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
    } finally {
      setIsSavingPassword(false);
    }
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
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                <GlassInput value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                <GlassInput value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <GlassInput value={user?.email || ''} disabled className="opacity-70" />
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <GlassInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 890" />
                  <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            
            {profileMsg.text && (
              <div className={`text-sm ${profileMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {profileMsg.text}
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <GlassButton type="submit" isLoading={isSavingProfile}>Save Changes</GlassButton>
            </div>
          </form>
        </GlassCard>

        {/* Security */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" /> Security
          </h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Current Password</label>
              <GlassInput type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                <GlassInput type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                <GlassInput type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} />
              </div>
            </div>
            
            {passwordMsg.text && (
              <div className={`text-sm ${passwordMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {passwordMsg.text}
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <GlassButton type="submit" variant="outline" isLoading={isSavingPassword}>Update Password</GlassButton>
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
          <p className="text-sm text-slate-400 mb-4">View your past receipts and manage refunds.</p>
          <div className="space-y-3">
            <GlassButton variant="outline" className="w-full">View Billing History</GlassButton>
            <GlassButton variant="ghost" className="w-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10">Manage Refunds</GlassButton>
          </div>
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
