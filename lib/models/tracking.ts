/**
 * Tracking and GPS Models
 */

export interface TrackingData {
  trackingId: string;
  bookingId: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  distance: number;
  route: RoutePoint[];
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
}

export interface TrackingStartResponse {
  trackingId: string;
  startedAt: string;
}

export interface TrackingStopResponse {
  duration: number;
  distance: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
}

export interface SOSAlert {
  bookingId: string;
  latitude: number;
  longitude: number;
  message?: string;
}

export interface SOSAlertResponse {
  alertId: string;
  notifiedContacts: string[];
}

