import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GlassInput, GlassButton } from '../components/common/GlassComponents';
import { Ticket } from 'lucide-react';

const Register = () => {
  const { t } = useTranslation('auth');
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '',
    password_confirmation: '',
    phone: '',
    account_type: 'buyer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleAccountTypeChange = (type) => {
    setFormData({ ...formData, account_type: type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    
    if (formData.password !== formData.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Passwords do not match' });
      setLoading(false);
      return;
    }
    
    const result = await register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      account_type: formData.account_type
    });
    
    if (result.success) {
      // Optional: Add toast notification here
      navigate('/login', { state: { message: result.message } });
    } else {
      setError(result.message || t('error'));
      if (result.errors) {
        setFieldErrors(result.errors);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full">
        <div className="flex justify-center text-blue-500 mb-2">
          <Ticket className="h-8 w-8" />
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-white">
          {t('sign_up')}
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          {t('have_account')}{' '}
          <NavLink to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            {t('login')}
          </NavLink>
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full">
        <GlassCard className="py-5 px-4 sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-2 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Account Type Toggle */}
            <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/10 mb-4">
              <button
                type="button"
                onClick={() => handleAccountTypeChange('buyer')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  formData.account_type === 'buyer' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                I want to buy tickets
              </button>
              <button
                type="button"
                onClick={() => handleAccountTypeChange('host')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  formData.account_type === 'host' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                I want to host events
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <GlassInput
                label={t('first_name')}
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                value={formData.first_name}
                onChange={handleChange}
                error={fieldErrors.first_name?.[0]}
              />

              <GlassInput
                label={t('last_name')}
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                value={formData.last_name}
                onChange={handleChange}
                error={fieldErrors.last_name?.[0]}
              />
            </div>

            <GlassInput
              label={t('email')}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email?.[0]}
            />
            
            <GlassInput
              label={t('phone')}
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              error={fieldErrors.phone?.[0]}
            />

            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <GlassInput
                label={t('password')}
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password?.[0]}
              />

              <GlassInput
                label="Confirm Password"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password_confirmation}
                onChange={handleChange}
                error={fieldErrors.password_confirmation}
              />
            </div>

            <GlassButton
              type="submit"
              className="w-full mt-2"
              isLoading={loading}
            >
              {t('sign_up')}
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Register;
