export interface ApiResponse<T> {
  success: true;
  code: number;
  data: T | null;
  message: string;
  timestamp: number;
}

interface Errors {
  code: number;
  message: string;
  details: string | null;
}

export interface AppError {
  success: false;
  errors: Errors;
  timestamp: number;
}
