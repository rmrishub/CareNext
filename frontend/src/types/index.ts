export type UserRole = "FAMILY_SPONSOR" | "CAREGIVER" | "OPS_MANAGER" | "ADMIN";

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
}

export type MobilityLevel = "INDEPENDENT" | "CANE_WALKER" | "WHEELCHAIR" | "BEDRIDDEN";

export type PersonaStatus = "DRAFT" | "IN_PROGRESS" | "REVIEW" | "SAVED";

export type ShiftPreference = "EIGHT_HOUR_DAY" | "TWELVE_HOUR_DAY_NIGHT" | "TWENTY_FOUR_HOUR_LIVE_IN";

export type LocationVerificationStatus = 
  | "PENDING" 
  | "VERIFYING" 
  | "VERIFIED" 
  | "NOT_SERVICEABLE" 
  | "INVALID_ADDRESS" 
  | "UNABLE_TO_VERIFY" 
  | "PERMISSION_DENIED";

export interface ElderLocation {
  id: string;
  elderId: string;
  addressLine1: string;
  addressLine2?: string | null;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string | null;
  latitude: number;
  longitude: number;
  verificationStatus: LocationVerificationStatus;
  serviceable: boolean;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Elder {
  id: string;
  familyId: string;
  name: string;
  dateOfBirth?: string | null;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  locationId?: string | null;
  mobilityLevel: MobilityLevel;
  medicalConditions: string[];
  careRequirements: string[];
  medicalDevices: string[];
  dietaryPreferences: string[];
  languages: string[];
  primaryLanguage: string;
  lifestylePreferences: string[];
  dailyRoutine?: Record<string, any> | null;
  shiftPreference: ShiftPreference;
  additionalNotes?: string | null;
  personaStatus: PersonaStatus;
  createdAt: string;
  updatedAt: string;
  location?: ElderLocation | null;
}

export type AssessmentStatus = "DRAFT" | "SUBMITTED" | "CONFIRMED" | "FAILED" | "CANCELLED";

export interface HomeAssessment {
  id: string;
  elderId: string;
  requestedBy: string;
  addressSnapshot: Record<string, any>;
  preferredDate: string;
  preferredTime: "MORNING_9_12" | "AFTERNOON_12_4" | "EVENING_4_7";
  notes?: string | null;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LocationVerifyResponse {
  serviceable: boolean;
  verificationStatus: LocationVerificationStatus;
  message: string;
  latitude: number;
  longitude: number;
  locality: string;
  city: string;
  postalCode: string;
  assignedHub?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ==========================================
// PHASE B TYPES (Matching, Interview, Payment, SLA)
// ==========================================

export interface CaregiverExperience {
  id: string;
  caregiverId: string;
  category: string;
  yearsExperience: number;
  description?: string | null;
}

export interface CaregiverAvailability {
  id: string;
  caregiverId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
}

export interface Caregiver {
  id: string;
  userId?: string | null;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  profilePhoto?: string | null;
  gender: string;
  age: number;
  languages: string[];
  primaryLanguage: string;
  skills: string[];
  mobilityExperience: string[];
  medicalConditions: string[];
  shiftPreferences: string[];
  serviceLocalities: string[];
  hourlyRate: number;
  dailyRate: number;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
  isAvailable: boolean;
  experiences?: CaregiverExperience[];
}

export interface RecommendationMatch {
  caregiver: Caregiver;
  matchScore: number;
  eligibilityStatus: "ELIGIBLE" | "CONDITIONAL";
  matchReasons: string[];
  localityMatch: boolean;
  languageMatch: boolean;
}

export interface CaregiverRecommendationResponse {
  elderId: string;
  totalMatches: number;
  recommendations: RecommendationMatch[];
}

export interface ShortlistResponse {
  id: string;
  familyId: string;
  elderId: string;
  caregiverId: string;
  status: string;
  createdAt: string;
  caregiver: Caregiver;
}

export interface Interview {
  id: string;
  familyId: string;
  elderId: string;
  caregiverId: string;
  scheduledStart: string;
  scheduledEnd: string;
  durationMinutes: number;
  meetingType: string;
  meetingReference?: string | null;
  notes?: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  createdAt: string;
  updatedAt: string;
  caregiver?: Caregiver;
}

export interface PaymentOrder {
  id: string;
  familyId: string;
  elderId: string;
  caregiverId: string;
  amount: number;
  currency: string;
  description: string;
  gateway: string;
  gatewayOrderId?: string | null;
  status: "CREATED" | "PAID" | "FAILED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  caregiver?: Caregiver;
}

export interface SLAAgreement {
  id: string;
  familyId: string;
  elderId: string;
  caregiverId: string;
  version: string;
  title: string;
  content: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  acceptedAt?: string | null;
  acceptedBy?: string | null;
  createdAt: string;
  caregiver?: Caregiver;
}

export interface PhaseBState {
  id: string;
  familyId: string;
  elderId: string;
  selectedCaregiverId?: string | null;
  matchingStatus: "NOT_STARTED" | "IN_PROGRESS" | "SHORTLISTED" | "SELECTED";
  interviewStatus: "NOT_STARTED" | "SCHEDULED" | "COMPLETED" | "PASSED";
  paymentStatus: "NOT_STARTED" | "ORDER_CREATED" | "PAID";
  slaStatus: "NOT_STARTED" | "ACCEPTED";
  phaseStatus: "IN_PROGRESS" | "COMPLETED";
  updatedAt: string;
  selectedCaregiver?: Caregiver | null;
}
