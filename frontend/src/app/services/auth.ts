import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
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

  /**
   * تسجيل دخول "وهمي": يرجّع مستخدم ضيف ويخزن بيانات بسيطة محليًا.
   * ما فيه أي نداء للباك إند.
   */
  login(email: string, _password: string) {
    const guest = {
      token: 'guest',
      user: { id: 0, name: 'Guest', email, role: 'user' as const }
    };
    return of(guest).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user_name', res.user.name ?? '');
        localStorage.setItem('user_email', res.user.email);
      })
    );
  }

  /**
   * me(): يرجّع الضيف دائمًا إذا ما فيه بيانات مخزنة.
   * (بدون استدعاء /auth/me)
   */
  me() {
    const name   = localStorage.getItem('user_name')  ?? 'Guest';
    const email  = localStorage.getItem('user_email') ?? 'guest@example.com';
    const user: User = { id: 0, name, email, role: 'user' };
    return of(user);
  }

  /**
   * تقدر تخليها كما هي لو ودك تستخدم إنشاء المستخدم لاحقًا،
   * أو علّقها إذا ما تحتاجها الآن.
   */
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
