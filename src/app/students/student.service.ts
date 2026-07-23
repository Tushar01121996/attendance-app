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
    /**
   * GET {apiUrl}/Student/GetAttendanceInsight/{studentId}?presentCount=&absentCount=&totalSchoolDays=
   * Returns an AI-generated 1-2 sentence attendance summary (cached server-side,
   * regenerated once per day). The counts are computed on the frontend
   * (excluding Sundays/holidays) and passed through so the AI's narrative
   * always matches the numbers actually shown on screen, instead of the
   * backend recomputing its own — possibly different — version.
   * Never blocks the page — caller should treat a failure as "no insight available."
   */
  getAttendanceInsight(
    studentId: number,
    presentCount: number,
    absentCount: number,
    totalSchoolDays: number
  ): Observable<{ insight: string }> {
    const params = {
      presentCount: presentCount.toString(),
      absentCount: absentCount.toString(),
      totalSchoolDays: totalSchoolDays.toString()
    };
    return this.httpClient
      .get<{ insight: string }>(this.apiUrl + "GetAttendanceInsight/" + studentId, { params })
      .pipe(
        catchError((error) => {
          console.log(error.error?.error);
          return throwError(() => new Error(error.error?.error || 'Error'));
        })
      );
  }
   /**
   * GET {apiUrl}/Student/GetAbsenceStreaks
   * Returns the current consecutive-absence streak (Sundays/holidays excluded)
   * for every student in the logged-in teacher's homeroom class. Only
   * students with an active streak (> 0) are included.
   */
  getAbsenceStreaks(): Observable<AbsenceStreakDto[]> {
    return this.httpClient
      .get<AbsenceStreakDto[]>(this.apiUrl + "GetAbsenceStreaks")
      .pipe(
        catchError((error) => {
          console.log(error.error?.error);
          return throwError(() => new Error(error.error?.error || 'Error'));
        })
      );
  }

  /**
   * GET {apiUrl}/Student/GetAbsenceAlerts/{threshold}
   * School-wide list of students currently on a consecutive-absence streak
   * at or above the given threshold, sorted worst-first, capped at 10.
   */
  getAbsenceAlerts(threshold: number = 2): Observable<AbsenceAlertDto[]> {
    return this.httpClient
      .get<AbsenceAlertDto[]>(this.apiUrl + "GetAbsenceAlerts/" + threshold)
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

export interface AbsenceStreakDto {
  studentId: number;
  streakCount: number;
}

export interface AbsenceAlertDto {
  studentId: number;
  firstName: string;
  lastName: string;
  className: string;
  sectionName: string;
  photo: string;
  streakCount: number;
}

