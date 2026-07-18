import { Injectable } from '@angular/core';
import { Student, StudentView } from './model/student'; 
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError, of } from 'rxjs';
import { Class, Section } from './model/class';

@Injectable({
  providedIn: 'root'
})

export class StudentService {
  private apiUrl = environment.apiUrl + "/Student/"
  private apiMasterUrl = environment.apiUrl + "/ClassSection/"
  private apiholidayUrl = environment.apiUrl + "/Holiday/"
  constructor(private httpClient : HttpClient){}
  private students: Student[] = [];

  addStudent(student: FormData) : Observable<any> {
      console.log(this.apiUrl + "SaveUpdate");  
      return this.httpClient.post<any>(this.apiUrl + "SaveUpdate",student ).pipe(
        catchError((error)=> {
          debugger
          console.log(error.error?.error);
          return throwError(()=> new Error(error.error?.error || 'Error'))
        })
      )
    
  }
  saveAttendance(payload: {
  classId: number;
  sectionId: number;
  date: string;
  records: { studentId: number; status: number }[];
  }): Observable<any> {
      console.log(this.apiUrl + "SaveUpdate");  
      return this.httpClient.post<any>(this.apiUrl + "save-or-update-attendance", payload ).pipe(
        catchError((error)=> {
          debugger
          console.log(error.error?.error);
          return throwError(()=> new Error(error.error?.error || 'Error'))
        })
      )
  }
  getStudents(): Observable<StudentView[]> {
    return this.httpClient.get<StudentView[]>(this.apiUrl + "GetAllByClassId");
  }
  getStudentsbyDate(currDate : string): Observable<StudentView[]> {
    return this.httpClient.get<StudentView[]>(this.apiUrl + "GetAllByClassIdAndDate/" + currDate);
  }
  getClass():Observable<Class[]>{
    return this.httpClient.get<Class[]>(this.apiMasterUrl+"GetAllClass");
  }
  getSectionsByClassId(classId : number):Observable<Section[]>{
    return this.httpClient.get<Section[]>(this.apiMasterUrl+"GetAllByClassId/" + classId );
  }
  getHoliday(currDate : string):Observable<any>{
    return this.httpClient.get<any>(this.apiholidayUrl+"CheckHoliday/" + currDate );
  }
  getStudentById(id: number): Observable<StudentView> {
    return this.httpClient.get<StudentView>(this.apiUrl + "GetById/" + id);
  }
   getAttendanceHistory(studentId: number, take: number = 5): Observable<AttendanceHistoryDto[]> {
    return this.httpClient
      .get<AttendanceHistoryDto[]>(this.apiUrl + "GetAllStudentAttendance/" + studentId, {
        params: { take: take.toString() }
      })
      .pipe(
        catchError((error) => {
          console.log(error.error?.error);
          return throwError(() => new Error(error.error?.error || 'Error'));
        })
      );
  }
  /**
   * GET {apiUrl}/Student/GetStudentAttendance/{studentId}?month=7&year=2026
   * month & year are optional — omit both to get the current month (per backend default).
   */
  getStudentAttendanceByMonth(studentId: number, month?: number, year?: number): Observable<StudentAttendanceView[]> {
    let params: any = {};
    if (month != null) params.month = month.toString();
    if (year != null) params.year = year.toString();

    return this.httpClient
      .get<StudentAttendanceView[]>(this.apiUrl + "GetAllStudentAttendance/" + studentId, { params })
      .pipe(
        catchError((error) => {
          console.log(error.error?.error);
          return throwError(() => new Error(error.error?.error || 'Error'));
        })
      );
  }
}
export interface AttendanceHistoryDto {
  date: string;   // ISO date string, e.g. '2026-07-16'
  status: string; // 1 = Present, 0 = Absent, 2 = Leave
}
export interface StudentAttendanceView {
  studentId: number;
  name: string;
  date: string;   // ISO date string
  status: string; // 'Present' | 'Absent' | 'Not Marked'
}

