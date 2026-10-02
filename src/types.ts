export type Role = 'citizen' | 'worker' | 'admin';

export type PageView =
  | 'landing'
  | 'auth'
  | 'citizen-dashboard'
  | 'report-issue'
  | 'pickup-request'
  | 'track-complaints'
  | 'awareness'
  | 'worker-dashboard'
  | 'admin-dashboard';

export type Language = 'en' | 'hi';

export type UserType =
  | 'Household'
  | 'Residential Society'
  | 'College/Campus'
  | 'Commercial'
  | 'Public Place';

export type WasteStream = 'Wet' | 'Dry' | 'Sanitary' | 'Special Care';

export type PickupSubType =
  | 'Standard Segregated'
  | 'Bulky'
  | 'E-waste'
  | 'Construction debris';

export type ComplaintCategory =
  | 'Overflowing bin'
  | 'Garbage on road'
  | 'Missed collection'
  | 'Illegal dumping'
  | 'Burning waste'
  | 'Dead animal'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type PickupStatus =
  | 'Requested'
  | 'Scheduled'
  | 'Assigned'
  | 'Picked Up'
  | 'Closed';

export interface TimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  actor: string;
  note: string;
  completed: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  ward: string;
  address: string;
  lat: number;
  lng: number;
  status: ComplaintStatus;
  severity: SeverityLevel;
  createdAt: string;
  slaHoursRemaining: number; // negative if overdue
  assignedWorkerId: string;
  assignedWorkerName: string;
  assignedWorkerPhone: string;
  citizenName: string;
  isAnonymous: boolean;
  upvotes: number;
  beforePhoto: string;
  afterPhoto?: string;
  rating?: number;
  feedback?: string;
  timeline: TimelineEvent[];
}

export interface PickupRequest {
  id: string;
  stream: WasteStream;
  subType: PickupSubType;
  quantityKg: number;
  isBulkGenerator: boolean;
  preferredDate: string;
  timeSlot: string;
  ward: string;
  address: string;
  lat: number;
  lng: number;
  status: PickupStatus;
  assignedWorkerName: string;
  vehicleNumber: string;
  citizenName: string;
  createdAt: string;
  beforePhoto?: string;
  afterPhoto?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  ward: string;
  phone: string;
  vehicle: string;
  tasksCompleted: number;
  slaAdherence: number;
  avgResolutionHours: number;
  rating: number;
  activeTasks: number;
}

export interface WardPerformance {
  ward: string;
  totalComplaints: number;
  resolvedComplaints: number;
  overdueComplaints: number;
  segregationCompliance: number;
  pickupCompletion: number;
  avgHours: number;
  score: number;
}

export interface OverdueAlert {
  complaintId: string;
  category: ComplaintCategory;
  ward: string;
  hoursOverdue: number;
  escalationLevel: 'Worker' | 'Supervisor (24h)' | 'Ward Admin (48h)' | 'Super Admin (72h)';
  assignedTo: string;
  escalatedNotified: boolean;
}

export interface WasteItemGuide {
  id: string;
  name: string;
  hindiName: string;
  keywords: string[];
  stream: WasteStream;
  binColor: string;
  instruction: string;
  recoveryPath: string;
}

export interface WasteClassificationResult {
  item: string;
  hindiName?: string;
  stream: WasteStream | 'C&D' | 'Special Care';
  binColor: string;
  dustbinColorHex: string;
  howToDump: string;
  whereToDump: string;
  destination: string;
  material?: string;
  recyclable: boolean;
  confidence?: string;
  warning?: string;
  isAiGenerated?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  item: string;
  correctStream: WasteStream;
  explanation: string;
}

export interface RecyclingCenter {
  id: string;
  name: string;
  type: 'MRF & Dry Waste' | 'Authorized E-Waste' | 'Biomethanation & Compost' | 'Special Care & Hazardous';
  ward: string;
  address: string;
  distanceKm: number;
  hours: string;
  contact: string;
  acceptedStreams: string[];
}

export interface SocietyLeader {
  rank: number;
  name: string;
  type: 'Residential Society' | 'College/Campus';
  ward: string;
  segregationRate: number;
  compostingKgPerMonth: number;
  points: number;
}

export interface CitizenLeader {
  rank?: number;
  id?: string;
  name: string;
  contact?: string;
  ward: string;
  userType: UserType;
  points: number;
  streakDays: number;
  badges: string[];
  resolvedReportsCount?: number;
  taxRebateTier?: string;
}

export interface UserProfile {
  name: string;
  contact: string;
  email?: string;
  role: Role;
  userType: UserType;
  ward: string;
  address: string;
  lat: number;
  lng: number;
  points: number;
  streakDays: number;
  badges: string[];
}
