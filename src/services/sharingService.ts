/**
 * GlobeTrotter Trip Sharing & Collaboration Service
 * 
 * Connected to PostgreSQL backend for cross-device, cross-browser shared links and collaborators.
 */

import { Collaborator, CollaboratorRole, SharedTripLink, ShareTripPayload, SharePermission } from '../types/sharing';
import { tripService } from './tripService';
import { itineraryService } from './itineraryService';
import { buildTripRecommendations } from '../utils/recommendationMatcher';
import { budgetService } from './budgetService';
import { authService } from './authService';
import { apiRequest } from './apiClient';

const SHARED_LINKS_KEY = 'globetrotter_shared_links';
const COLLABORATORS_KEY = 'globetrotter_collaborators';

export const sharingService = {
  generateShareToken(tripId: string): string {
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timePart = Date.now().toString(36);
    const tripHash = tripId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
    return `gt_${tripHash}_${randomPart}${timePart}`;
  },

  getAllShareLinks(): SharedTripLink[] {
    try {
      const raw = localStorage.getItem(SHARED_LINKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  createShareLink(tripId: string, permission: SharePermission = 'view'): SharedTripLink {
    const links = this.getAllShareLinks();
    const currentUser = authService.getCurrentUser();

    const existing = links.find((l) => l.tripId === tripId && l.isActive);
    if (existing) {
      if (existing.permission !== permission) {
        existing.permission = permission;
        try {
          localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(links));
        } catch {
          // fallback
        }
      }
      return existing;
    }

    const shareToken = this.generateShareToken(tripId);
    const newLink: SharedTripLink = {
      id: `link_${Date.now()}`,
      tripId,
      shareToken,
      permission,
      createdBy: currentUser?.name || 'Trip Owner',
      createdAt: new Date().toISOString(),
      isActive: true,
      viewCount: 0,
    };

    const updated = [newLink, ...links];
    try {
      localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(updated));
    } catch {
      // fallback
    }

    // Persist to PostgreSQL
    if (authService.isAuthenticated() && !tripId.startsWith('temp_')) {
      apiRequest(`/trips/${tripId}/share`, {
        method: 'POST',
        body: JSON.stringify({ permission }),
      })
        .then((serverLink) => {
          if (serverLink?.shareToken) {
            newLink.shareToken = serverLink.shareToken;
            localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(updated));
          }
        })
        .catch((err) => console.log('Share link DB persist notice:', err.message));
    }

    return newLink;
  },

  getShareLinkForTrip(tripId: string): SharedTripLink | null {
    const links = this.getAllShareLinks();
    return links.find((l) => l.tripId === tripId && l.isActive) || null;
  },

  revokeShareLink(tripId: string): void {
    const links = this.getAllShareLinks();
    const updated = links.map((l) => (l.tripId === tripId ? { ...l, isActive: false } : l));
    try {
      localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(updated));
    } catch {
      // fallback
    }
  },

  /**
   * Async fetch of shared trip payload from PostgreSQL across any browser or device
   */
  async fetchSharedTrip(shareToken: string): Promise<ShareTripPayload | null> {
    try {
      const data = await apiRequest<any>(`/shared/${shareToken}`);
      if (data && data.trip) {
        const mappedTrip = {
          ...data.trip,
          durationDays: Math.max(1, Math.ceil((new Date(data.trip.endDate).getTime() - new Date(data.trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1),
          travelersCount: 2,
          tripType: 'leisure',
          coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
        };

        const recommendations = buildTripRecommendations(mappedTrip);
        const expenses = (data.expenses || []).map((e: any) => ({
          ...e,
          category: e.category?.toLowerCase() || 'other',
        }));

        const allocations = budgetService.getBudgetAllocations(mappedTrip.id, mappedTrip);
        const budget = budgetService.getBudgetSnapshot(mappedTrip, data.itinerary, expenses, allocations);

        return {
          trip: mappedTrip,
          itinerary: data.itinerary,
          recommendations,
          budget,
          expenses,
          permission: data.permission || 'view',
          shareToken,
          sharedBy: {
            name: data.trip.ownerName || 'GlobeTrotter Explorer',
            email: 'shared@globetrotter.io',
          },
          createdAt: data.trip.createdAt,
        };
      }
      return this.getSharedTrip(shareToken);
    } catch {
      return this.getSharedTrip(shareToken);
    }
  },

  getSharedTrip(shareToken: string): ShareTripPayload | null {
    const links = this.getAllShareLinks();
    const link = links.find((l) => l.shareToken === shareToken && l.isActive);

    if (!link) {
      const directTrip = tripService.getTripById(shareToken);
      if (directTrip) {
        return this.buildPayloadForTrip(directTrip, 'view', shareToken);
      }
      return null;
    }

    const trip = tripService.getTripById(link.tripId);
    if (!trip) return null;

    link.viewCount = (link.viewCount || 0) + 1;
    try {
      localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(links));
    } catch {
      // fallback
    }

    return this.buildPayloadForTrip(trip, link.permission, link.shareToken);
  },

  buildPayloadForTrip(trip: any, permission: SharePermission, shareToken: string): ShareTripPayload {
    const itinerary = itineraryService.getItinerary(trip.id);
    const recommendations = buildTripRecommendations(trip);
    const expenses = budgetService.getExpenses(trip.id);
    const allocations = budgetService.getBudgetAllocations(trip.id, trip);
    const budget = budgetService.getBudgetSnapshot(trip, itinerary, expenses, allocations);

    return {
      trip,
      itinerary,
      recommendations,
      budget,
      expenses,
      permission,
      shareToken,
      sharedBy: {
        name: trip.userId ? 'GlobeTrotter Traveler' : 'Trip Creator',
        email: 'collaborate@globetrotter.travel',
      },
      createdAt: trip.createdAt,
    };
  },

  getAllCollaboratorsMap(): Record<string, Collaborator[]> {
    try {
      const raw = localStorage.getItem(COLLABORATORS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  getCollaborators(tripId: string): Collaborator[] {
    const map = this.getAllCollaboratorsMap();
    return map[tripId] || [];
  },

  inviteCollaborator(
    tripId: string,
    email: string,
    role: CollaboratorRole = 'viewer',
    message?: string
  ): Collaborator {
    const map = this.getAllCollaboratorsMap();
    const list = map[tripId] || [];

    const existingIndex = list.findIndex(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase()
    );

    const currentUser = authService.getCurrentUser();
    const namePart = email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const collabId = `collab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newCollaborator: Collaborator = {
      id: collabId,
      tripId,
      email: email.trim().toLowerCase(),
      name: formattedName,
      role,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      invitedBy: currentUser?.name || 'Trip Owner',
    };

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        role,
      };
    } else {
      list.push(newCollaborator);
    }

    map[tripId] = list;
    try {
      localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(map));
    } catch {
      // fallback
    }

    // Persist to PostgreSQL
    if (authService.isAuthenticated() && !tripId.startsWith('temp_')) {
      apiRequest(`/trips/${tripId}/collaborators`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      }).catch((err) => console.log('Invite collaborator DB sync:', err.message));
    }

    return newCollaborator;
  },

  updatePermission(tripId: string, collaboratorId: string, role: CollaboratorRole): void {
    const map = this.getAllCollaboratorsMap();
    const list = map[tripId] || [];

    const updatedList = list.map((c) => (c.id === collaboratorId ? { ...c, role } : c));
    map[tripId] = updatedList;

    try {
      localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(map));
    } catch {
      // fallback
    }

    if (authService.isAuthenticated() && !collaboratorId.startsWith('collab_temp')) {
      apiRequest(`/collaborators/${collaboratorId}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }).catch((err) => console.log('Update collaborator role sync:', err.message));
    }
  },

  removeCollaborator(tripId: string, collaboratorId: string): void {
    const map = this.getAllCollaboratorsMap();
    const list = map[tripId] || [];

    map[tripId] = list.filter((c) => c.id !== collaboratorId);
    try {
      localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(map));
    } catch {
      // fallback
    }

    if (authService.isAuthenticated() && !collaboratorId.startsWith('collab_temp')) {
      apiRequest(`/collaborators/${collaboratorId}`, {
        method: 'DELETE',
      }).catch((err) => console.log('Remove collaborator sync:', err.message));
    }
  },
};
