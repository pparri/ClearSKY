import {
  ApplicationConfig,
  isDevMode,
  provideZoneChangeDetection
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay
} from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { LoginComponent } from './auth/login.component';
import { StudentDashboardComponent } from './dashboard/student/student-dashboard.component';
import { InstructorDashboardComponent } from './dashboard/instructor/instructor-dashboard.component';
import { RepresentativeDashboardComponent } from './dashboard/representative/representative-dashboard.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  {
    path: 'student/student-dashboard',
    component: StudentDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'student/courses',
    loadComponent: () =>
      import('./dashboard/student/student-courses/student-courses.component')
        .then(m => m.StudentCoursesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'instructor',
    component: InstructorDashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'initial', pathMatch: 'full' },
      {
        path: 'initial',
        loadComponent: () =>
          import('./dashboard/instructor/initial-grades/initial-grades.component')
            .then(m => m.InitialGradesComponent)
      },
      {
        path: 'review',
        loadComponent: () =>
          import('./dashboard/instructor/review-requests/review-requests.component')
            .then(m => m.ReviewRequestsComponent)
      },
      {
        path: 'final',
        loadComponent: () =>
          import('./dashboard/instructor/final-grades/final-grades.component')
            .then(m => m.FinalGradesComponent)
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./dashboard/instructor/grade-statistics/grade-statistics.component')
            .then(m => m.ViewGradesStatisticsComponent)
      }
    ]
  },
  {
    path: 'representative/dashboard',
    component: RepresentativeDashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'register',
        loadComponent: () =>
          import('./dashboard/representative/register-institution.component')
            .then(m => m.RegisterInstitutionComponent)
      },
      {
        path: 'purchase',
        loadComponent: () =>
          import('./dashboard/representative/purchase-credits.component')
            .then(m => m.PurchaseCreditsComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./dashboard/representative/user-management.component')
            .then(m => m.UserManagementComponent)
      },
      {
        path: 'view-grades',
        loadComponent: () =>
          import('./dashboard/representative/view-grades.component')
            .then(m => m.ViewGradesComponent),
        canActivate: [authGuard]
      },

      { path: '', redirectTo: 'register', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode()
    }),
  ]
};
