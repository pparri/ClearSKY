// src/app/core/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStat } from '../models/dashboard-stat.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api'; // <--- Forza l'uso del proxy

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStat[]> {
    return this.http.get<DashboardStat[]>(`${this.apiUrl}/dashboard-stats`);
  }

  getRecentActivity(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/recent-activity`);
  }
}