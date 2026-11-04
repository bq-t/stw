// Mission rotation happens once a day at 00:00 UTC.

/** "YYYY-MM-DD" of the UTC day containing `now`. */
export function rotationDay(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** The next 00:00 UTC strictly after `now`. */
export function nextRotation(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

/** Milliseconds until the next rotation. */
export function msUntilRotation(now: Date = new Date()): number {
  return nextRotation(now).getTime() - now.getTime();
}
