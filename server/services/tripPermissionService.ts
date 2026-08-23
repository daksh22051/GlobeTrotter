import { getDb } from '../db/index.ts';
import { trips, tripCollaborators, sharedTripLinks } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.ts';

export type UserRole = 'owner' | 'editor' | 'viewer' | 'none';

export async function getUserTripRole(userId: string | undefined, tripId: string): Promise<UserRole> {
  const db = await getDb();

  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
  if (!trip) {
    return 'none';
  }

  if (userId && trip.userId === userId) {
    return 'owner';
  }

  if (userId) {
    const [collab] = await db
      .select()
      .from(tripCollaborators)
      .where(and(eq(tripCollaborators.tripId, tripId), eq(tripCollaborators.userId, userId)));

    if (collab && collab.status === 'accepted') {
      return collab.role as UserRole;
    }
  }

  return 'none';
}

export async function checkTripAccess(
  userId: string | undefined,
  tripId: string,
  requiredRole: 'viewer' | 'editor' | 'owner'
): Promise<{ trip: any; role: UserRole }> {
  const db = await getDb();
  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  const role = await getUserTripRole(userId, tripId);

  if (requiredRole === 'owner' && role !== 'owner') {
    throw new AppError('Forbidden: Only the trip owner can perform this action', 403);
  }

  if (requiredRole === 'editor' && role !== 'owner' && role !== 'editor') {
    throw new AppError('Forbidden: You need edit permissions for this trip', 403);
  }

  if (requiredRole === 'viewer' && role === 'none') {
    throw new AppError('Forbidden: You do not have permission to view this trip', 403);
  }

  return { trip, role };
}
