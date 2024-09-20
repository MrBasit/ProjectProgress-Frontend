import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

@Injectable({
  providedIn: 'root'
})
export class OtpGuard implements CanActivate {
  constructor(private authService: AuthGuardService, private router: Router) { }

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
