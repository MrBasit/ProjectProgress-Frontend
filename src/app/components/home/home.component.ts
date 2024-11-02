import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  noProjects: boolean = false;
  loading = true;

  constructor(private accountService: AccountService){

  }

  ngOnInit(): void {
    this.checkForProjects();
  }

  checkForProjects(): void {
    this.accountService.fetchProjectAccounts().subscribe(
      (response) => {
        setTimeout(() => {
          this.loading= false
        }, 2000);
        if(response.length > 0){
          this.noProjects = false
        }
        else{
         this.noProjects = true;
        }
      },
      (error) => {
        setTimeout(() => {
          this.loading= false
        }, 2000);
        console.error('Error fetching project accounts:', error);
      }
    )
    // const keys = Object.keys(localStorage);
    // const projectAccountKeys = keys.filter(key => key.startsWith('projectAccount_'));

    // if (projectAccountKeys.length > 0) {
    //   this.noProjects = false; 
    // } else {
    //   this.noProjects = true;
    // }
  }
}
