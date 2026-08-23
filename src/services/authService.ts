/**
 * Authentication Service
 * 
 * Wired directly to GlobeTrotter PostgreSQL backend REST API.
 * Manages user authentication, token storage, and session validation.
 */

import { User } from '../types';
import { LoginCredentials, SignUpData, AuthResponse, AuthSession, PasswordStrength } from '../types/auth';
import { apiRequest } from './apiClient';

const STORAGE_KEYS = {
  SESSION: 'globetrotter_session',
  REMEMBERED_EMAIL: 'globetrotter_remembered_email',
} as const;

export const authService = {
  /**
   * Helper to calculate real-time password strength & requirements
   */
  calculatePasswordStrength(password: string): PasswordStrength {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let score = 0;
    if (password.length > 0) score += 1;
    if (hasMinLength) score += 1;
    if (hasUppercase && hasNumber) score += 1;
    if (hasMinLength && hasUppercase && hasNumber && hasSpecial && password.length >= 10) score += 1;

    let label: PasswordStrength['label'] = 'Weak';
    if (score <= 1) label = 'Weak';
    else if (score === 2) label = 'Fair';
    else if (score === 3) label = 'Good';
    else label = 'Strong';

    return {
      score,
      label,
      hasMinLength,
      hasUppercase,
      hasNumber,
    };
  },

  /**
   * Real Email/Password Authentication via Backend PostgreSQL API
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password, rememberMe } = credentials;

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters.',
      };
    }

    try {
      const response = await apiRequest<{ user: User; token: string; expiresAt: number }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );

      const session: AuthSession = {
        user: response.user,
        token: response.token,
        expiresAt: response.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      }

      return {
        success: true,
        session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Invalid email or password. Please check your credentials.',
      };
    }
  },

  /**
   * User Registration / Sign Up via Backend PostgreSQL API
   */
  async signUpWithEmail(data: SignUpData): Promise<AuthResponse> {
    const { fullName, email, password, agreedToTerms } = data;
    const cleanEmail = email.trim().toLowerCase();

    if (!agreedToTerms) {
      return {
        success: false,
        error: 'Please accept the Terms of Service to continue.',
      };
    }

    try {
      const response = await apiRequest<{ user: User; token: string; expiresAt: number }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            name: fullName.trim(),
            email: cleanEmail,
            password,
          }),
        }
      );

      const session: AuthSession = {
        user: response.user,
        token: response.token,
        expiresAt: response.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

      return {
        success: true,
        session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unable to register account. Please try again.',
        isExistingUser: error.status === 409,
      };
    }
  },

  /**
   * Google Sign-Up / In via Backend PostgreSQL API
   */
  async signUpWithGoogle(googleData?: { email?: string; name?: string; avatarUrl?: string }): Promise<AuthResponse> {
    return this.loginWithGoogle(googleData);
  },

  async loginWithGoogle(googleData?: { email?: string; name?: string; avatarUrl?: string }): Promise<AuthResponse> {
    const email = googleData?.email || 'dakshkhamar78@gmail.com';
    const name = googleData?.name || (email === 'dakshkhamar78@gmail.com' ? 'Daksh Khamar' : email.split('@')[0]);
    const avatarUrl = googleData?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    try {
      const response = await apiRequest<{ user: User; token: string; expiresAt: number; isNewUser?: boolean }>(
        '/auth/google',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            name,
            avatarUrl,
          }),
        }
      );

      const session: AuthSession = {
        user: response.user,
        token: response.token,
        expiresAt: response.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

      return {
        success: true,
        session,
        isExistingUser: !response.isNewUser,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Google sign-in failed. Please try again.',
      };
    }
  },

  /**
   * Retrieve current authenticated session
   */
  getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!stored) return null;
      const session: AuthSession = JSON.parse(stored);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve currently signed in user
   */
  getCurrentUser(): User | null {
    const session = this.getSession();
    return session ? session.user : null;
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  /**
   * Get remembered email if stored
   */
  getRememberedEmail(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || '';
    } catch {
      return '';
    }
  },

  /**
   * Update current user profile in active session and backend
   */
  updateUser(updates: Partial<User>): User | null {
    try {
      const session = this.getSession();
      if (!session) return null;

      const updatedUser: User = {
        ...session.user,
        ...updates,
      };

      const updatedSession: AuthSession = {
        ...session,
        user: updatedUser,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession));

      // Asynchronously sync with backend
      apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }).catch((err) => console.log('Profile sync notice:', err.message));

      return updatedUser;
    } catch {
      return null;
    }
  },

  /**
   * Log out and clear session
   */
  logout(): void {
    try {
      apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch {
      // Storage fallback
    }
  },
};
