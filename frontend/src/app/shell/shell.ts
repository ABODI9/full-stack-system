import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterModule, RouterOutlet, HeaderComponent], // ⬅️ أضِفه هنا
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss'],
})
export class ShellComponent {
  collapsed = signal<boolean>(localStorage.getItem('sidebar_collapsed') === '1');

  toggle() {
    const next = !this.collapsed();
    this.collapsed.set(next);
    localStorage.setItem('sidebar_collapsed', next ? '1' : '0');
  }
}
