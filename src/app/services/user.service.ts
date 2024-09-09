import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url = environment.url;

  constructor(private http: HttpClient) { }

  getUserByUsername(username: string) {
    return this.http.get(`${this.url}/api/Accounts`, {
      params: { Name: username }
    });
  }
  loginUser(credendials: any){
    const body = {
      username: credendials.username,
      password: credendials.password
    }
    return this.http.post(`${this.url}/api/Authentication/UserLogin`, body);
  }

}
