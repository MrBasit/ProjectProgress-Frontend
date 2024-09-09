import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  noProjects: boolean = false;

  ngOnInit(): void {
    this.checkForProjects();
  }

  checkForProjects(): void {
    const keys = Object.keys(localStorage);
    const projectAccountKeys = keys.filter(key => key.startsWith('projectAccount_'));

    if (projectAccountKeys.length > 0) {
      this.noProjects = false; 
    } else {
      this.noProjects = true;
    }
  }
}
