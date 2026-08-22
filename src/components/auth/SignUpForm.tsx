import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { SocialLoginButton } from './SocialLoginButton';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { FormErrors, SignUpData } from '../../types/auth';

export const SignUpForm: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdUserName, setCreatedUserName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Real-time calculations
  const passwordStrength = authService.calculatePasswordStrength(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name Validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your name.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password Validation
    if (!password) {
      newErrors.password = 'Please create a password.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters.';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password needs at least one uppercase letter.';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password needs at least one number.';
    }

    // Confirm Password Validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    // Terms & Conditions Validation
    if (!agreedToTerms) {
      newErrors.terms = 'Please accept the Terms of Service to continue.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const signUpData: SignUpData = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        agreedToTerms,
      };

      const response = await authService.signUpWithEmail(signUpData);

      if (response.success && response.session) {
        setCreatedUserName(response.session.user.name);
        setIsSuccess(true);

        // Smooth transition to onboarding
        setTimeout(() => {
          navigate('/onboarding');
        }, 1300);
      } else {
        if (response.isExistingUser) {
          setErrors({
            email: response.error || 'An account with this email already exists.',
          });
        } else {
          setErrors({
            general: response.error || 'Unable to create account. Please check your information.',
          });
        }
      }
    } catch {
      setErrors({
        general: 'A network error occurred while connecting. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-Up Handler
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const response = await authService.signUpWithGoogle();
      if (response.success && response.session) {
        setCreatedUserName(response.session.user.name);
        setIsSuccess(true);

        setTimeout(() => {
          navigate('/onboarding');
        }, 1300);
      } else {
        setErrors({
          general: response.error || 'Google registration was canceled.',
        });
      }
    } catch {
      setErrors({
        general: 'Google sign up is currently unavailable. Please use email registration.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // If successfully created account, display smooth success feedback card
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full py-12 px-6 sm:px-10 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-[#EAE6DD] shadow-[0_16px_40px_rgba(23,32,29,0.06)]"
      >
        <div className="w-16 h-16 rounded-3xl bg-[#DDF7F2] text-[#20B8A6] flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Account Created</span>
        </div>

        <h3 className="text-2xl font-black text-[#17201D] mb-2 tracking-tight">
          You're all set{createdUserName ? `, ${createdUserName}` : ''}!
        </h3>

        <p className="text-sm text-[#68736F] leading-relaxed max-w-sm mb-6">
          Let's personalize your GlobeTrotter experience.
        </p>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#179E8E]">
          <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#179E8E] border-t-transparent animate-spin" />
          <span>Setting up your travel profile...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Info */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3 border border-[#FFE8D6]">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Welcome to GlobeTrotter ✨</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#17201D] tracking-tight mb-2">
          Let's plan something unforgettable.
        </h1>
        <p className="text-sm text-[#68736F] leading-relaxed">
          Create your account and start building smarter, more personalized journeys.
        </p>
      </div>

      {/* General Alert / Error Banner */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FFF2F0] border border-[#FFD8D3] text-[#D9381E] text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errors.general}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Quick Sign-Up */}
      <div className="mb-6">
        <SocialLoginButton
          onClick={handleGoogleSignUp}
          isLoading={isGoogleLoading}
          disabled={isLoading}
          label="Continue with Google"
          loadingText="Creating your account..."
        />

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#EAE6DD]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#FFFDF8] px-3 font-semibold text-[#8C9894] uppercase tracking-wider">
              OR
            </span>
          </div>
        </div>
      </div>

      {/* Email Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label
            htmlFor="signup-fullname"
            className="block text-xs font-bold uppercase tracking-wider text-[#17201D] mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C9894]">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="signup-fullname"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              disabled={isLoading || isGoogleLoading}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-white border ${
                errors.fullName
                  ? 'border-[#FF6B4A] focus:ring-[#FF6B4A]/20'
                  : 'border-[#EAE6DD] hover:border-[#D1CCC0] focus:border-[#17201D] focus:ring-[#17201D]/10'
              } text-sm text-[#17201D] placeholder:text-[#9EA8A4] shadow-[0_1px_3px_rgba(23,32,29,0.03)] focus:outline-none focus:ring-4 transition-all duration-200`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1.5 text-xs text-[#FF6B4A] font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        {/* Email Address Field */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-bold uppercase tracking-wider text-[#17201D] mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C9894]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="signup-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              disabled={isLoading || isGoogleLoading}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-white border ${
                errors.email
                  ? 'border-[#FF6B4A] focus:ring-[#FF6B4A]/20'
                  : 'border-[#EAE6DD] hover:border-[#D1CCC0] focus:border-[#17201D] focus:ring-[#17201D]/10'
              } text-sm text-[#17201D] placeholder:text-[#9EA8A4] shadow-[0_1px_3px_rgba(23,32,29,0.03)] focus:outline-none focus:ring-4 transition-all duration-200`}
            />
          </div>
          {errors.email && (
            <div className="mt-1.5 text-xs text-[#FF6B4A] font-medium flex items-center justify-between gap-1">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </span>
              {errors.email.includes('already exists') && (
                <Link
                  to="/login"
                  className="text-[#17201D] font-bold underline hover:text-[#FF6B4A] ml-2 shrink-0"
                >
                  Sign in instead
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-bold uppercase tracking-wider text-[#17201D] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C9894]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              name="new-password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={isLoading || isGoogleLoading}
              className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-white border ${
                errors.password
                  ? 'border-[#FF6B4A] focus:ring-[#FF6B4A]/20'
                  : 'border-[#EAE6DD] hover:border-[#D1CCC0] focus:border-[#17201D] focus:ring-[#17201D]/10'
              } text-sm text-[#17201D] placeholder:text-[#9EA8A4] shadow-[0_1px_3px_rgba(23,32,29,0.03)] focus:outline-none focus:ring-4 transition-all duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C9894] hover:text-[#17201D] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <PasswordStrengthMeter strength={passwordStrength} showRequirements={true} />
          )}

          {errors.password && (
            <p className="mt-1.5 text-xs text-[#FF6B4A] font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="signup-confirm-password"
              className="block text-xs font-bold uppercase tracking-wider text-[#17201D]"
            >
              Confirm Password
            </label>
            {passwordsMatch && (
              <span className="text-[11px] font-bold text-[#20B8A6] flex items-center gap-1">
                <Check className="w-3 h-3" /> Passwords match
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C9894]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm-password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              disabled={isLoading || isGoogleLoading}
              className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-white border ${
                errors.confirmPassword || passwordsMismatch
                  ? 'border-[#FF6B4A] focus:ring-[#FF6B4A]/20'
                  : passwordsMatch
                  ? 'border-[#20B8A6] focus:ring-[#20B8A6]/20'
                  : 'border-[#EAE6DD] hover:border-[#D1CCC0] focus:border-[#17201D] focus:ring-[#17201D]/10'
              } text-sm text-[#17201D] placeholder:text-[#9EA8A4] shadow-[0_1px_3px_rgba(23,32,29,0.03)] focus:outline-none focus:ring-4 transition-all duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C9894] hover:text-[#17201D] transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {(errors.confirmPassword || (passwordsMismatch && confirmPassword.length >= 2)) && (
            <p className="mt-1.5 text-xs text-[#FF6B4A] font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.confirmPassword || "Passwords don't match."}</span>
            </p>
          )}
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer group select-none">
            <div className="relative flex items-center mt-0.5">
              <input
                id="signup-terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                }}
                disabled={isLoading || isGoogleLoading}
                className="sr-only peer"
              />
              <div className="w-4 h-4 rounded-md border border-[#D1CCC0] bg-white peer-checked:bg-[#FF6B4A] peer-checked:border-[#FF6B4A] peer-focus:ring-2 peer-focus:ring-[#FF6B4A]/30 transition-all flex items-center justify-center">
                <Check
                  className={`w-3 h-3 text-white transition-opacity ${
                    agreedToTerms ? 'opacity-100' : 'opacity-0'
                  }`}
                  strokeWidth={3}
                />
              </div>
            </div>
            <span className="text-xs text-[#68736F] leading-relaxed">
              I agree to the{' '}
              <a
                href="#terms"
                onClick={(e) => e.preventDefault()}
                className="font-semibold text-[#17201D] underline hover:text-[#FF6B4A] transition-colors"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#privacy"
                onClick={(e) => e.preventDefault()}
                className="font-semibold text-[#17201D] underline hover:text-[#FF6B4A] transition-colors"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1.5 text-xs text-[#FF6B4A] font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.terms}</span>
            </p>
          )}
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading || !agreedToTerms}
            className={`w-full group relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-[0_4px_16px_rgba(255,107,74,0.25)] transition-all duration-200 select-none ${
              isLoading || isGoogleLoading || !agreedToTerms
                ? 'bg-[#FF6B4A]/60 cursor-not-allowed shadow-none'
                : 'bg-[#FF6B4A] hover:bg-[#E55837] hover:shadow-[0_8px_24px_rgba(255,107,74,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF6B4A]/30'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating your account...</span>
              </span>
            ) : (
              <>
                <span>Create My Account</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security note & Login redirection */}
      <div className="mt-6 pt-5 border-t border-[#EAE6DD]/80 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#8C9894]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#20B8A6]" />
          <span>Your travel data is private and encrypted</span>
        </div>

        <p className="text-xs text-[#68736F]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-[#FF6B4A] hover:text-[#E55837] underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
