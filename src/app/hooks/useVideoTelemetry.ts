import { useEffect, useRef, useCallback } from 'react';
import { logTraceInteraction, submitVideoInteraction } from '../data/api';

export interface UseVideoTelemetryOptions {
  eventId?: string | null;     // Optional distributed tracing event UUID
  videoId: string | number;    // Assigned video ID
  patientId?: string;          // Current patient ID
  isVisible: boolean;          // True when modal or card is mounted/visible
}

export const useVideoTelemetry = ({
  eventId,
  videoId,
  patientId = '1',
  isVisible,
}: UseVideoTelemetryOptions) => {
  const hasLoggedDisplayRef = useRef<boolean>(false);
  const hasLoggedPlayRef = useRef<boolean>(false);
  const currentVideoIdRef = useRef<string | number>(videoId);

  // Reset tracking flags if video changes
  if (currentVideoIdRef.current !== videoId) {
    currentVideoIdRef.current = videoId;
    hasLoggedDisplayRef.current = false;
    hasLoggedPlayRef.current = false;
  }

  // 1. Log t8_displayed_at (Time-to-Display KPI) when modal mounts or enters screen
  useEffect(() => {
    if (isVisible && !hasLoggedDisplayRef.current) {
      hasLoggedDisplayRef.current = true;
      const displayedAtIso = new Date().toISOString();

      if (eventId) {
        logTraceInteraction(eventId, {
          t8_displayed_at: displayedAtIso,
        });
      }
    }
  }, [isVisible, eventId]);

  // 2. Event Handler: Log t9_played_at (Time-to-Play KPI) when user starts playback
  const handlePlay = useCallback(() => {
    if (!hasLoggedPlayRef.current) {
      hasLoggedPlayRef.current = true;
      const playedAtIso = new Date().toISOString();

      if (eventId) {
        logTraceInteraction(eventId, {
          t9_played_at: playedAtIso,
        });
      }
    }
  }, [eventId]);

  // 3. Event Handler: Log t10_completed_at when playback finishes
  const handleEnded = useCallback(
    async (watchDurationSeconds: number, rating: number | null = null) => {
      const completedAtIso = new Date().toISOString();
      const roundedSeconds = Math.round(watchDurationSeconds || 0);

      // A. Complete distributed trace lifecycle on backend SQL Server (if eventId attached)
      if (eventId) {
        logTraceInteraction(eventId, {
          t10_completed_at: completedAtIso,
          watch_duration_seconds: roundedSeconds,
        });
      }

      // B. Record video completion and optional star rating in video library
      await submitVideoInteraction(patientId, videoId, {
        watched: true,
        watch_duration_seconds: roundedSeconds,
        rating: rating,
      });
    },
    [eventId, videoId, patientId]
  );

  return {
    handlePlay,
    handleEnded,
  };
};
