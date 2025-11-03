import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../services/auth';
import { environment } from '../../../environments/environment';

type Health = { status: 'ok' | 'error'; apiUrl: string; checkedAt: string; message: string };

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  currentUser: User | null = null;

  profile = {
    firstName: localStorage.getItem('user_name') ?? 'User',
    email: localStorage.getItem('user_email') ?? 'user@example.com'
  };
  pwd = { current: '', next: '', confirm: '' };

  health: Health | null = null;
  loading = false;
  now = new Date();

  // Admin create user form
  newUser = { name: '', email: '', password: '', role: 'manager' as 'manager' | 'admin' };
  creating = false;
  createMsg = '';

  ngOnInit() {
    this.auth.me().subscribe({
      next: (u) => { this.currentUser = u; this.checkBackend(); },
      error: () => { this.currentUser = null; this.checkBackend(); }
    });
  }
  get isAdmin() { return this.currentUser?.role === 'admin'; }

  saveProfile() {
    localStorage.setItem('user_name', this.profile.firstName);
    localStorage.setItem('user_email', this.profile.email);
    alert('Profile saved locally.');
  }
  changePassword() {
    if (this.pwd.next !== this.pwd.confirm) { alert('Passwords do not match'); return; }
    alert('Password change request sent (implement API call).');
  }

  checkBackend() {
    this.loading = true;
    const url = `${environment.apiBase}/health`; // 👈 أهم سطر
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.health = {
          status: res?.status === 'ok' ? 'ok' : 'error',
          apiUrl: res?.apiUrl ?? environment.apiBase,
          checkedAt: new Date().toLocaleString(),
          message: res?.message ?? 'Connected'
        };
        this.loading = false;
      },
      error: () => {
        this.health = {
          status: 'error',
          apiUrl: environment.apiBase,
          checkedAt: new Date().toLocaleString(),
          message: 'Backend is not reachable'
        };
        this.loading = false;
      }
    });
  }

  createUser() {
    this.createMsg = '';
    if (!this.newUser.email || !this.newUser.password) {
      this.createMsg = 'Email & password are required'; return;
    }
    this.creating = true;
    this.auth.createUser(this.newUser).subscribe({
      next: (u) => {
        this.createMsg = `User created: ${u.email} (${u.role})`;
        this.newUser = { name: '', email: '', password: '', role: 'manager' };
        this.creating = false;
      },
      error: (e) => {
        this.createMsg = e?.error?.error ?? 'Failed';
        this.creating = false;
      }
    });
  }
}
