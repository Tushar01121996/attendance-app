import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { StudentRegistrationComponent } from './students/student-registration/student-registration.component';
import { StudentListComponent } from './students/student-list/student-list.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { StudentAttendanceComponent } from './students/student-attendance/student-attendance.component';
import { ForgotpasswordComponent } from './auth/forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './auth/resetpassword/resetpassword.component';
import { NewdashboardComponent } from './newdashboard/newdashboard.component';
import { HolidaylistComponent } from './Holidays/holidaylist/holidaylist.component';
import { StudentProfileComponent } from './students/student-profile/student-profile.component';
import { StudentAttendanceHistoryComponent } from './students/student-attendance-history/student-attendance-history.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'newdashboard',
    component: NewdashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'forgotpassword',
    component: ForgotpasswordComponent
  },
   {
    path: 'resetpassword',
    component: ResetpasswordComponent
  },
  {
    path: 'students/register',
    component: StudentRegistrationComponent,
    canActivate: [authGuard]   // ✅ Protect students page
  },
  {
    path: 'students/list',
    component: StudentListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'students/attendance',
    component: StudentAttendanceComponent,
    canActivate: [authGuard]
  },
  {
    path: 'students/:id',
    component: StudentProfileComponent,
    canActivate: [authGuard]
  },
    {
    path: 'students/:id/attendance-history',
    component: StudentAttendanceHistoryComponent,
    canActivate: [authGuard]
  },
  {
    path: 'holidaylist',
    component: HolidaylistComponent,
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'login' }
];
