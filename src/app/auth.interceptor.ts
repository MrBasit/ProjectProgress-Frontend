import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.token && user.validity) {
      const currentTime = new Date().getTime();
      const validityTime = new Date(user.validity).getTime();

      if (validityTime <= currentTime) {
        localStorage.clear(); 
        this.router.navigate(['/login']);
        return throwError({
          error: {
            message: 'Session expired, please log in again'
          },
          timestamp: new Date().toISOString()
        });
      }
    }

    return next.handle(req)
  }
}
