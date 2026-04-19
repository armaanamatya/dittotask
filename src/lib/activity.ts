import { SEARCH_RADIUS_MILES } from './config';

/**
 * Maps free-text post body to a coarse activity type via keyword heuristics.
 */
const ACTIVITY_KEYWORDS: Record<string, string[]> = {
  run: ['run', 'running', 'jog', 'jogging', 'sprint', 'soccer', 'basketball', 'workout', 'exercise', 'gym', 'trail'],
  walk: ['walk', 'walking', 'stroll', 'hike', 'hiking'],
  coffee: ['coffee', 'café', 'cafe', 'latte', 'espresso', 'pour-over', 'boba', 'tea', 'philz'],
  food: ['food', 'eat', 'lunch', 'dinner', 'brunch', 'snack', 'truck', 'restaurant', 'hungry', 'meal', 'cook'],
  study: ['study', 'studying', 'library', 'homework', 'midterm', 'final', 'exam', 'notes', 'review', 'lab'],
  art: ['art', 'gallery', 'museum', 'sketch', 'draw', 'paint', 'exhibit', 'creative'],
};

export function classifyActivity(body: string): string {
  const lower = body.toLowerCase();
  let bestType = 'hangout';
  let bestCount = 0;

  for (const [type, keywords] of Object.entries(ACTIVITY_KEYWORDS)) {
    const count = keywords.filter((kw) => lower.includes(kw)).length;
    if (count > bestCount) {
      bestCount = count;
      bestType = type;
    }
  }

  return bestType;
}

/**
 * Haversine distance in miles between two lat/lng points.
 */
export function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Compute candidates for a given activity post.
 * Candidate rule: within 1.5 miles, shares the activity tag, not the author,
 * not already in an open pending match.
 */
export function computeCandidates(
  post: { authorId: string; activityType: string; latitude: number; longitude: number },
  allUsers: { id: string; name: string; major: string; latitude: number; longitude: number; locationLabel: string; activityTags: string; interests: string }[],
  pendingMatchUserIds: Set<string>
) {
  const author = allUsers.find((u) => u.id === post.authorId);
  const authorInterests = author ? author.interests.toLowerCase().split(',').map(s => s.trim()) : [];
  const authorTags = author ? author.activityTags.toLowerCase().split(',').map(s => s.trim()) : [];

  return allUsers
    .filter((u) => {
      if (u.id === post.authorId) return false;
      if (pendingMatchUserIds.has(u.id)) return false;
      const tags = u.activityTags.split(',').map((t) => t.trim());
      if (!tags.includes(post.activityType)) return false;
      const dist = distanceMiles(post.latitude, post.longitude, u.latitude, u.longitude);
      if (dist > SEARCH_RADIUS_MILES) return false;
      return true;
    })
    .map((u) => {
      const uInterests = u.interests.toLowerCase().split(',').map(s => s.trim());
      const uTags = u.activityTags.toLowerCase().split(',').map(s => s.trim());
      let score = 0;
      uInterests.forEach(i => {
        if (authorInterests.some(ai => ai.includes(i) || i.includes(ai))) score += 0.4;
      });
      uTags.forEach(t => {
        if (authorTags.includes(t)) score += 0.2;
      });
      score = Math.max(0.1, Math.min(1.0, score));

      return {
        ...u,
        distanceMiles: Math.round(distanceMiles(post.latitude, post.longitude, u.latitude, u.longitude) * 100) / 100,
        compatibilityScore: score,
      };
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
}
