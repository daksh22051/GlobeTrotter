/**
 * GlobeTrotter Core TypeScript Definitions
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferredCurrency?: string;
}

export interface TravelRoutePoint {
  id: string;
  name: string;
  country: string;
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
  order: number;
  duration?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export * from './profile';
export * from './destination';
export * from './trip';
export * from './itinerary';
export * from './budget';
