import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthGuardService, private router: Router) { }

  canActivate(): boolean {
    if (this.authService.isOtpConfirmed()) {
      return true;
    }
    else if(this.authService.isLoggedIn()){
      this.router.navigate(['/otp']);
      return false;
    }
    else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
