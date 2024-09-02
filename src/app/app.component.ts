import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showHome: boolean = false;
  showSignIn: boolean = false;

  ngOnInit() {
    const userSession = localStorage.getItem('userSession');

    if (userSession) {
      const sessionData = JSON.parse(userSession);
      const now = new Date().getTime();

      if (sessionData.expiration > now) {
        this.showHome = true;
      } else {
        localStorage.removeItem('userSession');
        this.showSignIn = true;
      }
    } else {
      this.showSignIn = true;
    }
  }
}
