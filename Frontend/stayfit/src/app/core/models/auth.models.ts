import { Role, Gender, Specialty } from './enums';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterCoachRequest {
  name: string;
  email: string;
  password: string;
  specialty: Specialty;
  bio?: string;
  experienceYears: number;
}

export interface RegisterClientRequest {
  name: string;
  email: string;
  password: string;
  heightCm: number;
  dateOfBirth: string; // 'YYYY-MM-DD'
  gender: Gender;
}

export interface AuthResponse {
  token: string;
}

// ASP.NET Core's System.Security.Claims.ClaimTypes.* constants (used by the backend to build
// the JWT) are the long XML/SOAP claim URIs below, not short names like "role" or "nameid" —
// the token's actual JSON keys reflect that.
export interface DecodedToken {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': Role;
  exp: number;
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}
