// ─────────────────────────────────────────────
//  Shared TypeScript interfaces — Healthcare PWA
// ─────────────────────────────────────────────

export interface Patient {
  _id: string; // UUID generated client-side
  doctorId: string; // Firebase UID
  name: string; // plaintext
  age: number; // plaintext
  gender: 'male' | 'female' | 'other';
  phone?: string; // plaintext
  patientCode: string; // "PT-" + 6 random alphanumeric
  createdAt: string; // ISO date
  synced: boolean; // local-only flag
}

export interface Visit {
  _id: string;
  patientId: string;
  doctorId: string;
  date: string;
  symptoms: string; // ENCRYPTED before store
  diagnosis: string; // ENCRYPTED before store
  treatment: string; // ENCRYPTED before store
  notes?: string; // ENCRYPTED before store
  nextAppointment?: string;
  synced: boolean;
}

export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
}

export interface Prescription {
  _id: string;
  visitId: string;
  doctorId: string;
  medicines: Medicine[];
  synced: boolean;
}

export interface Report {
  _id: string;
  visitId: string;
  doctorId: string;
  fileName: string;
  fileType: 'image' | 'pdf';
  base64Data: string; // full base64 string
  synced: boolean;
}

export type SyncAction = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id?: number; // auto-increment IDB key
  model: 'patients' | 'visits' | 'prescriptions' | 'reports';
  action: SyncAction;
  payload: Patient | Visit | Prescription | Report;
}

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'idle';

// API response shape
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
}
