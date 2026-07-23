
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';
import { DashboardServiceService } from '../dashboard-service.service';
import { topPerformingStudents } from '../model/AggregateStudentView';
import { StudentService, AbsenceAlertDto } from '../../students/student.service';
import { environment } from '../../../environment/environment';


@Component({
  selector: 'app-dashboard',
  standalone: true,
imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  teacherName = localStorage.getItem('displayName')?.split(' ')[0];
  today = new Date();
  dataSource = new MatTableDataSource<topPerformingStudents>();
  constructor (private dashboardService : DashboardServiceService, private studentService: StudentService, private router: Router){}
  environment = environment;
  absenceAlerts: AbsenceAlertDto[] = [];
  absenceAlertsLoading = true;
  // summary metrics (replace with real data later)
  attendanceSummary = [
    { key: 'TotalStudents', label: 'Total Students', value: 0, color: '#4E8FE0' },
    { key: 'Present', label: 'Present', value: 0, color: '#2FA97A' },
    { key: 'Absent', label: 'Absent', value: 0, color: '#E1615D' }
  ];
  ngOnInit(): void {
    const currDate = new Date()?.toLocaleDateString('en-CA') ?? new Date().toLocaleDateString('en-CA');
    this.dashboardService.getAttendanceSummary(currDate).subscribe({
    next: (res: any) => {
      // replace only the values in attendanceSummary
      this.attendanceSummary = this.attendanceSummary.map(item => {
        if (item.key === 'TotalStudents') item.value = res.totalStudents;
        if (item.key === 'Present') item.value = res.presentStudents;
        if (item.key === 'Absent') item.value = res.absentStudents;
        return item;
      });
    },
    error: (err) => console.error(err)
  });
   this.dashboardService.getTopPerformingStudents().subscribe((topPerformingStudents : topPerformingStudents[]) => {
        this.dataSource.data = topPerformingStudents;
     });

   this.studentService.getAbsenceAlerts(1).subscribe({
     next: (alerts) => {
       this.absenceAlerts = alerts;
       this.absenceAlertsLoading = false;
     },
     error: (err) => {
       console.error('Error loading absence alerts', err);
       this.absenceAlertsLoading = false;
     }
   });
  }

  // recent requests (demo)
  requests = [
    { id: 'r1', name: 'Shuri', date: '12 Jul - 13 Jul 2025', status: 'Pending', avatar: 'https://i.pravatar.cc/48?img=47' },
    { id: 'r2', name: 'Rahul', date: '10 Jul - 10 Jul 2025', status: 'Approved', avatar: 'https://i.pravatar.cc/48?img=12' }
  ];

  private summaryValue(key: string): number {
    return this.attendanceSummary.find(item => item.key === key)?.value ?? 0;
  }

  get totalStudents(): number {
    return this.summaryValue('TotalStudents');
  }

  get presentStudents(): number {
    return this.summaryValue('Present');
  }

  get absentStudents(): number {
    return this.summaryValue('Absent');
  }

  get attendancePercentage(): number {
    const total = this.totalStudents;
    if (!total) return 0;
    return Math.round((this.presentStudents / total) * 100);
  }

  /** Ring gauge dash-offset for an SVG circle of r=42 (circumference ≈ 263.9) */
  get ringDashOffset(): number {
    const circumference = 263.9;
    return circumference * (1 - this.attendancePercentage / 100);
  }

  get weekDays(): { label: string; date: number; isToday: boolean }[] {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = this.today;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        label: labels[i],
        date: d.getDate(),
        isToday: d.toDateString() === now.toDateString()
      };
    });
  }

  viewAlertProfile(alert: AbsenceAlertDto): void {
    this.router.navigate(['/students', alert.studentId]);
  } 
}
