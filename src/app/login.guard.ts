import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private authService: AuthGuardService, private router: Router){}
  
  canActivate():boolean {
    const user = JSON.parse(localStorage.getItem('user'))
    const userEmail = localStorage.getItem('userEmail')
    if(user && userEmail){
      this.router.navigate(['/home'])
      return false
    }
    else if(userEmail){
      this.router.navigate(['/otp'])
      return false
    }
    else{
      return true;
    }
  }
  
}
