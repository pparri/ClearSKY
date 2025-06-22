// src/app/core/guards/redirect.guard.ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, User } from '../../auth/auth.service';
import { Router } from '@angular/router';

export const redirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true; // Non loggato: può accedere a login
  }

  const user: User | null = auth.currentUser;

  if (!user) {
    // In caso di stato incoerente, forza logout e login
    auth.logout();
    return false;
  }

  // Redirect in base al ruolo
  switch (user.role) {
    case 'student':
      router.navigate(['/student/dashboard']);
      break;
    case 'instructor':
      router.navigate(['/instructor']);
      break;
    case 'representative':
      router.navigate(['/representative/dashboard']);
      break;
    default:
      router.navigate(['/login']);
      break;
  }
  return false;
};
