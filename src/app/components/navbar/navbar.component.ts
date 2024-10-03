import { Component, OnInit } from '@angular/core';
import { AddProjectComponent } from '../add-project/add-project.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from 'src/app/services/event.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { AuthGuardService } from './../../services/auth-guard.service';
import { SignOutComponent } from '../sign-out/sign-out.component';
import { ProjectAccountTemplatesComponent } from './../project-account-templates/project-account-templates.component';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  searchTerm: string = ''; 
  selectedSortOption: string = ''; 
  statusOptions: { id: number, name: string }[] = [];
  selectedStatuses: string[] = [];
  allSelected = false;
  statusesArray: Array<{ id: number, name: string }> = [];
  projectAccounts: { id: number, name: string }[] = [];
  firstProjectAccount: { id: number, name: string } | null = null;
  remainingProjectAccounts: { id: number, name: string }[] = [];

  constructor(
    private dialog: MatDialog,
    private eventService: EventService,
    private projectService: ProjectsService,
    private accountService: AccountService,
    private errorHandler: ErrorHandlerService,
    private sucessHandler: SuccessHandlerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // this.loadProjectAccounts();
    this.loadStatuses();
    this.selectedSortOption = '2';
    this.accountService.projectAccounts$.subscribe((account : any) => {
      this.projectAccounts = account
      if (this.projectAccounts.length > 0) {
        this.firstProjectAccount = this.projectAccounts[0];
        this.remainingProjectAccounts = this.projectAccounts.slice(1);
        this.eventService.updateFirstProjectAccount(this.firstProjectAccount);
      }
    })
  }

  // loadProjectAccounts() {
  //   const projectAccounts: { id: number, name: string }[] = [];
  //   for (let i = 0; i < localStorage.length; i++) {
  //     const key = localStorage.key(i);
  //     if (key && key.startsWith('projectAccount_')) {
  //       const accountData = localStorage.getItem(key);
  //       if (accountData) {
  //         const account = JSON.parse(accountData);
  //         projectAccounts.push(account);
  //       }
  //     }
  //   }
  //   this.projectAccounts = projectAccounts;
  //   if (this.projectAccounts.length > 0) {
  //     this.firstProjectAccount = this.projectAccounts[0];
  //     this.remainingProjectAccounts = this.projectAccounts.slice(1);
  //     this.eventService.updateFirstProjectAccount(this.firstProjectAccount);
  //   }
  // }

  onReset() {
    this.searchTerm = ''; 
    this.eventService.PublishSearchTermChanged(this.searchTerm);

    this.selectedSortOption = '2'; 
    this.eventService.PublishSortChanged(2); 

    const activeStatus = this.statusOptions.find(status => status.name === 'Active');
    this.selectedStatuses = [activeStatus.name];
    this.allSelected = false
    this.onDropdownClosed(); 
  }
  

  loadStatuses() {
    this.projectService.getStatuses().subscribe(
      (response) => {
        this.statusOptions = response;
        const activeStatus = this.statusOptions.find(status => status.name === 'Active');
        this.selectedStatuses = [activeStatus.name];
        // this.allSelected = true; 
      },
      (error) => {
        console.error('Failed to load statuses', error);
        this.errorHandler.handleError(error)
      }
    );
  }

  onSelectionChange(e: Event) {
    if (
      this.selectedStatuses.includes('All') ||
      this.selectedStatuses.length === this.statusOptions.length
    ) {
      if (this.allSelected) {
        this.selectedStatuses = [];
        this.allSelected = false;
      } else {
        this.selectedStatuses = [
          ...this.statusOptions.map(status => status.name),
        ];
        this.allSelected = true;
      }
    } else {
      this.allSelected = false;

      if (this.selectedStatuses.length === this.statusOptions.length) {
        this.allSelected = true;
      }
    }
  }

  onDropdownClosed() {
    this.statusesArray = this.statusOptions.filter(option =>
      this.selectedStatuses.includes(option.name)
    );
    this.eventService.publishStatusChange(this.statusesArray);
  }

  getSelectedStatusesDisplay(): string {
    if (this.allSelected) {
      return 'All';
    }
    return this.selectedStatuses.length > 0
      ? this.selectedStatuses.join(', ')
      : 'None';
  }

  onSortChange(sortOption: string) {
    const numericSortOption = Number(sortOption);
    this.eventService.PublishSortChanged(numericSortOption);
  }

  openAddProjectDialog() {
    const dialogRef = this.dialog.open(AddProjectComponent, {
      maxHeight: "90vh",
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.eventService.PublishOnAddProject(true);
      }
    });
  }

  onRefresh() {
    this.eventService.PublishOnRefresh(true);
  }

  onSearchTermChange(e: any) {
    const target = e.target as HTMLInputElement;
    this.eventService.PublishSearchTermChanged(target.value);
  }

  signOut() {
    const dialogRef = this.dialog.open(SignOutComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.sucessHandler.handleSuccess("Logged out successfully. We hope to see you again soon! 😊.")
      }
    });
  }

  updateSelectedProjectAccount(account: { id: number, name: string }) {
    this.remainingProjectAccounts.push(
      this.firstProjectAccount as { id: number, name: string }
    );
    this.firstProjectAccount = account;
    this.remainingProjectAccounts = this.remainingProjectAccounts.filter(
      acc => acc.id !== account.id
    );
    this.eventService.updateFirstProjectAccount(account);
    // this.eventService.PublishProjectAccount(account);
  }

  openTemplateDialog(){
    this.dialog.open(ProjectAccountTemplatesComponent, {
      width: '800px',
      maxHeight: '530px'
    });
  }
}
