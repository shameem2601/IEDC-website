import { EventItem } from '../types';

/**
 * Determines whether an event has passed:
 * 1. If status is explicitly 'past' in Sanity CMS -> true
 * 2. If status is explicitly 'upcoming' in Sanity CMS -> false
 * 3. If status is 'auto' or not specified:
 *    Automatically checks the event's date & time against current real-world local time.
 *    Automatically switches from upcoming to past once the event passes.
 */
export function isEventPast(evt: EventItem): boolean {
  if (evt.status === 'past') return true;
  if (evt.status === 'upcoming') return false;

  const rawDate = evt.eventDate || evt.date;
  if (!rawDate) return false;

  const eventTime = new Date(rawDate).getTime();
  if (isNaN(eventTime)) return false;

  // If only a date is given (YYYY-MM-DD), count it as past only after the day ends (23:59:59)
  if (rawDate.length === 10) {
    const endOfDay = new Date(`${rawDate}T23:59:59`).getTime();
    if (!isNaN(endOfDay)) {
      return endOfDay < Date.now();
    }
  }

  return eventTime < Date.now();
}
