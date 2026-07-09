import { useAuthStore } from "@/features/auth/store/authStore";

const API_BASE_URL = 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;
  errors?: { field?: string; message: string }[];

  constructor(message: string, status: number, errors?: { field?: string; message: string }[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { data?: any } = {}
): Promise<T> {
  const { data, headers, ...customConfig } = options;
  const token = useAuthStore.getState().accessToken;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  config.credentials = 'include'; // Ensure cookies (refresh token) are sent for CORS requests

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return {} as T;
  }

  let json: any = {};
  try {
    json = await response.json();
  } catch (e) {
    // If not JSON or empty
  }

  if (!response.ok) {
    throw new ApiError(
      json.message || response.statusText || 'An error occurred',
      response.status,
      json.errors
    );
  }

  return json;
}
