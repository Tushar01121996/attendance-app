import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService,AttendanceHistoryDto } from '../student.service';
import { StudentView } from '../model/student';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../auth/auth.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Fast path: if we navigated here from the Student List, the full
    // StudentView was passed via router state — no extra API call needed.
    const navState = this.router.getCurrentNavigation()?.extras.state
      ?? (history.state as { student?: StudentView } | undefined);

    if (navState?.student) {
      this.student = navState.student;
      this.loading = false;
      this.loadAttendanceHistory(navState.student.id);
      return;
    }

    // Fallback: direct URL / page refresh — fetch by id.
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id === null) {
      this.loading = false;
      this.attendanceLoading = false;
      return;
    }

    this.studentService.getStudentById(id).subscribe({
      next: (data) => {
        this.student = data;
        this.loading = false;
        this.loadAttendanceHistory(id);
      },
      error: (err) => {
        console.error('Error loading student profile', err);
        this.loading = false;
        this.attendanceLoading = false;
      }
    });
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
      },
      error: (err) => {
        console.error('Error loading attendance history', err);
        this.recentAttendance = [];
        this.attendanceLoading = false;
      }
    });
  }

  get attendancePercentage(): number {
    if (!this.totalAttendance.length) return 0;
    const presentCount = this.totalAttendance.filter(a => a.status === 'Present').length;
    return Math.round((presentCount / this.totalAttendance.length) * 100);
  }

  get presentCount(): number {
    return this.totalAttendance.filter(a => a.status === 'Present').length;
  }

  get absentCount(): number {
    return this.totalAttendance.filter(a => a.status === 'Absent').length;
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
      this.router.navigate(['/students/register'], { state: { student: this.student } });
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
