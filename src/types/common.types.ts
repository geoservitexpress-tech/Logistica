export interface ApiResponse<T> {
  success: boolean;

  data: T;

  message?: string;
}

export interface SelectOption {
  label: string;

  value: string;
}

export interface Coordinates {
  latitude: number;

  longitude: number;
}