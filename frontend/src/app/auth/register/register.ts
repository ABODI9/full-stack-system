import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth';

@Component({
  selector: 'app-register',              // يمكنك إبقاء الاسم كما هو
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  me: User | null = null;               // لمعرفة إن كان أدمن
  name = '';
  email = '';
  password = '';
  role: 'manager' | 'admin' = 'manager';

  loading = false;
  error = '';
  info = '';

  ngOnInit() {
    this.auth.me().subscribe({
      next: (u) => this.me = u,
      error: (_e: any) => { this.me = null; }   // ← عرّف نوع e لتفادي ts(7006)
    });
  }

  get isAdmin() { return this.me?.role === 'admin'; }

  submit() {
    this.error = '';
    this.info = '';

    if (!this.isAdmin) {
      this.error = 'Only admins can create users';
      return;
    }
    if (!this.email || !this.password) {
      this.error = 'Email & password are required';
      return;
    }

    this.loading = true;
    this.auth.createUser({ name: this.name, email: this.email, password: this.password, role: this.role })
      .subscribe({
        next: (_u) => {
          this.info = 'User created successfully';
          this.name = ''; this.email = ''; this.password = ''; this.role = 'manager';
          this.loading = false;
        },
        error: (e: any) => {                        // ← حدّد نوع e
          this.error = e?.error?.error ?? 'Failed';
          this.loading = false;
        }
      });
  }
}
