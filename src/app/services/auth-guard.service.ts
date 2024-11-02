import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { concatMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  private url = environment.url;

  constructor(private http: HttpClient, private router: Router, private accountService: AccountService) { }

  isOtpConfirmed(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.token && user.validity) {
      const currentTime = new Date().getTime();
      const validityTime = new Date(user.validity).getTime();
      
      if (validityTime > currentTime) {
        return true;
      } else {
        this.logout(); 
      }
    }
    return false; 
  }

  isLoggedIn(): boolean{
    const userEmail = localStorage.getItem('userEmail');
    
    if (userEmail){
      return true;
    } 
    else{
      this.logout()    
    }
    return false;
  }

  otpConfirmation(credentials: any){
    const params = new HttpParams()
    .set('Username', credentials.email)
    .set('OTP', credentials.otp)
    .set("rememberMe",credentials.rememberMe)

    return this.http.post(`${this.url}/api/Authentication/UserLogin2FA`, {}, {params}).pipe(
      tap((response: any) => {
        const userData = {
          token: response.token,
          userId: response.userId,
          validity: response.validity
        };
        localStorage.setItem('user', JSON.stringify(userData));
      })
    );
  }
  resendOtp(username) {
    return this.http.post(`${this.url}/api/Authentication/ResendOTP`, {username}, {
        headers: { 'Content-Type': 'application/json' }
    });
  }
  forgetPassword(email){
    return this.http.post(`${this.url}/api/Authentication/ForgetPassword`, { email: email })
  }
  resetPassword(resetData){
    return this.http.post(`${this.url}/api/Authentication/ResetPassword`, resetData)
  }
  login(credentials: any) {
    const body = {
      username: credentials.username,
      password: credentials.password
    };
  
    return this.http.post(`${this.url}/api/Authentication/UserLogin`, body).pipe(
      tap((response: any) => {
        const userData = {
          token: response.token,
          userId: response.userId,
          validity: response.validity
        };
        localStorage.setItem('user', JSON.stringify(userData));
      })
    );
  }
  

  register(credentials: any){
    const params = new HttpParams().set('Role', 'Admin');
    const body ={
      username: credentials.username,
      email: credentials.email,
      password: credentials.password
    }
    return this.http.post(`${this.url}/api/Authentication/RegisterUser`, body, {params});
  }

  getUserAccounts(userId: string) {
    const params = new HttpParams().set('UserId', userId);
    return this.http.post(`${this.url}/api/Authentication/GetUserAccounts`, {}, { params });
  }
  
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('selectedProject');
    this.accountService.clearAccounts()
    this.router.navigate(['/login']); 
  }
}
