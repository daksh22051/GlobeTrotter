/**
 * Authentication Service (Mock implementation for Hackathon prototype)
 * 
 * Manages user authentication, token storage, and mock session validation.
 * Isolated abstraction ready to be wired to backend/Firebase/OAuth in future features.
 */

import { User } from '../types';
import { LoginCredentials, SignUpData, AuthResponse, AuthSession, PasswordStrength } from '../types/auth';

const STORAGE_KEYS = {
  SESSION: 'globetrotter_session',
  REMEMBERED_EMAIL: 'globetrotter_remembered_email',
} as const;

// Known existing demo emails for duplicate email simulation
const EXISTING_DEMO_EMAILS = ['alex.morgan@gmail.com', 'existing@example.com', 'demo@globetrotter.com'];

// Simulated network latency helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
   * Mock Email/Password Authentication
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(750); // Simulate network roundtrip

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

    // Specific rejected mock demo condition (if testing failure state)
    if (email.toLowerCase() === 'error@example.com') {
      return {
        success: false,
        error: 'Unable to sign in. Please check your email and password.',
      };
    }

    // Generate mock user from email
    const namePart = email.split('@')[0];
    const formattedName = namePart
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const mockUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: formattedName || 'Traveler',
      email: email.toLowerCase(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      preferredCurrency: 'INR',
    };

    const session: AuthSession = {
      user: mockUser,
      token: `gt_token_${Math.random().toString(36).substring(2)}_${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Store in localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      }
    } catch {
      // Storage unavailable or disabled
    }

    return {
      success: true,
      session,
    };
  },

  /**
   * Mock User Registration / Sign Up
   */
  async signUpWithEmail(data: SignUpData): Promise<AuthResponse> {
    await delay(850); // Realistic network delay

    const { fullName, email, password, agreedToTerms } = data;
    const cleanEmail = email.trim().toLowerCase();

    // Check for simulated duplicate user
    if (EXISTING_DEMO_EMAILS.includes(cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email already exists.',
        isExistingUser: true,
      };
    }

    if (!agreedToTerms) {
      return {
        success: false,
        error: 'Please accept the Terms of Service to continue.',
      };
    }

    const mockNewUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: fullName.trim() || 'New Explorer',
      email: cleanEmail,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      preferredCurrency: 'INR',
    };

    const session: AuthSession = {
      user: mockNewUser,
      token: `gt_signup_token_${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch {
      // Storage fallback
    }

    return {
      success: true,
      session,
    };
  },

  /**
   * Mock Google Sign-Up
   */
  async signUpWithGoogle(): Promise<AuthResponse> {
    await delay(900); // Simulate OAuth popup latency

    const mockGoogleUser: User = {
      id: `usr_google_${Math.random().toString(36).substring(2, 9)}`,
      name: 'Taylor Reed',
      email: 'taylor.reed@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      preferredCurrency: 'INR',
    };

    const session: AuthSession = {
      user: mockGoogleUser,
      token: `gt_google_token_${Date.now()}`,
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch {
      // Storage fallback
    }

    return {
      success: true,
      session,
    };
  },

  /**
   * Mock Google Sign-In
   */
  async loginWithGoogle(): Promise<AuthResponse> {
    await delay(850); // Simulate OAuth popup / handshake latency

    const mockGoogleUser: User = {
      id: `usr_google_${Math.random().toString(36).substring(2, 9)}`,
      name: 'Alex Morgan',
      email: 'alex.morgan@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      preferredCurrency: 'INR',
    };

    const session: AuthSession = {
      user: mockGoogleUser,
      token: `gt_google_token_${Date.now()}`,
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch {
      // Storage fallback
    }

    return {
      success: true,
      session,
    };
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
   * Log out and clear session
   */
  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch {
      // Storage fallback
    }
  },
};
