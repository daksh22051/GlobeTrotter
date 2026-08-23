/**
 * Trip Sharing & Collaboration Data Models
 */

import { Trip } from './trip';
import { Itinerary } from './itinerary';
import { TripRecommendations } from './recommendation';
import { BudgetSnapshot, Expense } from './budget';

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';
export type SharePermission = 'view' | 'edit';

export interface Collaborator {
  id: string;
  tripId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: CollaboratorRole;
  status: InvitationStatus;
  invitedAt: string;
  invitedBy?: string;
}

export interface SharedTripLink {
  id: string;
  tripId: string;
  shareToken: string;
  permission: SharePermission;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  viewCount?: number;
}

export interface ShareTripPayload {
  trip: Trip;
  itinerary: Itinerary | null;
  recommendations: TripRecommendations | null;
  budget: BudgetSnapshot | null;
  expenses: Expense[];
  permission: SharePermission;
  shareToken: string;
  sharedBy?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
}
