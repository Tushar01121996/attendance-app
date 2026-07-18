import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { StudentService } from '../student.service';
import { StudentView } from '../model/student';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  templateUrl: './student-attendance.component.html',
  styleUrls: ['./student-attendance.component.scss']
})
export class StudentAttendanceComponent implements OnInit {
  dataSource = new MatTableDataSource<StudentView>();
  environment = environment;
  attendanceDate: Date = new Date();
  maxDate: Date;
  isHoliday : boolean = false;
  message : string = "";

  constructor(private studentService: StudentService, private location: Location, private router: Router,
    private snack : MatSnackBar, private authService : AuthService
  ) {
    this.maxDate = new Date();
  }

  ngOnInit(): void {
      this.loadStudents(this.attendanceDate);
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.value ? new Date(input.value) : this.attendanceDate;
    this.attendanceDate = selected;
    this.loadStudents(selected);
  }

  loadStudents(date?: Date) {
  const currDate = date?.toLocaleDateString('en-CA') ?? new Date().toLocaleDateString('en-CA');
  this.studentService.getHoliday(currDate).subscribe({
        next : (response) =>{
          if(response.isHoliday == true){
              this.isHoliday = true;
              this.message = response.message
          }
          else{
             this.isHoliday = false;
          }
        
        },
        error:(error)=>{
          
        }
      })


  this.studentService.getStudentsbyDate(currDate).subscribe((students: StudentView[]) => {
    this.dataSource.data = students;
  });

  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  goBack(): void {
    this.location.back();
  }

  addNewStudent(): void {
    this.router.navigate(['/students/register']);
  }
  gotoDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  

  setAllStatus(isPresent: boolean): void {
    this.dataSource.data.forEach(student => (student.attendanceStatus = isPresent));
  }

  getPresentCount(): number {
    return this.dataSource.data.filter(s => s.attendanceStatus).length;
  }

  getAbsentCount(): number {
    return this.dataSource.data.filter(s => !s.attendanceStatus).length;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  submitAttendance(): void {
    const payload = {
      classId: 0,
      sectionId : 0,
      date: this.attendanceDate.toLocaleDateString('en-CA').split('T')[0],
      records: this.dataSource.data.map(student => ({
        studentId: student.id,
        status: student.attendanceStatus ? 1 : 0
      }))
    };
    console.log(payload);
    this.studentService.saveAttendance(payload).subscribe({
    next: (response) => {
      console.log("✅ API Response:", response);
      this.snack.open(response.message, 'OK', { duration: 1400 });
    },
    error: (error) => {
      console.error("❌ API Error:", error);
      this.snack.open(error.error?.message || 'Something went wrong!', 'OK', { duration: 2000 });
    }
      // this.snack.open('Attendance saved successfully!', 'OK', { duration: 1400 });
    });
  }
}