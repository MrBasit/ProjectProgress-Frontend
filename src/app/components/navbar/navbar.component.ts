import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AddProjectComponent } from '../add-project/add-project.component';
import { MatDialog } from '@angular/material/dialog';
import { EventService } from 'src/app/services/event.service';
import { Subscription } from 'rxjs';
import { ProjectsService } from 'src/app/services/projects.service';

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

  private dialogSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog, private eventService: EventService, private projectService: ProjectsService) {}

  ngOnInit(): void {
    this.loadStatuses();
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (userSession && userSession.expiration > new Date().getTime()) {
      this.username = userSession.username;
    } else {
      this.username = null; 
    }
  }

  loadStatuses() {
    this.projectService.getStatuses().subscribe({
      next: (response) => {
        this.statusOptions = response; 
      },
      error: (error) => {
        console.error('Failed to load statuses', error);
      }
    });
  }

  onSelectionChange() {
    if (this.selectedStatuses.includes('all')) {
      this.selectedStatuses = this.statusOptions.map(status => status.name).concat('all');
      this.allSelected = true;
    } else {
      this.allSelected = this.selectedStatuses.length === this.statusOptions.length;
      this.selectedStatuses = this.selectedStatuses.filter(status => status !== 'all');
    }
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
    this.dialogSubscription = dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result === 'confirm') {
        this.eventService.PublishOnAddProject(true)
      }
    });
  }

  onRefresh() {
    this.eventService.PublishOnRefresh(true)
  }

  onSearchTermChange(e: any) {
    const target = e.target as HTMLInputElement;
    this.eventService.PublishSearchTermChanged(target.value);
  }

  signOut() {
    localStorage.removeItem('userSession');
    window.location.reload();
  }

  ngOnDestroy(): void {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }
}
