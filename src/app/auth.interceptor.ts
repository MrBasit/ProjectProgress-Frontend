import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AccountService } from './services/account.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private accountService: AccountService, private jwtHelper: JwtHelperService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.token) {
      const isTokenExpired = this.jwtHelper.isTokenExpired(user.token);
      
      if (isTokenExpired) {
        localStorage.clear();
        this.accountService.clearAccounts();
        this.router.navigate(['/login']);
        return throwError({
          error: {
            message: 'Session expired, please log in again'
          },
          timestamp: new Date().toISOString()
        });
      }
    }

    return next.handle(req);
  }
}
