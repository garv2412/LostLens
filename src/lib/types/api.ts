export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  meta?: {
    mode: "demo" | "live";
    total?: number;
    timestamp?: string;
  };
}
