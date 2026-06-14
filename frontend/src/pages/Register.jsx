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
    phone: ''
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
      phone: formData.phone
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
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-500 mb-6">
          <Ticket className="h-12 w-12" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">
          {t('sign_up')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {t('have_account')}{' '}
          <NavLink to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            {t('login')}
          </NavLink>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <GlassCard className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
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

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
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
              className="w-full"
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
