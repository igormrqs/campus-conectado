import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { formatCalendarDate } from './date';

/** Local civil date, refreshed at midnight and whenever the app resumes. */
export function useTaskToday(): string {
  const [today, setToday] = useState(() => formatCalendarDate(new Date()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      const now = new Date();
      setToday(formatCalendarDate(now));
      const midnight = new Date(now.getTime());
      midnight.setHours(24, 0, 0, 0);
      timer = setTimeout(refresh, Math.max(1, midnight.getTime() - now.getTime()));
    };
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return today;
}
