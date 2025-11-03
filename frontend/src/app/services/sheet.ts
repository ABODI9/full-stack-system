// src/app/services/sheets.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import Papa from 'papaparse';

@Injectable({providedIn:'root'})
export class SheetsService {
  private http = inject(HttpClient);

  fetchCsv<T = any>(csvUrl: string) {
    return this.http.get(csvUrl, { responseType: 'text' }).pipe(
      map(text => Papa.parse<T>(text, { header:true, skipEmptyLines:true }).data)
    );
  }
}
