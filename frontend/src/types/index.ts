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

