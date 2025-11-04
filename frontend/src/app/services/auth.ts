import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type User = {
  id: number;
  name: string | null;
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/auth`;

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; user: User }>(`${this.base}/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user_name', res.user.name ?? '');
          localStorage.setItem('user_email', res.user.email);
        })
      );
  }

  /** Public Signup */
  register(data: { name?: string; email: string; password: string }) {
    return this.http
      .post<{ token: string; user: User }>(`${this.base}/register`, data)
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user_name', res.user.name ?? '');
          localStorage.setItem('user_email', res.user.email);
        })
      );
  }

  me() {
    return this.http.get<User>(`${this.base}/me`);
  }

  /** Admin create user */
  createUser(data: { name?: string; email: string; password: string; role?: 'admin' | 'manager' }) {
    return this.http.post<User>(`${this.base}/admin/users`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
  }

  get token() {
    return localStorage.getItem('token');
  }
}
