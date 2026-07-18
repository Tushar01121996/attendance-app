import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService, StudentAttendanceView } from '../student.service';
import { StudentView } from '../model/student';
import { AuthService } from '../../auth/auth.service';

interface DayRow {
  date: Date;
  status: 'Present' | 'Absent' | 'Not Marked';
}

@Component({
  selector: 'app-student-attendance-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-attendance-history.component.html',
  styleUrl: './student-attendance-history.component.scss'
})
export class StudentAttendanceHistoryComponent implements OnInit {
  studentId!: number;
  studentName = '';

  loading = true;
  rows: DayRow[] = [];

  // Currently viewed month/year. Defaults to the current month, matching
  // the backend's default behavior when month/year are omitted.
  viewMonth = new Date().getMonth() + 1; // 1-12
  viewYear = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.studentId = idParam ? Number(idParam) : 0;

    const navState = history.state as { student?: StudentView } | undefined;
    if (navState?.student) {
      this.studentName = `${navState.student.firstName} ${navState.student.lastName}`;
    }

    this.loadMonth();
  }

  private loadMonth(): void {
    this.loading = true;
    // Only pass month/year when the user has navigated away from the
    // current month — omitting both lets the backend apply its own
    // "current month" default, per the API contract.
    const isCurrentMonth =
      this.viewMonth === new Date().getMonth() + 1 && this.viewYear === new Date().getFullYear();

    const month$ = isCurrentMonth
      ? this.studentService.getStudentAttendanceByMonth(this.studentId)
      : this.studentService.getStudentAttendanceByMonth(this.studentId, this.viewMonth, this.viewYear);

    month$.subscribe({
      next: (data: StudentAttendanceView[]) => {
        this.rows = data
          .map(d => ({
            date: new Date(d.date),
            status: d.status as DayRow['status']
          }))
          .sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading month attendance', err);
        this.rows = [];
        this.loading = false;
      }
    });
  }

  get monthLabel(): string {
    return new Date(this.viewYear, this.viewMonth - 1, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  get isCurrentMonth(): boolean {
    return this.viewMonth === new Date().getMonth() + 1 && this.viewYear === new Date().getFullYear();
  }

  prevMonth(): void {
    this.viewMonth--;
    if (this.viewMonth < 1) {
      this.viewMonth = 12;
      this.viewYear--;
    }
    this.loadMonth();
  }

  nextMonth(): void {
    // Don't allow navigating into the future beyond the current month
    if (this.isCurrentMonth) return;
    this.viewMonth++;
    if (this.viewMonth > 12) {
      this.viewMonth = 1;
      this.viewYear++;
    }
    this.loadMonth();
  }

  get presentCount(): number {
    return this.rows.filter(r => r.status === 'Present').length;
  }

  get absentCount(): number {
    return this.rows.filter(r => r.status === 'Absent').length;
  }

  get notMarkedCount(): number {
    return this.rows.filter(r => r.status === 'Not Marked').length;
  }

  get attendancePercentage(): number {
    const marked = this.presentCount + this.absentCount;
    if (!marked) return 0;
    return Math.round((this.presentCount / marked) * 100);
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  goBack(): void {
    this.location.back();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
