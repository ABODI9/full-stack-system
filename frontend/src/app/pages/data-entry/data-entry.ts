import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../shared/safe-url.pipe';

type SheetLink = {
  title: string;
  description: string;
  /** رابط المشاركة كما هو (edit?… أو ?usp=sharing) */
  openUrl: string;
  /** نولّد منه رابط العرض داخل iframe (/preview?rm=minimal) */
  viewUrl: string;
};

@Component({
  standalone: true,
  selector: 'app-data-entry',
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './data-entry.html',
  styleUrls: ['./data-entry.scss'],
})
export class DataEntryComponent {
  /** يحوّل رابط Google Sheets إلى /preview?rm=minimal ليلائم الـ iframe */
  private toPreview(url: string): string {
    try {
      const u = new URL(url);
      // شكل الروابط العامة: /spreadsheets/d/<ID>/edit?...  أو بدون /edit
      // نحافظ على /spreadsheets/d/<ID>/preview?rm=minimal
      const parts = u.pathname.split('/');
      const idx = parts.findIndex(p => p === 'spreadsheets');
      // نتأكد أن التركيب كما نتوقع
      if (idx >= 0) {
        // ابحث عن "edit" أو أي لاحقة بعد الـ ID واستبدلها بـ "preview"
        const dIdx = parts.findIndex(p => p === 'd');
        // عادة: /spreadsheets/d/<ID>/<something>
        if (dIdx >= 0 && parts[dIdx + 1]) {
          parts.length = dIdx + 2; // احتفظ حتى ال-ID
          parts.push('preview');   // أضف preview كوجهة
          u.pathname = parts.join('/');
          u.search = 'rm=minimal';
          return u.toString();
        }
      }
    } catch {}
    // لو ما قدر يحوّل لأي سبب، رجّع الرابط الأصلي (غالبًا سيعمل أيضًا)
    return url;
  }

  private link(title: string, openUrl: string, description: string): SheetLink {
    return {
      title,
      description,
      openUrl,
      viewUrl: this.toPreview(openUrl),
    };
  }

  sheets: SheetLink[] = [
    this.link(
      '📊 Restaurant Sales (Monthly)',
      'https://docs.google.com/spreadsheets/d/1CAXprzD-ppSVAIoWLeyU5Kj7EJG7PZhu/edit?usp=sharing',
      'Monthly sales by platform (YemekSepeti, Trendyol, Getir, Migros).'
    ),
    this.link(
      '👥 Customer Insights',
      'https://docs.google.com/spreadsheets/d/1yjDKf87J-C-d_QqNYEl76TemjNA1gWX_/edit?usp=sharing',
      'Customer retention, average order value, and lifetime value (LTV).'
    ),
    this.link(
      '🍔 Product Performance',
      'https://docs.google.com/spreadsheets/d/1FCphq09pRCymuw9EwyvJ8ObWHDauIOB7/edit?usp=sharing',
      'Top selling items with quantity, revenue, and profit margin.'
    ),
    this.link(
      '💰 Cost Tracking',
      'https://docs.google.com/spreadsheets/d/1KsFS9WggpDK5cKzjqlDLTPGp3N0Tenzd/edit?usp=sharing',
      'Daily cost records for ingredients, packaging, and delivery.'
    ),
    this.link(
      '📦 Restaurant Data Pack (All-in-One)',
      'https://docs.google.com/spreadsheets/d/1T4SR36StAUXSzjg6Uhk5WT0W82o9u8Lo/edit?usp=sharing',
      'Combined dataset to test dashboards end-to-end.'
    ),
  ];
}
