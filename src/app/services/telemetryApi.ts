/**
 * Telemetry API Client Service
 * Re-exports unified telemetry methods connected to the core API client engine.
 * Ensures single source of truth for Base URL, JWT authentication, and error handling.
 */

import {
  logTraceInteraction,
  submitVideoInteraction,
  fetchLatencyKPIDashboard,
} from '../data/api';
import type {
  EventTraceInteractionUpdate,
  VideoInteractionUpdate,
  LatencyKPIDashboardResponse,
  EventTraceItem,
} from '../types/telemetry';

export {
  logTraceInteraction,
  submitVideoInteraction,
  fetchLatencyKPIDashboard,
};

export type {
  EventTraceInteractionUpdate,
  VideoInteractionUpdate,
  LatencyKPIDashboardResponse,
  EventTraceItem,
};

/**
 * Convenience alias for video completion matching Omar's specification
 */
export const logVideoCompletion = async (
  videoId: string | number,
  updateData: VideoInteractionUpdate,
  patientId: string = '1'
): Promise<void> => {
  await submitVideoInteraction(patientId, videoId, updateData);
};
