import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component';

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
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { title: 'Dashboard' }
      },
      {
        path: 'newdashboard',
        loadComponent: () => import('./newdashboard/newdashboard.component').then(m => m.NewdashboardComponent),
        data: { title: 'Dashboard' }
      },
      {
        path: 'students/register',
        loadComponent: () => import('./students/student-registration/student-registration.component').then(m => m.StudentRegistrationComponent),
        data: { title: 'Register Student' }
      },
      {
        path: 'students/edit/:id',
        loadComponent: () => import('./students/student-registration/student-registration.component').then(m => m.StudentRegistrationComponent),
        data: { title: 'Edit Student' }
      },
      {
        path: 'students/list',
        loadComponent: () => import('./students/student-list/student-list.component').then(m => m.StudentListComponent),
        data: { title: 'Student List' }
      },
      {
        path: 'students/attendance',
        loadComponent: () => import('./students/student-attendance/student-attendance.component').then(m => m.StudentAttendanceComponent),
        data: { title: 'Mark Attendance' }
      },
      {
        path: 'students/:id/attendance-history',
        loadComponent: () => import('./students/student-attendance-history/student-attendance-history.component').then(m => m.StudentAttendanceHistoryComponent),
        data: { title: 'Attendance History' }
      },
      {
        path: 'students/:id',
        loadComponent: () => import('./students/student-profile/student-profile.component').then(m => m.StudentProfileComponent),
        data: { title: 'Student Profile' }
      },
      {
        path: 'holidaylist',
        loadComponent: () => import('./Holidays/holidaylist/holidaylist.component').then(m => m.HolidaylistComponent),
        data: { title: 'Holidays' }
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
