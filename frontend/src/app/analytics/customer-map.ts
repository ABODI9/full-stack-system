import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';
import * as L from 'leaflet';

@Component({
  standalone: true,
  selector: 'app-customer-map',
  imports: [CommonModule],
  template: `
    <h2 style="margin:0 0 10px">🗺️ Customer Map</h2>
    <div class="card map-card">
      <div id="customerMap" class="map"></div>
    </div>
  `,
  styles: [`
    .card{
      background:#fff; border:1px solid #e5e7eb; border-radius:14px;
      box-shadow:0 1px 2px rgba(16,24,40,.06); padding:0;
    }
    .map-card{ height:560px; overflow:hidden; }     /* مهم: قصّ أي تجاوز */
    .map{ width:100%; height:100%; }                /* الخريطة تملأ الكارت */
    :host ::ng-deep .leaflet-container {            /* تحسين الحواف */
      border-radius:14px;
    }
  `]
})
export class CustomerMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);

  private map!: L.Map;
  private layerGroup!: L.LayerGroup;

  ngOnInit(): void {
    this.initMap();
    this.loadPoints();
  }

  ngAfterViewInit(): void {
    // بعد رسم الـ DOM، حدّث أبعاد الخريطة حتى لا “تتفلت” خارج الكارت
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  @HostListener('window:resize')
  onResize() {
    this.map?.invalidateSize();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('customerMap', {
      center: L.latLng(41.015, 28.979),
      zoom: 10,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    this.layerGroup = L.layerGroup().addTo(this.map);
  }

  private loadPoints(): void {
    this.api.customerMap().subscribe(({ points }) => {
      if (!this.map || !this.layerGroup) return;

      this.layerGroup.clearLayers();

      const values = points.map(p => p.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const norm = (v: number) => (v - min) / Math.max(1, (max - min));

      const bounds: L.LatLng[] = [];

      points.forEach(p => {
        const t = norm(p.value);
        const radius = 6 + t * 16;
        const fill = `rgba(${Math.round(120 + t*100)-30}, 80, ${Math.round(120 + t*100)}, 0.85)`;

        const marker = L.circleMarker([p.lat, p.lng], {
          radius,
          color: '#7c3aed',
          weight: 1,
          opacity: 0.9,
          fillColor: fill,
          fillOpacity: 0.6
        }).bindTooltip(`₺${p.value.toLocaleString('tr-TR')}`, {
          direction: 'top', offset: L.point(0, -8), className: 'tw-tip'
        });

        marker.addTo(this.layerGroup);
        bounds.push(L.latLng(p.lat, p.lng));
      });

      if (bounds.length) {
        this.map.fitBounds(L.latLngBounds(bounds), { padding: [20, 20] });
      }

      // تأكيد أخير أن الأبعاد صحيحة بعد التحريك/التكبير
      setTimeout(() => this.map.invalidateSize(), 0);
    });
  }
}
