import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegisterCoachRequest,
  RegisterClientRequest,
  AuthResponse,
  DecodedToken,
  CurrentUser,
  RegisterAdminRequest
} from '../models/auth.models';
import { Role } from '../models/enums';

const TOKEN_KEY = 'stayfit_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  private currentUserSignal = signal<CurrentUser | null>(this.decodeStoredToken());

  currentUser = this.currentUserSignal.asReadonly();
  isLoggedIn = computed(() => this.currentUserSignal() !== null);
  currentRole = computed(() => this.currentUserSignal()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => this.setSession(response.token))
    );
  }

  registerAdmin(request: RegisterAdminRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register-admin`, request);
  }

  registerCoach(request: RegisterCoachRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register-coach`, request);
  }

  registerClient(request: RegisterClientRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register-client`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRole(...roles: Role[]): boolean {
    const current = this.currentUserSignal();
    return current !== null && roles.includes(current.role);
  }

  private setSession(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.currentUserSignal.set(this.decodeToken(token));
  }

  private decodeStoredToken(): CurrentUser | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (decoded && this.isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return decoded;
  }

  private decodeToken(token: string): CurrentUser | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as DecodedToken;
      const id = Number(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
      const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (!Number.isFinite(id) || !name || !email || !role) {
        return null;
      }

      return { id, name, email, role };
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as DecodedToken;
      const expiryDate = payload.exp * 1000;
      return Date.now() > expiryDate;
    } catch {
      return true;
    }
  }
}
