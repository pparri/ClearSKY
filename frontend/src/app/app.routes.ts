import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component'; 

import { InstructorDashboardComponent } from './dashboard/instructor/instructor-dashboard.component';

import { FinalGradesComponent } from './dashboard/instructor/final-grades/final-grades.component';
import { ReviewRequestsComponent } from './dashboard/instructor/review-requests/review-requests.component';
import { InitialGradesComponent } from './dashboard/instructor/initial-grades/initial-grades.component';
import { ViewGradesStatisticsComponent } from './dashboard/instructor/grade-statistics/grade-statistics.component';

// Student components
import { StudentDashboardComponent } from './dashboard/student/student-dashboard.component';
//import { ViewGradesComponent } from './dashboard/student/view-grades/view-grades.component';
//import { RequestReviewComponent } from './dashboard/student/request-review/request-review.component';

// Representative components
import { RepresentativeDashboardComponent } from './dashboard/representative/representative-dashboard.component';
//import { ManageUsersComponent } from './dashboard/representative/manage-users/manage-users.component';


export const routes: Routes = [

  { path: 'login', component: LoginComponent },

  {
   path: 'instructor/instructor-dashboard', // La URL que usas en el login
    component: InstructorDashboardComponent,    // El componente principal del dashboard (con la navegación)
    children: [
      // Rutas hijas que se cargarán dentro del <router-outlet> del dashboard
      { path: 'initial', component: InitialGradesComponent },
      { path: 'review', component: ReviewRequestsComponent },
      { path: 'final', component: FinalGradesComponent },
      { path: 'statistics', component: ViewGradesStatisticsComponent },
      
      // Redirige a la primera pestaña por defecto cuando se entra al dashboard
      { path: '', redirectTo: 'initial', pathMatch: 'full' }
    ]
  },

  {
    path: 'student/student-dashboard',
    component: StudentDashboardComponent,
    children: [
     // { path: 'view-grades', component: ViewGradesComponent },
      //{ path: 'request-review', component: RequestReviewComponent },
      //{ path: '', redirectTo: 'view-grades', pathMatch: 'full' }
    ]
  },

  {
    path: 'representative/representative-dashboard',
    component: RepresentativeDashboardComponent,
    children: [
     // { path: 'manage-users', component: ManageUsersComponent },
      //{ path: '', redirectTo: 'manage-users', pathMatch: 'full' }
    ]
  },

   // Redirige a /login si la ruta está vacía
   { path: '', redirectTo: '/login', pathMatch: 'full' },

   // Redirige a /login si la ruta no coincide con ninguna de las anteriores
   { path: '**', redirectTo: '/login' }
  
];