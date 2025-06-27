import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component'; 
import { InstructorDashboardComponent } from './dashboard/instructor/instructor-dashboard.component';
import { FinalGradesComponent } from './dashboard/instructor/final-grades/final-grades.component';
import { ReviewRequestsComponent } from './dashboard/instructor/review-requests/review-requests.component';
import { InitialGradesComponent } from './dashboard/instructor/initial-grades/initial-grades.component';
import { ViewGradesStatisticsComponent } from './dashboard/instructor/grade-statistics/grade-statistics.component';
import { StudentDashboardComponent } from './dashboard/student/student-dashboard.component';
import { RepresentativeDashboardComponent } from './dashboard/representative/representative-dashboard.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';

const authGuard = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  
  if (api.getToken()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // ✅ MOVER TODAS LAS RUTAS ESPECÍFICAS ANTES DE LOS WILDCARDS
  { 
    path: 'student/courses', 
    loadComponent: () => import('./dashboard/student/student-courses/student-courses.component').then(m => m.StudentCoursesComponent),
    canActivate: [authGuard]
  },

  {
    path: 'instructor/instructor-dashboard',
    component: InstructorDashboardComponent,
    canActivate: [authGuard], // ✅ Añadir authGuard aquí también
    children: [
      { path: 'initial', component: InitialGradesComponent },
      { path: 'review', component: ReviewRequestsComponent },
      { path: 'final', component: FinalGradesComponent },
      { path: 'statistics', component: ViewGradesStatisticsComponent },
      { path: '', redirectTo: 'initial', pathMatch: 'full' }
    ]
  },

  {
    path: 'student/student-dashboard',
    component: StudentDashboardComponent,
    canActivate: [authGuard], // ✅ Añadir authGuard aquí también
    children: []
  },

  {
    path: 'representative/representative-dashboard',
    component: RepresentativeDashboardComponent,
    canActivate: [authGuard], // ✅ Añadir authGuard aquí también
    children: []
  },

  // ✅ WILDCARDS AL FINAL
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];