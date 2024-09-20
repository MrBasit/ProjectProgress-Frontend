import { Component, OnInit } from '@angular/core';
import { AddProjectComponent } from '../add-project/add-project.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from 'src/app/services/event.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { AuthGuardService } from './../../services/auth-guard.service';
import { SignOutComponent } from '../sign-out/sign-out.component';

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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjectAccounts();
    this.loadStatuses();
  }

  loadProjectAccounts() {
    const projectAccounts: { id: number, name: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('projectAccount_')) {
        const accountData = localStorage.getItem(key);
        if (accountData) {
          const account = JSON.parse(accountData);
          projectAccounts.push(account);
        }
      }
    }

    this.projectAccounts = projectAccounts;
    if (this.projectAccounts.length > 0) {
      this.firstProjectAccount = this.projectAccounts[0];
      this.remainingProjectAccounts = this.projectAccounts.slice(1);
      this.eventService.updateFirstProjectAccount(this.firstProjectAccount);
    }
  }

  onReset() {
    this.searchTerm = ''; 
    this.eventService.PublishSearchTermChanged(this.searchTerm);

    this.selectedSortOption = ''; 
    this.eventService.PublishSortChanged(0); 

    this.selectedStatuses = this.statusOptions.map(status => status.name);
    this.allSelected = true;
    this.onDropdownClosed(); 
  }
  

  loadStatuses() {
    this.projectService.getStatuses().subscribe(
      (response) => {
        this.statusOptions = response;
        this.selectedStatuses = this.statusOptions.map(status => status.name);
        this.allSelected = true; 
      },
      (error) => {
        console.error('Failed to load statuses', error);
        if (error.status == 400 || error.status == 500 || error.status == 0) {
          this.snackBar.open('Server is not responding 😢.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
          this.snackBar.open(error.error.message + ' 😢.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
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
        this.snackBar.open('Logged out successfully. We hope to see you again soon! 😊.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
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
}
