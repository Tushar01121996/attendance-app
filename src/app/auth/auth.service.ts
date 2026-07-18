import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, throwError, tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;
  private apiUrl = environment.apiUrl + "/UserAuth"
  private EmailapiUrl = environment.apiUrl + "/Email"
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private httpClient : HttpClient){}

  login(credentials : {email : string, password : string}): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    
    return this.httpClient.post<any>(`${this.apiUrl}/login`,credentials,{headers} ).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('displayName', res.data);
      }),
      catchError((error)=> {
        console.log(error.error?.error);
        return throwError(()=> new Error(error.error?.error || 'Login Failed'))
      })
    );
  }
   refreshToken(): Observable<any> {
    const accessToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return throwError(() => 'No refresh token available');
    return this.httpClient.post(`${this.apiUrl}/refresh`, { accessToken, refreshToken }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('displayName', res.data);
        this.refreshTokenSubject.next(res.token);
      })
    );
  }
  SendOtpMail(data : {toEmail : string}): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    
    return this.httpClient.post<any>(`${this.EmailapiUrl}/forgotPasswordSend`,data,{headers} ).pipe(
      tap((res: any) => {
        console.log(res);
      }),
      catchError((error)=> {
        console.log(error.error?.error);
        return throwError(()=> new Error(error.error?.error || 'Login Failed'))
      })
    );
  }
  verifyOtp(data : {toEmail : string, otp : string}): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    
    return this.httpClient.post<any>(`${this.EmailapiUrl}/verifyOtp`,data,{headers} ).pipe(
      tap((res: any) => {
        console.log(res);
      }),
      catchError((error)=> {
         console.error('OTP verification error:', error);
          return throwError(() => error);
      })
    );
  }
  updatePassword(data : {userName : string, password : string, confirmPassword:string}): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    
    return this.httpClient.post<any>(`${this.apiUrl}/updatepassword`,data,{headers} ).pipe(
      tap((res: any) => {
        console.log(res);
      }),
      catchError((error)=> {
         console.error('OTP verification error:', error);
          return throwError(() => error);
      })
    );
  }

  logout() {
    this.isLoggedIn = false;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('displayName');

  }

  isAuthenticated(): boolean {
    var token =  localStorage.getItem('token');
    return (token != '' && token != null) ? true : false;
  }
}
