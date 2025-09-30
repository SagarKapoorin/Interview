import { useEffect, useRef, useState, useCallback } from 'react';

export const useTimer = (initialTime: number, onTimeout: () => void, isActive: boolean = true) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (!isActive) {
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeout();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [isActive, onTimeout]);

  const reset = useCallback(
    (newTime?: number) => {
      setTimeRemaining(newTime !== undefined ? newTime : initialTime);
    },
    [initialTime],
  );

  const pause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return { timeRemaining, reset, pause };
};
