export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "security_admin";
  avatarUrl?: string;
  department?: string;
}

export interface SystemStats {
  totalListings: number;
  lostCount: number;
  foundCount: number;
  activeMatches: number;
  recoveredCount: number;
  resolutionRate: number; // percentage 0-100
  averageRecoveryDays: number;
}
