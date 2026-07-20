import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgotpassword',
    loadComponent: () => import('./auth/forgotpassword/forgotpassword.component').then(m => m.ForgotpasswordComponent)
  },
  {
    path: 'resetpassword',
    loadComponent: () => import('./auth/resetpassword/resetpassword.component').then(m => m.ResetpasswordComponent)
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'newdashboard',
    loadComponent: () => import('./newdashboard/newdashboard.component').then(m => m.NewdashboardComponent),
    canActivate: [authGuard]
  },

  {
    path: 'students/register',
    loadComponent: () => import('./students/student-registration/student-registration.component').then(m => m.StudentRegistrationComponent),
    canActivate: [authGuard]
  },
  {
    path: 'students/list',
    loadComponent: () => import('./students/student-list/student-list.component').then(m => m.StudentListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'students/attendance',
    loadComponent: () => import('./students/student-attendance/student-attendance.component').then(m => m.StudentAttendanceComponent),
    canActivate: [authGuard]
  },
  {
    path: 'students/:id',
    loadComponent: () => import('./students/student-profile/student-profile.component').then(m => m.StudentProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'students/:id/attendance-history',
    loadComponent: () => import('./students/student-attendance-history/student-attendance-history.component').then(m => m.StudentAttendanceHistoryComponent),
    canActivate: [authGuard]
  },

  {
    path: 'holidaylist',
    loadComponent: () => import('./Holidays/holidaylist/holidaylist.component').then(m => m.HolidaylistComponent),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'login' }
];