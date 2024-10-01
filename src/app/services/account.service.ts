import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private projectAccountsSubject = new BehaviorSubject<{ id: number, name: string }[]>([]);
  projectAccounts$ = this.projectAccountsSubject.asObservable();
  url = environment.url;

  constructor(private http: HttpClient) {}

  fetchProjectAccounts(userId: string): Observable<any> {
    const url = `${this.url}/api/Authentication/GetUserAccounts?UserId=${userId}`;
    return this.http.post(url, {}).pipe(
        tap((accounts: any[]) => {
            const projectAccounts = accounts.map(account => ({
                id: account.projectAccount.id,
                name: account.projectAccount.name
            }));
            this.projectAccountsSubject.next(projectAccounts);
        })
    );
}


  getProjectAccounts(): { id: number, name: string }[] {
    return this.projectAccountsSubject.value;
  }

  clearAccounts() {
    this.projectAccountsSubject.next([]);
  }
  setProjectAccounts(accounts: any[]) {
    const projectAccounts = accounts.map(account => ({
      id: account.projectAccount.id,
      name: account.projectAccount.name
    }));
    this.projectAccountsSubject.next(projectAccounts);
  }
}