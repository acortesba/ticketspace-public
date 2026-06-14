import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GlassInput, GlassButton } from '../components/common/GlassComponents';
import { Ticket } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard'); // Will be redirected by ProtectedRoute if not buyer
    } else {
      setError(result.message || t('error'));
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-500 mb-6">
          <Ticket className="h-12 w-12" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">
          {t('sign_in')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {t('no_account')}{' '}
          <NavLink to="/register" className="font-medium text-blue-400 hover:text-blue-300">
            {t('register')}
          </NavLink>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <GlassCard className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}
            
            <GlassInput
              label={t('email')}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <GlassInput
              label={t('password')}
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <NavLink to="/forgot-password" className="font-medium text-blue-400 hover:text-blue-300">
                  {t('forgot_password')}
                </NavLink>
              </div>
            </div>

            <GlassButton
              type="submit"
              className="w-full"
              isLoading={loading}
            >
              {t('sign_in')}
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
