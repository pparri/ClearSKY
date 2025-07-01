// src/app/auth/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  registration_id?: string;
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

  login(creds: { email: string; role: string; name?: string }) {
    const token = btoa(`${creds.email}:${creds.role}`);
    const user: Partial<User> = { ...creds, token };
    this.user$.next(user as User);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
    }

    const target =
      creds.role === 'instructor'
        ? '/instructor/initial'
        : creds.role === 'student'
        ? '/student/dashboard'
        : '/representative/dashboard';
    this.router.navigate([target]);
  }

  setCurrentUser(user: User, token: string) {
    const userWithToken = { ...user, token };
    this.user$.next(userWithToken);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    this.user$.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  }

  // ✅ Getter per accedere all’utente corrente
  get currentUser(): User | null {
    return this.user$.getValue();
  }
}
