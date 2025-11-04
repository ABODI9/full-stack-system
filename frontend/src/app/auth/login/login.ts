import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

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

  email = 'guest@example.com';
  password = 'any';
  loading = false;
  error = '';
  showPw = false;

  submit() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/analytics/home'),
      error: (e) => { this.error = e?.error?.error ?? 'Failed'; this.loading = false; }
    });
  }
}
