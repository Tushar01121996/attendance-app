import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { StudentService } from '../student.service';
import { StudentView } from '../model/student';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-student-list',
   imports: [
    CommonModule
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent {
  //displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phone', 'gender', 'className'];
  displayedColumns: string[] = ['avatar', 'name', 'gender', 'class'];
  dataSource = new MatTableDataSource<StudentView>();

  constructor(private studentService: StudentService, private location : Location, private router:Router,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
   // this.dataSource.data = this.studentService.getStudents();
   this.studentService.getStudents().subscribe((students : StudentView[]) => {
      this.dataSource.data =students;
   });
  }
  environment = environment;
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  goBack():void{
    this.location.back();
  }
  addNewStudent():void{
    this.router.navigate(['/students/register']);
  }
  markAttendance():void{
     this.router.navigate(['/students/attendance']);
  }
  viewProfile(student: StudentView): void {
    this.router.navigate(['/students', student.id], { state: { student } });
  }
  gotoDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
