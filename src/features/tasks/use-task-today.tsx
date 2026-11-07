import { formatCalendarDate } from './date';
/** V2 contract stub; worker adds midnight/resume handling without changing API. */
export function useTaskToday(): string { return formatCalendarDate(new Date()); }
