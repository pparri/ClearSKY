// src/app/auth/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  email: string;
  role: 'student' | 'instructor' | 'representative';
  name?: string;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u: User = JSON.parse(stored);
        this.user$.next(u);
      }
    }
  }

  login(creds: { email: string; role: User['role']; name?: string }) {
    const token = btoa(`${creds.email}:${creds.role}`);
    const user: User = { ...creds, token };
    this.user$.next(user);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', token);
    }

    const target =
      creds.role === 'instructor'
        ? '/instructor/initial'
        : creds.role === 'student'
        ? '/student/dashboard'
        : '/representative/dashboard';
    this.router.navigate([target]);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    this.user$.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('authToken');
  }

  // ✅ Getter per accedere all’utente corrente
  get currentUser(): User | null {
    return this.user$.getValue();
  }
}
