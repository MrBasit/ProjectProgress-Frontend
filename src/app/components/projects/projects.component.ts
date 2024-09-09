import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { EventService } from 'src/app/services/event.service';
import { Subscription } from 'rxjs';
import { DeleteProjectComponent } from '../delete-project/delete-project.component';
import { AddProjectComponent } from '../add-project/add-project.component';

@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  sortValue = 0;
  searchTerm: string = "";
  projects: any[] = [];
  selectedProject: any = null;
  loadingProjects: boolean = false;
  noProjects: boolean = false;
  account: any;
  statuses = [
    { id: 1, name: "Active" },
    { id: 2, name: "Hold" },
    { id: 3, name: "Pause" },
    { id: 4, name: "Completed" },
    { id: 5, name: "Cancelled" },
    { id: 6, name: "Deleted" }
  ];
  statusesArray: Array<{ id: number, name: string }> = this.statuses;

  totalProjects: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private projectsSubscription: Subscription | undefined;
  private subscriptions: Subscription[] = [];

  constructor(private projectsService: ProjectsService, private dialog: MatDialog, private eventService: EventService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const firstProjectAccount$ = this.eventService.firstProjectAccount$;
    const firstProjectAccountIdSubscription = firstProjectAccount$.subscribe(value => {
      if(value != null){
        this.account = value.id;
        this.loadProjects(); 
      }
    });
    this.subscriptions.push(firstProjectAccountIdSubscription);

    // this.subscriptions.push(
    //   this.eventService.ProjectAccount$.subscribe(account => {
    //     this.account = account.id || ""; 
    //     this.loadProjects();
    //   })
    // );

    this.subscriptions.push(
      this.eventService.SearchTermChanged$.subscribe(
        (r: string) => {
          this.searchTerm = r || ""; 
          this.loadProjects();
        }
      )
    );

    this.subscriptions.push(
      this.eventService.statusChange$.subscribe(
        (arr: any) => {
          this.statusesArray = arr.length === 0 ? this.statuses : arr;
          this.loadProjects();
        }
      )
    );

    this.subscriptions.push(
      this.eventService.SortChanged$.subscribe(
        (r: number) => {
          this.sortValue = r;
          this.loadProjects();
        }
      )
    );

    this.subscriptions.push(
      this.eventService.OnRefresh$.subscribe(
        (refresh) => {
          if (refresh) {
            this.eventService.PublishProjectSelected(null);
            this.loadProjects();
          }
        }
      )
    );

    this.subscriptions.push(
      this.eventService.OnAddProject$.subscribe(
        (addProject) => {
          if (addProject) {
            this.loadProjects();
          }
        }
      )
    );
    // this.loadProjects();
  }

  loadProjects(): void {
    this.loadingProjects = true;
    const userSession = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (userSession && this.account) {
      const projects$ = this.projectsService.getProjectsByAccountName(this.account, this.pageIndex + 1, this.pageSize, this.searchTerm, this.sortValue, this.statusesArray);

      if (this.projectsSubscription) {
        this.projectsSubscription.unsubscribe();
      }

      this.projectsSubscription = projects$.subscribe(
        (response: any) => {
          this.projects = response.data;
          this.totalProjects = response.totalRecords;
          this.noProjects = this.projects.length === 0;
          this.loadingProjects = false;
        },
        (error) => {
          console.log(error)
          this.loadingProjects = false;
          if (error.status == 400 || error.status == 500) {
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
    } else {
      this.loadingProjects = false;
    }
  }
  
  deleteProject(event: Event, project: any): void {
    event.stopPropagation();
    console.log(project);
    const dialogRef = this.dialog.open(DeleteProjectComponent, {
      data: project
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.projects = this.projects.filter(p => p.id !== project.id);
        this.loadProjects(); 
        if (this.selectedProject === project) {
          this.eventService.PublishProjectSelected(project.id);
        }
      }
    });
  }

  openEditProject(event: Event, project: any) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AddProjectComponent, {
      data: { project }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.loadProjects();
        if (this.selectedProject === project) {
          this.eventService.PublishProjectSelected(project.id);
        }
      }
    });
  }

  onPaginateChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProjects();
  }

  selectProject(project: any): void {
    this.selectedProject = project;
    this.eventService.PublishProjectSelected(project.id);
  }

  ngOnDestroy(): void {
    if (this.projectsSubscription) {
      this.projectsSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
