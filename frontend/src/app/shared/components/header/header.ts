import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * هيدر بسيط مع روابط تنقل
 * - يظهر روابط مختلفة حسب وجود التوكن (تسجيل الدخول/الخروج)
 * - نخزّن التوكن في localStorage (بسيط وسهل لـSPA)
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  @Output() toggle = new EventEmitter<void>(); // emits when hamburger is clicked
  private router = inject(Router);

  get isAuthed()   { return !!localStorage.getItem('token'); }
  get userName()   { return localStorage.getItem('user_name')  ?? 'Admin'; }
  get userEmail()  { return localStorage.getItem('user_email') ?? 'admin@example.com'; }
  get initials()   { return (this.userName || 'A').trim().charAt(0).toUpperCase(); }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    this.router.navigateByUrl('/login');
  }
}