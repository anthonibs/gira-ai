import { useState, useEffect, useRef } from "react";

export function useChallengeTimer(initialSeconds: number, onFinished: () => void, onTick: (remaining: number) => void) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(initialSeconds);
  const [timerJustFinished, setTimerJustFinished] = useState(false);
  const timerFinishedFxTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!timerRunning) return;

    const intervalId = window.setInterval(() => {
      setTimerRemaining((previous) => {
        if (previous <= 1) {
          window.clearInterval(intervalId);
          setTimerRunning(false);
          setTimerJustFinished(true);
          onFinished();
          return 0;
        }
        onTick(previous - 1);
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerRunning, onFinished, onTick]);

  useEffect(() => {
    if (!timerJustFinished) return;

    timerFinishedFxTimeoutRef.current = window.setTimeout(() => {
      setTimerJustFinished(false);
    }, 900);

    return () => {
      if (timerFinishedFxTimeoutRef.current) window.clearTimeout(timerFinishedFxTimeoutRef.current);
    };
  }, [timerJustFinished]);

  return {
    timerRunning,
    setTimerRunning,
    timerRemaining,
    setTimerRemaining,
    timerJustFinished,
    setTimerJustFinished
  };
}
