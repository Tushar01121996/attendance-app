import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AggregateStudentView, holiday, topPerformingStudents } from './model/AggregateStudentView';
@Injectable({
  providedIn: 'root'
})
export class DashboardServiceService {
  private isLoggedIn = false;
  private apiUrl = environment.apiUrl + "/Student/"
  private apiHolidayUrl = environment.apiUrl + "/Holiday/"
  constructor(private httpClient : HttpClient) { }

  getAttendanceSummary(currDate : string): Observable<AggregateStudentView[]> {
      return this.httpClient.get<AggregateStudentView[]>(this.apiUrl + "GetAggregateStudents/" + currDate);
  }
  getHolidayList(): Observable<holiday[]> {
      return this.httpClient.get<holiday[]>(this.apiHolidayUrl + "GetAllHoliday" );
  }
  getTopPerformingStudents(): Observable<topPerformingStudents[]> {
      return this.httpClient.get<topPerformingStudents[]>(this.apiUrl + "TopPerformingStudents" );
  }
}
