import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService,AttendanceHistoryDto } from '../student.service';
import { StudentView } from '../model/student';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../auth/auth.service';
import { DashboardServiceService } from '../../dashboard/dashboard-service.service';
import { holiday } from '../../dashboard/model/AggregateStudentView';

interface AttendanceEntry {
  date: Date;
  status: string;
}

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss'
})
export class StudentProfileComponent implements OnInit {
   environment = environment;
  student: StudentView | null = null;
  loading = true;

  recentAttendance: AttendanceEntry[] = [];
  totalAttendance: AttendanceEntry[] = [];
  attendanceLoading = true;

  aiInsight: string | null = null;
  aiInsightLoading = true;

  /** Active holiday dates (as 'yyyy-MM-dd' strings) — used to exclude
   *  holidays and Sundays from the attendance percentage denominator. */
  private holidayDateSet = new Set<string>();
  private holidaysLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private studentService: StudentService,
    private authService: AuthService,
    private dashboardService: DashboardServiceService
  ) {}

  ngOnInit(): void {
    // Fast path: if we navigated here from the Student List, the full
    // StudentView was passed via router state — no extra API call needed.
    const navState = this.router.getCurrentNavigation()?.extras.state
      ?? (history.state as { student?: StudentView } | undefined);

    if (navState?.student) {
      this.student = navState.student;
      this.loading = false;
      this.loadHolidaysThenAttendance(navState.student.id);
      return;
    }

    // Fallback: direct URL / page refresh — fetch by id.
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id === null) {
      this.loading = false;
      this.attendanceLoading = false;
      this.aiInsightLoading = false;
      return;
    }

    this.studentService.getStudentById(id).subscribe({
      next: (data) => {
        this.student = data;
        this.loading = false;
        this.loadHolidaysThenAttendance(id);
      },
      error: (err) => {
        console.error('Error loading student profile', err);
        this.loading = false;
        this.attendanceLoading = false;
        this.aiInsightLoading = false;
      }
    });
  }

  /** Loads the active holiday list first (needed to correctly compute the
   *  attendance percentage), then loads attendance data and the AI insight —
   *  both of which depend on knowing which dates are non-school days. */
  private loadHolidaysThenAttendance(studentId: number): void {
    this.dashboardService.getHolidayList().subscribe({
      next: (holidays: holiday[]) => {
        this.holidayDateSet = new Set(
          holidays
            .filter(h => h.isActive)
            .map(h => this.toDateKey(new Date(h.holidayDate)))
        );
        this.holidaysLoaded = true;
        this.loadAttendanceHistory(studentId);
      },
      error: (err) => {
        console.error('Error loading holidays', err);
        // Don't block attendance on a holiday-fetch failure — just proceed
        // without holiday exclusion (Sundays are still excluded either way).
        this.holidaysLoaded = true;
        this.loadAttendanceHistory(studentId);
      }
    });
  }

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10); // 'yyyy-MM-dd'
  }

  /** A day counts toward the attendance percentage only if it isn't a
   *  Sunday and isn't an active holiday. */
  private isSchoolDay(date: Date): boolean {
    if (date.getDay() === 0) return false; // Sunday
    if (this.holidayDateSet.has(this.toDateKey(date))) return false;
    return true;
  }

  private loadAttendanceHistory(studentId: number): void {
    this.attendanceLoading = true;
    this.studentService.getAttendanceHistory(studentId, 5).subscribe({
      next: (rows: AttendanceHistoryDto[]) => {
        this.totalAttendance = rows
          .map(row => ({
            date: new Date(row.date),
            status: row.status
          }));

          // newest first, then cap at 5 — guards against the backend
          // ignoring the `take` param and returning the full history
          this.recentAttendance = this.totalAttendance.sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);
        this.attendanceLoading = false;

        // Load the AI insight only once the real, holiday/Sunday-adjusted
        // counts are known, so the narrative can't disagree with the card.
        this.loadAiInsight(studentId);
      },
      error: (err) => {
        console.error('Error loading attendance history', err);
        this.recentAttendance = [];
        this.attendanceLoading = false;
        this.aiInsightLoading = false;
      }
    });
  }

  /** School days so far in the tracked range — excludes Sundays and active
   *  holidays. This is the correct denominator for attendance percentage. */
  get schoolDayEntries(): AttendanceEntry[] {
    return this.totalAttendance.filter(a => this.isSchoolDay(a.date));
  }

  get attendancePercentage(): number {
    const schoolDays = this.schoolDayEntries;
    if (!schoolDays.length) return 0;
    const present = schoolDays.filter(a => a.status === 'Present').length;
    return Math.round((present / schoolDays.length) * 100);
  }

  get presentCount(): number {
    return this.schoolDayEntries.filter(a => a.status === 'Present').length;
  }

  get absentCount(): number {
    return this.schoolDayEntries.filter(a => a.status === 'Absent').length;
  }

  /** AI-generated attendance summary — enhancement only, never blocks the page.
   *  Passes the already-computed, holiday/Sunday-adjusted counts so the
   *  backend narrative always matches what's shown on screen. */
  private loadAiInsight(studentId: number): void {
    this.aiInsightLoading = true;
    const schoolDays = this.schoolDayEntries.length;
    this.studentService.getAttendanceInsight(studentId, this.presentCount, this.absentCount, schoolDays).subscribe({
      next: (res) => {
        this.aiInsight = res.insight;
        this.aiInsightLoading = false;
      },
      error: () => {
        // Silent failure by design — the insight card just doesn't render.
        this.aiInsight = null;
        this.aiInsightLoading = false;
      }
    });
  }
   viewAllAttendance(): void {
    if (this.student) {
      this.router.navigate(['/students', this.student.id, 'attendance-history'], {
        state: { student: this.student }
      });
    }
  }

  relativeDayLabel(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  goBack(): void {
    this.location.back();
  }

  editStudent(): void {
    if (this.student) {
      this.router.navigate(['/students/edit', this.student.id], { state: { student: this.student } });
    }
  }

  markAttendance(): void {
    this.router.navigate(['/students/attendance']);
  }

  gotoDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
