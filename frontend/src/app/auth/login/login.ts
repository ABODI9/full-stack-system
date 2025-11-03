import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * صفحة تسجيل الدخول
 * - تحقق بسيط على الحقول
 * - عند النجاح يخزن التوكن ويعيد التوجيه للصفحة الرئيسية
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';
  showPw = false;

  submit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Enter email & password';
      return;
    }
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (e) => { this.error = e?.error?.error ?? 'Failed'; this.loading = false; }
    });
  }
}