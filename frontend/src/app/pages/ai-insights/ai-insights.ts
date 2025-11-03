import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';

type Msg = { who: 'you' | 'ai'; text: string };

@Component({
  standalone: true,
  selector: 'app-ai-insights',
  imports: [CommonModule, FormsModule, NgFor],
  templateUrl: './ai-insights.html',
  styleUrls: ['./ai-insights.scss'],
})
export class AiInsightsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  mode = signal<'live' | 'local'>((localStorage.getItem('ai_mode') as any) || 'local');
  input = signal('');
  sending = signal(false);
  messages = signal<Msg[]>([]);

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) {
      this.input.set(q);
      // أرسل تلقائياً
      setTimeout(() => this.send(), 0);
    }
  }

  toggleMode() {
    const next = this.mode() === 'live' ? 'local' : 'live';
    this.mode.set(next);
    localStorage.setItem('ai_mode', next);
  }

  send() {
    const q = this.input().trim();
    if (!q || this.sending()) return;

    this.messages.update(m => [...m, { who: 'you', text: q }]);
    this.sending.set(true);
    this.input.set('');

    this.api.aiAsk(q, this.mode()).subscribe({
      next: ({ reply }) => {
        this.messages.update(m => [...m, { who: 'ai', text: reply }]);
        this.sending.set(false);
      },
      error: () => {
        this.messages.update(m => [...m, { who: 'ai', text: 'Server error. Please try again.' }]);
        this.sending.set(false);
      }
    });
  }
}
