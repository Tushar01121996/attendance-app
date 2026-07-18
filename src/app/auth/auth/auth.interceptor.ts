import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, switchMap, filter, take, catchError, tap } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    console.log("🌐 Outgoing Request:", {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("🔑 Token attached to request");
    }

    return next.handle(authReq).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            console.log("✅ Response from:", authReq.url);
            console.log("📥 Status:", event.status);
            console.log("📥 Body:", event.body);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error("❌ Error from:", authReq.url);
          console.error("📥 Status:", error.status);
          console.error("📥 Message:", error.message);
          console.error("📥 Error Body:", error.error);

          if (error.status === 0) {
            console.error("🚨 Possible CORS or Network issue");
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(authReq, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return throwError(() => new Error('No refresh token'));

      return this.authService.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          localStorage.setItem('token', res.token);
          localStorage.setItem('refreshToken', res.refreshToken);

          this.refreshTokenSubject.next(res.token);
          const authReq = request.clone({
            setHeaders: { Authorization: `Bearer ${res.token}` }
          });
          return next.handle(authReq);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token) => {
          const authReq = request.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(authReq);
        })
      );
    }
  }
}
