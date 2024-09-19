import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { concatMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  private url = environment.url;

  constructor(private http: HttpClient, private router: Router) { }

  isLoggedIn(): boolean {
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

  otpConfirmation(credentials: any){
    const params = new HttpParams()
    .set('Username', credentials.email)
    .set('OTP', credentials.otp);

    return this.http.post(`${this.url}/api/Authentication/UserLogin2FA`, {}, {params}).pipe(
      concatMap((response: any) => {
        const userData = {
          token: response.token,
          userId: response.userId,
          validity: response.validity
        };

        localStorage.setItem('user', JSON.stringify(userData));
        return this.getUserAccounts(userData.userId);
      }),
      tap((response: any) => {
        const accounts = response;
        accounts.forEach((account: any) => {
          const key = `projectAccount_${account.projectAccount.id}`;
          localStorage.setItem(key, JSON.stringify({
            id: account.projectAccount.id,
            name: account.projectAccount.name
          }));
        });
      })
    );
  }

  login(credentials: any) {
    const body = {
      username: credentials.username,
      password: credentials.password
    };

    return this.http.post(`${this.url}/api/Authentication/UserLogin`, body)
    // .pipe(
    //   concatMap((response: any) => {
    //     const userData = {
    //       token: response.token,
    //       userId: response.userId,
    //       validity: response.validity
    //     };

    //     localStorage.setItem('user', JSON.stringify(userData));
    //     return this.getUserAccounts(userData.userId);
    //   }),
    //   tap((response: any) => {
    //     const accounts = response;
    //     accounts.forEach((account: any) => {
    //       const key = `projectAccount_${account.projectAccount.id}`;
    //       localStorage.setItem(key, JSON.stringify({
    //         id: account.projectAccount.id,
    //         name: account.projectAccount.name
    //       }));
    //     });
    //   })
    // );
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
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('projectAccount_')) {
        localStorage.removeItem(key);
      }
    });
    this.router.navigate(['/login']); 
  }
}
