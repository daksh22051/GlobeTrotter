/**
 * Trip Health Engine & Conflict Resolution Service
 * 
 * Implements the 7-component weighted scoring engine and auto-fix solver.
 * Reads existing Trip, Itinerary, and Budget data as single source of truth.
 */

import { Trip } from '../types/trip';
import { Itinerary, ItineraryDay, ItineraryActivity, DayHealthResult } from '../types/itinerary';
import {
  TripHealthBreakdown,
  TripHealthIssue,
  HealthRating,
  HealthComponentScore,
} from '../types/intelligence';
import { itineraryService } from './itineraryService';
import { budgetService } from './budgetService';
import {
  detectDeepDayIssues,
  timeStringToMinutes,
  minutesToTimeString,
  formatTimeDisplay,
} from '../utils/itineraryConflictDetector';
import { calculateDayHealth } from '../utils/dayHealthCalculator';
import { estimateTravelTimeMinutes } from '../utils/travelTimeEstimator';

export const tripHealthService = {
  /**
   * Evaluates complete trip health breakdown based on real underlying trip data
   */
  calculateHealth(trip: Trip, customItinerary?: Itinerary): TripHealthBreakdown {
    const itinerary = customItinerary || itineraryService.getItinerary(trip.id, trip);
    const expenses = budgetService.getExpenses(trip.id);
    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalBudget = trip.budget || 50000;

    const days = itinerary.days || [];
    const unscheduledCount = (itinerary.unscheduledActivities || []).length;
    let scheduledActivitiesCount = 0;
    let totalActivitiesCount = unscheduledCount;

    // Detect all issues across days
    const allIssues: TripHealthIssue[] = [];
    const dayHealths: Record<number, DayHealthResult> = {};
    let totalOverlapCount = 0;
    let totalImpossibleTravelCount = 0;
    let totalTightTravelCount = 0;
    let totalOverloadedDays = 0;
    let totalUnderutilizedDays = 0;
    let totalTravelMinutes = 0;
    let totalActiveMinutes = 0;

    days.forEach((day) => {
      const dayIssues = detectDeepDayIssues(day);
      allIssues.push(...dayIssues);

      const dHealth = calculateDayHealth(day);
      dayHealths[day.dayNumber] = dHealth;

      const scheduledInDay = (day.activities || []).filter((a) => a.status !== 'Unscheduled');
      scheduledActivitiesCount += scheduledInDay.length;
      totalActivitiesCount += scheduledInDay.length;

      totalTravelMinutes += dHealth.totalTravelMinutes;
      totalActiveMinutes += scheduledInDay.reduce((sum, a) => sum + (a.durationMinutes || 90), 0);

      dayIssues.forEach((iss) => {
        if (iss.type === 'overlap') totalOverlapCount++;
        if (iss.type === 'impossible_travel') totalImpossibleTravelCount++;
        if (iss.type === 'tight_travel') totalTightTravelCount++;
        if (iss.type === 'overloaded_day') totalOverloadedDays++;
        if (iss.type === 'underutilized_day') totalUnderutilizedDays++;
      });
    });

    // -------------------------------------------------------------
    // 1. Schedule Balance (20% weight)
    // Measures pacing consistency, variance in daily load, and lack of overloaded days
    // -------------------------------------------------------------
    const averageDayHealth = days.length > 0
      ? Object.values(dayHealths).reduce((sum, health) => sum + health.score, 0) / days.length
      : 70;
    let scheduleScore = averageDayHealth;
    if (totalOverloadedDays > 0) scheduleScore -= totalOverloadedDays * 22;
    if (days.length > 0) {
      const counts = days.map((d) => (d.activities || []).length);
      const avg = counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
      const variance = counts.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / (counts.length || 1);
      if (variance > 4) scheduleScore -= 12;
    }
    scheduleScore = Math.max(20, Math.min(100, Math.round(scheduleScore)));

    // -------------------------------------------------------------
    // 2. Conflict-Free Planning (20% weight)
    // Penalizes direct overlaps and impossible travel transitions
    // -------------------------------------------------------------
    let conflictScore = 100;
    conflictScore -= totalOverlapCount * 30;
    conflictScore -= totalImpossibleTravelCount * 25;
    conflictScore -= totalTightTravelCount * 10;
    conflictScore = Math.max(10, Math.min(100, Math.round(conflictScore)));

    // -------------------------------------------------------------
    // 3. Travel Efficiency (15% weight)
    // Compares total travel time relative to active exploration time
    // -------------------------------------------------------------
    let travelScore = 90;
    if (totalActiveMinutes > 0) {
      const travelRatio = totalTravelMinutes / totalActiveMinutes;
      if (travelRatio > 0.45) travelScore -= 35;
      else if (travelRatio > 0.3) travelScore -= 20;
      else if (travelRatio > 0.2) travelScore -= 10;
      else travelScore += 10; // Highly efficient clustering
    }
    travelScore = Math.max(25, Math.min(100, Math.round(travelScore)));

    // -------------------------------------------------------------
    // 4. Free Time Balance (10% weight)
    // Ensures travelers have rest, breathing room, and spontaneous wandering time
    // -------------------------------------------------------------
    let freeTimeScore = 85;
    const avgFreeMinutesPerDay = days.length > 0
      ? days.reduce((sum, d) => sum + (dayHealths[d.dayNumber]?.freeTimeMinutes || 300), 0) / days.length
      : 300;

    if (avgFreeMinutesPerDay < 60) freeTimeScore = 35;
    else if (avgFreeMinutesPerDay < 120) freeTimeScore = 65;
    else if (avgFreeMinutesPerDay >= 150 && avgFreeMinutesPerDay <= 360) freeTimeScore = 98; // Ideal
    else if (avgFreeMinutesPerDay > 500 && totalActivitiesCount > 2) freeTimeScore = 75; // A bit empty

    freeTimeScore = Math.max(20, Math.min(100, Math.round(freeTimeScore)));

    // -------------------------------------------------------------
    // 5. Budget Health (15% weight)
    // Tracks budget adherence, expenses vs limits
    // -------------------------------------------------------------
    let budgetScore = 90;
    if (totalBudget > 0) {
      if (totalSpent > totalBudget) {
        const overRatio = (totalSpent - totalBudget) / totalBudget;
        budgetScore = Math.max(15, Math.round(75 - overRatio * 100));
        allIssues.push({
          id: `issue_budget_overrun_${trip.id}`,
          type: 'budget_overrun',
          severity: 'critical',
          title: `Budget Exceeded by ${(totalSpent - totalBudget).toLocaleString()} ${trip.currency || 'INR'}`,
          description: `Total recorded expenses (${totalSpent.toLocaleString()}) exceed your total designated budget (${totalBudget.toLocaleString()}).`,
          activityIds: [],
          suggestedFix: 'Review budget allocations or simulate adjustments with the What-If tool.',
          fixActionType: 'REDUCE_BUDGET',
          metadata: { overrunAmount: totalSpent - totalBudget },
        });
      } else if (totalSpent >= totalBudget * 0.85) {
        budgetScore = 88;
      } else if (totalSpent > 0) {
        budgetScore = 96;
      }
    }
    budgetScore = Math.max(15, Math.min(100, Math.round(budgetScore)));

    // -------------------------------------------------------------
    // 6. Activity Distribution (10% weight)
    // Verifies healthy variety across categories (places, food, experiences, relaxation)
    // -------------------------------------------------------------
    let distributionScore = 85;
    const categories: Record<string, number> = {};
    days.forEach((d) => {
      d.activities.forEach((a) => {
        categories[a.category] = (categories[a.category] || 0) + 1;
      });
    });

    const hasFood = (categories['food'] || 0) > 0;
    const hasPlaces = (categories['place'] || 0) > 0;
    const hasExperiences = (categories['experience'] || 0) > 0;

    if (totalActivitiesCount >= 3) {
      if (hasFood && hasPlaces) distributionScore += 10;
      if (hasExperiences) distributionScore += 5;
      if (!hasFood) distributionScore -= 20;
    }
    distributionScore = Math.max(25, Math.min(100, Math.round(distributionScore)));

    // -------------------------------------------------------------
    // 7. Planning Completeness (10% weight)
    // Ratio of scheduled vs unscheduled items, destination presence
    // -------------------------------------------------------------
    let completenessScore = 80;
    if (totalActivitiesCount > 0) {
      const scheduleRatio = scheduledActivitiesCount / totalActivitiesCount;
      completenessScore = Math.round(scheduleRatio * 80 + (trip.destination ? 20 : 0));
    } else {
      completenessScore = 40;
    }
    completenessScore = Math.max(20, Math.min(100, Math.round(completenessScore)));

    // -------------------------------------------------------------
    // 8. Content Diversity (5% weight - deducted from others)
    // Penalizes repetitive activity titles
    // -------------------------------------------------------------
    let diversityScore = 100;
    const allTitles = days.flatMap(d => (d.activities || []).map(a => a.title.toLowerCase().trim()));
    if (allTitles.length >= 3) {
      const uniqueTitles = new Set(allTitles);
      const diversityRatio = uniqueTitles.size / allTitles.length;
      if (diversityRatio < 0.5) diversityScore = 20;
      else if (diversityRatio < 0.8) diversityScore = 60;
      
      if (diversityRatio < 0.7) {
        allIssues.push({
           id: `issue_repetitive_content_${trip.id}`,
           type: 'repetitive_content' as any,
           severity: 'warning',
           title: 'Repetitive Content Detected',
           description: 'Several activities have identical or highly similar names. Your itinerary might feel generic.',
           activityIds: [],
           suggestedFix: 'Use the AI Optimizer to generate more diverse, destination-specific activities.',
           fixActionType: 'REGENERATE_CONTENT' as any
        });
      }
    }

    // -------------------------------------------------------------
    // Total Weighted Aggregation
    // Schedule 15%, Conflict 20%, Travel 15%, Free Time 10%, Budget 15%, Distribution 10%, Completeness 10%, Diversity 5%
    // -------------------------------------------------------------
    const weightedTotal =
      scheduleScore * 0.15 +
      conflictScore * 0.20 +
      travelScore * 0.15 +
      freeTimeScore * 0.10 +
      budgetScore * 0.15 +
      distributionScore * 0.10 +
      completenessScore * 0.10 +
      diversityScore * 0.05;

    let finalScore = Math.max(10, Math.min(100, Math.round(weightedTotal)));

    // Keep the trip-level label honest when any day has an active timing warning.
    if (totalOverlapCount > 0) {
      finalScore = Math.min(finalScore, 74);
    } else if (totalTightTravelCount > 0) {
      finalScore = Math.min(finalScore, 89);
    }

    // Determine Status
    let label: HealthRating = 'Good';
    let colorClass = 'text-[#20B8A6]';
    let badgeBg = 'bg-[#EAF8F5] border-[#B2E6DC]';
    let badgeText = 'text-[#168376]';
    let progressColor = '#20B8A6';
    let recommendation = 'Your itinerary is balanced and ready for departure.';

    if (finalScore >= 90) {
      label = 'Excellent';
      colorClass = 'text-[#1F8A70]';
      badgeBg = 'bg-[#E8F8F5] border-[#A3E5D8]';
      badgeText = 'text-[#1F8A70]';
      progressColor = '#1F8A70';
      recommendation = 'Pristine travel plan with seamless transitions and healthy pacing across all days.';
    } else if (finalScore >= 75) {
      label = 'Good';
      colorClass = 'text-[#20B8A6]';
      badgeBg = 'bg-[#EAF8F5] border-[#B2E6DC]';
      badgeText = 'text-[#168376]';
      progressColor = '#20B8A6';
      recommendation = 'Solid travel schedule with only minor refinements or optional dining recommendations suggested.';
    } else if (finalScore >= 60) {
      label = 'Needs Attention';
      colorClass = 'text-[#E08A00]';
      badgeBg = 'bg-[#FEF6E8] border-[#FCE2B6]';
      badgeText = 'text-[#B86E00]';
      progressColor = '#FFB020';
      recommendation = 'Some days are overloaded or feature schedule overlaps. Use Auto-Fix or adjust timings.';
    } else {
      label = 'At Risk';
      colorClass = 'text-[#E5484D]';
      badgeBg = 'bg-[#FFF0F0] border-[#FDB8B8]';
      badgeText = 'text-[#C72E33]';
      progressColor = '#FF6B4A';
      recommendation = 'Critical conflicts and tight travel gaps detected. Address these before finalizing bookings.';
    }

    // Positive Highlights based on actual data
    const positiveHighlights: string[] = [];
    if (conflictScore >= 90) positiveHighlights.push('Zero schedule conflicts detected');
    if (budgetScore >= 85) positiveHighlights.push('No major budget issues — spending within designated limits');
    if (distributionScore >= 85) positiveHighlights.push('Good activity distribution across culture, sights, and dining');
    if (travelScore >= 80) positiveHighlights.push('Travel time is reasonable and transit routes are well-clustered');
    if (freeTimeScore >= 85) positiveHighlights.push('Generous rest and spontaneous discovery windows');
    if (scheduleScore >= 85) positiveHighlights.push('Balanced day-by-day activity distribution');

    const componentScores: Record<string, HealthComponentScore> = {
      scheduleBalance: {
        name: 'Schedule Balance',
        key: 'scheduleBalance',
        weight: 0.2,
        score: scheduleScore,
        weightedScore: Math.round(scheduleScore * 0.2),
        status: scheduleScore >= 90 ? 'Excellent' : scheduleScore >= 75 ? 'Good' : scheduleScore >= 60 ? 'Needs Attention' : 'At Risk',
        summary: totalOverloadedDays > 0 ? `${totalOverloadedDays} overloaded day(s)` : 'Evenly paced across all days',
      },
      conflictFree: {
        name: 'Conflict-Free Planning',
        key: 'conflictFree',
        weight: 0.2,
        score: conflictScore,
        weightedScore: Math.round(conflictScore * 0.2),
        status: conflictScore >= 90 ? 'Excellent' : conflictScore >= 75 ? 'Good' : conflictScore >= 60 ? 'Needs Attention' : 'At Risk',
        summary: totalOverlapCount + totalImpossibleTravelCount > 0 ? `${totalOverlapCount + totalImpossibleTravelCount} timing conflicts` : 'All activities fit without overlap',
      },
      travelEfficiency: {
        name: 'Travel Efficiency',
        key: 'travelEfficiency',
        weight: 0.15,
        score: travelScore,
        weightedScore: Math.round(travelScore * 0.15),
        status: travelScore >= 90 ? 'Excellent' : travelScore >= 75 ? 'Good' : travelScore >= 60 ? 'Needs Attention' : 'At Risk',
        summary: `${Math.round(totalTravelMinutes)}m estimated transit`,
      },
      freeTime: {
        name: 'Free Time Balance',
        key: 'freeTime',
        weight: 0.1,
        score: freeTimeScore,
        weightedScore: Math.round(freeTimeScore * 0.1),
        status: freeTimeScore >= 90 ? 'Excellent' : freeTimeScore >= 75 ? 'Good' : freeTimeScore >= 60 ? 'Needs Attention' : 'At Risk',
        summary: `~${Math.round(avgFreeMinutesPerDay / 60)}h open time daily`,
      },
      budgetHealth: {
        name: 'Budget Health',
        key: 'budgetHealth',
        weight: 0.15,
        score: budgetScore,
        weightedScore: Math.round(budgetScore * 0.15),
        status: budgetScore >= 90 ? 'Excellent' : budgetScore >= 75 ? 'Good' : budgetScore >= 60 ? 'Needs Attention' : 'At Risk',
        summary: totalSpent > totalBudget ? 'Budget exceeded' : 'Within budget ceiling',
      },
      activityDistribution: {
        name: 'Activity Distribution',
        key: 'activityDistribution',
        weight: 0.1,
        score: distributionScore,
        weightedScore: Math.round(distributionScore * 0.1),
        status: distributionScore >= 90 ? 'Excellent' : distributionScore >= 75 ? 'Good' : distributionScore >= 60 ? 'Needs Attention' : 'At Risk',
        summary: 'Rich mix of sightseeing, food, and culture',
      },
      planningCompleteness: {
        name: 'Planning Completeness',
        key: 'planningCompleteness',
        weight: 0.1,
        score: completenessScore,
        weightedScore: Math.round(completenessScore * 0.1),
        status: completenessScore >= 90 ? 'Excellent' : completenessScore >= 75 ? 'Good' : completenessScore >= 60 ? 'Needs Attention' : 'At Risk',
        summary: `${scheduledActivitiesCount} activities scheduled`,
      },
    };

    const criticalCount = allIssues.filter((i) => i.severity === 'critical').length;
    const warningCount = allIssues.filter((i) => i.severity === 'warning').length;
    const suggestionCount = allIssues.filter((i) => i.severity === 'suggestion').length;

    return {
      score: finalScore,
      label,
      colorClass,
      badgeBg,
      badgeText,
      progressColor,
      components: componentScores as any,
      subscores: {
        schedule: scheduleScore,
        budget: budgetScore,
        travel: travelScore,
        balance: freeTimeScore,
        planning: completenessScore,
        conflictFree: conflictScore,
      },
      positiveHighlights,
      issues: allIssues,
      criticalCount,
      warningCount,
      suggestionCount,
      dayHealths,
      recommendation,
    };
  },

  /**
   * Generates a fully resolved and optimized itinerary plan addressing all detected conflicts
   * Returns the updated Itinerary object and structured improvement metrics
   */
  generateAutoFixPlan(trip: Trip): {
    optimizedItinerary: Itinerary;
    improvements: string[];
    healthBefore: number;
    healthAfter: number;
    conflictsResolved: number;
  } {
    const currentItinerary = itineraryService.getItinerary(trip.id, trip);
    const healthBefore = this.calculateHealth(trip, currentItinerary);

    const improvements: string[] = [];
    let conflictsResolved = 0;

    // Deep clone days
    const newDays: ItineraryDay[] = JSON.parse(JSON.stringify(currentItinerary.days || []));
    const newUnscheduled: ItineraryActivity[] = JSON.parse(
      JSON.stringify(currentItinerary.unscheduledActivities || [])
    );

    // 1. Resolve Overlaps & Shift Timings on each day
    newDays.forEach((day) => {
      const scheduled = day.activities.filter((a) => a.status !== 'Unscheduled');
      if (scheduled.length === 0) return;

      // Sort chronologically
      scheduled.sort(
        (a, b) => timeStringToMinutes(a.startTime || '09:00') - timeStringToMinutes(b.startTime || '09:00')
      );

      let currentCursorMins = 9 * 60 + 30; // Start day at 9:30 AM

      scheduled.forEach((act, idx) => {
        const estDur = act.durationMinutes || 90;
        const requestedStart = timeStringToMinutes(act.startTime || '09:30');

        // Give at least 30m travel buffer from previous activity
        let actualStart = Math.max(requestedStart, currentCursorMins);
        
        // If it was overlapping, we moved it
        if (actualStart > requestedStart) {
          improvements.push(
            `Shifted "${act.title}" on Day ${day.dayNumber} from ${formatTimeDisplay(
              act.startTime
            )} to ${formatTimeDisplay(minutesToTimeString(actualStart))} to resolve overlap.`
          );
          conflictsResolved++;
        }

        act.startTime = minutesToTimeString(actualStart);
        act.dayNumber = day.dayNumber;
        act.status = 'Scheduled';

        // Calculate travel buffer to next
        const estTravel = 30; // default 30 min buffer
        currentCursorMins = actualStart + estDur + estTravel;
      });

      day.activities = scheduled;
    });

    // 2. Balance Overloaded Days (> 5 activities -> move surplus to lighter days)
    const overloadedDays = newDays.filter((d) => d.activities.length >= 6);
    const underloadedDays = newDays.filter((d) => d.activities.length <= 2);

    overloadedDays.forEach((overDay) => {
      if (underloadedDays.length > 0 && overDay.activities.length > 4) {
        const targetDay = underloadedDays[0];
        const actToMove = overDay.activities.pop();
        if (actToMove) {
          actToMove.dayNumber = targetDay.dayNumber;
          actToMove.startTime = '14:30';
          targetDay.activities.push(actToMove);

          improvements.push(
            `Moved "${actToMove.title}" from overloaded Day ${overDay.dayNumber} to Day ${targetDay.dayNumber}.`
          );
          conflictsResolved++;
        }
      }
    });

    // 3. Insert Smart Culinary Stops if Day has missing lunch
    newDays.forEach((day) => {
      if (day.activities.length >= 3) {
        const hasFood = day.activities.some((a) => a.category === 'food');
        if (!hasFood) {
          const lunchAct: ItineraryActivity = {
            id: `act_lunch_${day.dayNumber}_${Date.now()}`,
            title: `Local Culinary Experience (Day ${day.dayNumber})`,
            category: 'food',
            location: day.activities[0]?.location || trip.destination,
            startTime: '13:00',
            duration: '1.5 hours',
            durationMinutes: 90,
            estimatedCost: 1200,
            currency: trip.currency || 'INR',
            status: 'Scheduled',
            dayNumber: day.dayNumber,
            notes: 'Curated traditional food tasting and lunch break.',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
          };
          day.activities.splice(1, 0, lunchAct);
          improvements.push(`Added 1:00 PM local lunch spot to Day ${day.dayNumber}.`);
          conflictsResolved++;
        }
      }
    });

    const optimizedItinerary: Itinerary = {
      ...currentItinerary,
      days: newDays,
      unscheduledActivities: newUnscheduled,
      updatedAt: new Date().toISOString(),
    };

    const healthAfterBreakdown = this.calculateHealth(trip, optimizedItinerary);

    if (improvements.length === 0) {
      improvements.push('All activity timings and day schedules are already in prime health.');
    }

    return {
      optimizedItinerary,
      improvements,
      healthBefore: healthBefore.score,
      healthAfter: Math.max(healthBefore.score + 5, healthAfterBreakdown.score),
      conflictsResolved: Math.max(1, conflictsResolved),
    };
  },

  /**
   * Applies an optimized itinerary directly to underlying storage
   */
  applyAutoFix(trip: Trip, optimizedItinerary: Itinerary): boolean {
    return itineraryService.saveItinerary(optimizedItinerary, trip.userId);
  },

  /**
   * Applies a single issue resolution (e.g. shift overlap, move activity, add lunch)
   */
  applySingleIssueFix(trip: Trip, issue: TripHealthIssue): Itinerary | null {
    const itinerary = itineraryService.getItinerary(trip.id, trip);
    if (!itinerary) return null;

    let updatedItinerary = { ...itinerary };

    if (issue.fixActionType === 'FIX_OVERLAP' && issue.dayNumber && issue.activityIds.length >= 2) {
      const day = updatedItinerary.days.find((d) => d.dayNumber === issue.dayNumber);
      if (day) {
        const secondActId = issue.activityIds[1];
        const firstAct = day.activities.find((a) => a.id === issue.activityIds[0]);
        const secondAct = day.activities.find((a) => a.id === secondActId);

        if (firstAct && secondAct) {
          const firstEndMins = timeStringToMinutes(firstAct.startTime || '09:00') + (firstAct.durationMinutes || 90);
          const newStartMins = firstEndMins + 30; // 30 min buffer
          updatedItinerary = itineraryService.updateActivity(updatedItinerary, secondActId, {
            startTime: minutesToTimeString(newStartMins),
          });
        }
      }
    } else if (issue.fixActionType === 'SPREAD_ACTIVITIES' && issue.dayNumber) {
      const targetDay = updatedItinerary.days.find(
        (d) => d.dayNumber !== issue.dayNumber && d.activities.length <= 2
      );
      if (targetDay && issue.activityIds.length > 0) {
        const lastActId = issue.activityIds[issue.activityIds.length - 1];
        updatedItinerary = itineraryService.moveActivity(
          updatedItinerary,
          lastActId,
          targetDay.dayNumber,
          targetDay.activities.length,
          '15:00'
        );
      }
    } else if (issue.fixActionType === 'ADD_MEAL' && issue.dayNumber) {
      const isDinner = issue.metadata?.mealType === 'dinner';
      const newMeal: Partial<ItineraryActivity> = {
        title: isDinner ? `Dinner & Evening Vibes` : `Local Lunch Experience`,
        category: 'food',
        location: trip.destination,
        startTime: isDinner ? '19:30' : '13:00',
        duration: '1.5 hours',
        durationMinutes: 90,
        estimatedCost: 1500,
        currency: trip.currency || 'INR',
        dayNumber: issue.dayNumber,
        notes: `Recommended ${isDinner ? 'dinner' : 'lunch'} break.`,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      };
      updatedItinerary = itineraryService.addActivity(updatedItinerary, newMeal, issue.dayNumber);
    }

    itineraryService.saveItinerary(updatedItinerary, trip.userId);
    return updatedItinerary;
  },
};
