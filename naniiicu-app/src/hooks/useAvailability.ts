import { useState, useEffect, useRef } from 'react';

export interface AvailabilityState {
  checking: boolean;
  available: boolean | null;
  reason?: string;
}

interface UseAvailabilityOptions {
  checkFn: (name: string) => Promise<{ available: boolean; reason?: string }>;
  debounceMs?: number;
}

export const useAvailability = (
  value: string,
  { checkFn, debounceMs = 500 }: UseAvailabilityOptions
): AvailabilityState => {
  const [availability, setAvailability] = useState<AvailabilityState>({
    checking: false,
    available: null,
  });
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset if empty
    if (!value.trim()) {
      setAvailability({ checking: false, available: null });
      return;
    }

    // Set checking state
    setAvailability({ checking: true, available: null });

    // Debounce the check
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const data = await checkFn(value.trim());
        setAvailability({
          checking: false,
          available: data.available,
          reason: data.reason,
        });
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailability({ checking: false, available: null });
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, checkFn, debounceMs]);

  return availability;
};
