import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { SocialLoginButton } from './SocialLoginButton';
import { FormErrors } from '../../types/auth';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Initialize remembered email if previously stored
  useEffect(() => {
    const remembered = authService.getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Validation helper
  const validateField = (field: 'email' | 'password', value: string): string | undefined => {
    if (field === 'email') {
      if (!value.trim()) return 'Email address is required.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Please enter a valid email address.';
      }
    }
    if (field === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 6) return 'Password must be at least 6 characters.';
    }
    return undefined;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, field === 'email' ? email : password);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email || errors.general) {
      const errorMsg = validateField('email', val);
      setErrors((prev) => ({ ...prev, email: errorMsg, general: undefined }));
    }
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password || errors.general) {
      const errorMsg = validateField('password', val);
      setErrors((prev) => ({ ...prev, password: errorMsg, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all touched
    setTouched({ email: true, password: true });

    const emailErr = validateField('email', email);
    const passwordErr = validateField('password', password);

    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await authService.login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (response.success && response.session) {
        navigate('/dashboard');
      } else {
        setErrors({
          general: response.error || 'Unable to sign in. Please check your email and password.',
        });
      }
    } catch {
      setErrors({
        general: 'A connection error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    setErrors({});

    try {
      const response = await authService.loginWithGoogle();
      if (response.success && response.session) {
        navigate('/dashboard');
      } else {
        setErrors({
          general: response.error || 'Google sign-in failed. Please try again.',
        });
      }
    } catch {
      setErrors({
        general: 'An error occurred during Google sign-in.',
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto text-left">
      {/* Top Welcome Title Block */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4DD] text-[#E55837] text-xs font-bold uppercase tracking-wider mb-3">
          <span>Welcome back 👋</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#17201D] tracking-tight leading-tight mb-2.5">
          Continue your journey.
        </h2>
        <p className="text-sm sm:text-base text-[#68736F] leading-relaxed">
          Sign in to access your trips, itineraries, and personalized travel recommendations.
        </p>
      </div>

      {/* General Authentication Error Banner */}
      {errors.general && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm animate-shake"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errors.general}</div>
        </div>
      )}

      {/* Social Google Sign-in */}
      <div className="mb-6">
        <SocialLoginButton
          onClick={handleGoogleLogin}
          isLoading={isGoogleSubmitting}
          disabled={isSubmitting}
        />
      </div>

      {/* Visual Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="grow border-t border-[#EAE6DD]" />
        <span className="shrink-0 mx-4 text-xs font-bold uppercase tracking-widest text-[#68736F]/70">
          OR
        </span>
        <div className="grow border-t border-[#EAE6DD]" />
      </div>

      {/* Email & Password Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-bold text-[#17201D] tracking-wider uppercase flex items-center justify-between"
          >
            <span>Email Address</span>
          </label>

          <div className="relative flex items-center">
            <span className="absolute left-4 text-[#68736F] pointer-events-none flex items-center">
              <Mail className="w-5 h-5" />
            </span>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={handleChangeEmail}
              onBlur={() => handleBlur('email')}
              disabled={isSubmitting || isGoogleSubmitting}
              placeholder="you@example.com"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full bg-white border text-[#17201D] placeholder:text-[#9BA3A0] rounded-2xl pl-11 pr-4 py-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/25 focus:border-[#FF6B4A] disabled:opacity-50 disabled:bg-[#FFF8ED] ${
                errors.email
                  ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200'
                  : 'border-[#EAE6DD] hover:border-[#17201D]/20'
              }`}
            />
          </div>

          {errors.email && (
            <p id="email-error" className="text-xs font-medium text-red-500 mt-0.5 flex items-center gap-1">
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-xs font-bold text-[#17201D] tracking-wider uppercase"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs font-semibold text-[#FF6B4A] hover:text-[#E55837] hover:underline cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B4A] rounded-sm"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-4 text-[#68736F] pointer-events-none flex items-center">
              <Lock className="w-5 h-5" />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={handleChangePassword}
              onBlur={() => handleBlur('password')}
              disabled={isSubmitting || isGoogleSubmitting}
              placeholder="Enter your password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`w-full bg-white border text-[#17201D] placeholder:text-[#9BA3A0] rounded-2xl pl-11 pr-11 py-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/25 focus:border-[#FF6B4A] disabled:opacity-50 disabled:bg-[#FFF8ED] ${
                errors.password
                  ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200'
                  : 'border-[#EAE6DD] hover:border-[#17201D]/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 p-1 rounded-lg text-[#68736F] hover:text-[#17201D] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A]/40"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {errors.password && (
            <p id="password-error" className="text-xs font-medium text-red-500 mt-0.5 flex items-center gap-1">
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-4 h-4 rounded border-[#EAE6DD] text-[#FF6B4A] accent-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/30 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-[#68736F] group-hover:text-[#17201D] transition-colors">
              Remember me
            </span>
          </label>
        </div>

        {/* Primary CTA Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full group relative flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white font-bold text-base shadow-[0_8px_24px_rgba(255,107,74,0.3)] hover:shadow-[0_12px_32px_rgba(255,107,74,0.42)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A]/50 focus-visible:ring-offset-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2.5">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Signing you in...</span>
            </span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* Trust and Privacy Microcopy */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#68736F]/80">
        <ShieldCheck className="w-4 h-4 text-[#20B8A6]" />
        <span>Your travel plans are private and secure.</span>
      </div>

      {/* Signup CTA Navigation Link */}
      <div className="mt-8 pt-6 border-t border-[#EAE6DD] text-center">
        <p className="text-sm text-[#68736F]">
          New to GlobeTrotter?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="font-bold text-[#FF6B4A] hover:text-[#E55837] hover:underline cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B4A] rounded-sm"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};
