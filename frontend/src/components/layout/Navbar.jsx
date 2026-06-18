import React from 'react';
import { NavLink } from 'react-router-dom';
import { Ticket, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { GlassButton } from '../common/GlassComponents';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.roles?.includes('admin') || user.roles?.includes('super_admin')) return '/admin';
    if (user.roles?.includes('host')) return '/host';
    return '/dashboard';
  };

  return (
    <nav className="relative z-50 w-full border-b border-white/10 bg-[#0a0e17]/80 backdrop-blur-md shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <NavLink to={isAuthenticated ? getDashboardLink() : "/"} className="flex items-center gap-2">
              <Ticket className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold tracking-tight text-white">TicketSpace</span>
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/events" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-white ${isActive ? 'text-white' : 'text-slate-300'}`}>
              {t('events')}
            </NavLink>
            
            {isAuthenticated ? (
              <>
                <NavLink to={getDashboardLink()} className={({ isActive }) => `text-sm font-medium transition-colors hover:text-white ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {t('dashboard')}
                </NavLink>
                <div className="h-5 w-px bg-white/20 mx-2"></div>
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-inner shadow-white/20">
                      {user?.first_name?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0a0e17] border border-white/10 shadow-2xl py-1 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                          <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <NavLink to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                            Profile & Account
                          </NavLink>
                          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 text-left border-t border-white/10 mt-1 pt-2">
                            Log Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <NavLink to="/login">
                  <GlassButton variant="ghost" size="sm">Log in</GlassButton>
                </NavLink>
                <NavLink to="/register">
                  <GlassButton size="sm">Sign up</GlassButton>
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/events" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5">
              {t('events')}
            </NavLink>
            
            {isAuthenticated ? (
              <>
                <NavLink to={getDashboardLink()} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5">
                  {t('dashboard')}
                </NavLink>
                <button onClick={logout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-white/5">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5">
                  Log in
                </NavLink>
                <NavLink to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:text-blue-300 hover:bg-white/5">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
