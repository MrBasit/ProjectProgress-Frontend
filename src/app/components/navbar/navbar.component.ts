import { Component, OnInit } from '@angular/core';
import { AddProjectComponent } from '../add-project/add-project.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from 'src/app/services/event.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { AuthGuardService } from './../../services/auth-guard.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username: string | null = '';
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
    private authService: AuthGuardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjectAccounts();
    this.loadStatuses();
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (userSession && userSession.expiration > new Date().getTime()) {
      this.username = userSession.username;
    } else {
      this.username = null;
    }
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

  loadStatuses() {
    this.projectService.getStatuses().subscribe({
      next: (response) => {
        this.statusOptions = response;
        this.selectedStatuses = this.statusOptions.map(status => status.name);
        this.allSelected = true; 
      },
      error: (error) => {
        console.error('Failed to load statuses', error);
        if (error) {
          this.snackBar.open('Server is not responding 😢.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      }
    });
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
    const dialogRef = this.dialog.open(AddProjectComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
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
    this.authService.logout();
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
