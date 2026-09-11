/**
 * Telemetry and Distributed Tracing Type Definitions
 * Matches backend SQL Server (DB_Clinical.telemetry.event_traces) and FastAPI schemas.
 */

/**
 * Payload sent to POST /api/telemetry/events/{event_id}/interaction
 * Used to record patient client-side viewing lifecycle timestamps.
 */
export interface EventTraceInteractionUpdate {
  t7_fetched_at?: string | null;      // ISO 8601 UTC string (when coaching data arrived in client)
  t8_displayed_at?: string | null;    // ISO 8601 UTC string: Video card/modal rendered on screen (Time-to-Display)
  t9_played_at?: string | null;       // ISO 8601 UTC string: Playback initiated (Time-to-Play & Reaction Delay)
  t10_completed_at?: string | null;   // ISO 8601 UTC string: Playback completed
  watch_duration_seconds?: number | null;
}

/**
 * Payload sent to POST /api/videos/{video_id}/interaction
 * Used to update the patient's video library viewing record.
 */
export interface VideoInteractionUpdate {
  watched: boolean;
  watch_duration_seconds: number;
  rating?: number | null;             // Optional 1 to 5 star rating
  t10_completed_at?: string | null;   // ISO 8601 UTC string
}

/**
 * Single trace item returned in recent_traces array from GET /api/telemetry/reporting/latency-kpis
 */
export interface EventTraceItem {
  event_id: string;
  patient_id: string;
  trigger_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'routine';
  scenario: string;
  action?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  video_filename?: string | null;
  signals_flagged?: number | null;
  vm_push_status?: string | null;
  is_test?: boolean;
  t0_detected_at?: string | null;
  t1_sent_at?: string | null;
  t2_received_at_pi?: string | null;
  t3_processed_at_pi?: string | null;
  t4_pushed_at_vm?: string | null;
  t5_received_at_vm?: string | null;
  t6_persisted_at_db?: string | null;
  t7_fetched_at_app?: string | null;
  t8_displayed_at_app?: string | null;
  t9_played_at_app?: string | null;
  t10_completed_at_app?: string | null;
  pi_processing_ms?: number | null;
  vm_push_ms?: number | null;
  server_ms?: number | null;
  transit_latency_ms?: number | null;
  total_latency_ms?: number | null;
  time_to_display_ms?: number | null;
  time_to_play_ms?: number | null;
  patient_reaction_ms?: number | null;
  total_rtt_ms?: number | null;
  budget_s?: number;
  budget_passed: boolean;
  status: 'partial' | 'complete' | 'displayed' | 'played' | 'completed';
  created_at?: string | null;
}

/**
 * Response received from GET /api/telemetry/reporting/latency-kpis (Clinician Dashboard)
 */
export interface LatencyKPIDashboardResponse {
  total_events: number;
  avg_pi_processing_ms: number | null;
  avg_vm_push_ms: number | null;
  avg_network_transit_ms: number | null;
  avg_time_to_display_ms: number | null;
  avg_time_to_play_ms: number | null;
  avg_patient_reaction_ms: number | null;
  sla_budget_pass_rate_pct: number;
  active_monitored_patients: number;
  recent_traces: EventTraceItem[];
}

/**
 * Individual clip metadata for a multi-clip coaching package
 */
export interface CoachingClip {
  id?: string | number;
  title: string;
  url: string;
  video_url?: string;
  duration_s: number;
  subtitles_en?: string;
  subtitles_fr?: string;
  subtitle_en_url?: string;
  subtitle_fr_url?: string;
  vtt_en_url?: string;
  vtt_fr_url?: string;
}

/**
 * Normalized coaching video data model used across patient portal
 */
export interface NormalizedCoachingVideo {
  id: string | number;
  title: string;
  category: string;
  url?: string;
  video_url?: string;
  videoType: 'single' | 'package';
  parsedClips: CoachingClip[];
  duration_s: number;
  duration: string;
  triggerReason?: string;
  trigger_reason?: string;
  relevance?: 'high' | 'medium' | 'low';
  watched?: boolean;
  rating?: number | null;
  event_id?: string | null;
  eventId?: string | null;
  created_at?: string | null;
  vtt_en_url?: string;
  vtt_fr_url?: string;
  subtitle_en_url?: string;
  subtitle_fr_url?: string;
  subtitles_en?: string;
  subtitles_fr?: string;
}
