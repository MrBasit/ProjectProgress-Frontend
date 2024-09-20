import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressService } from '../../services/progress.service';
import { MatPaginator } from '@angular/material/paginator';
import { EventService } from 'src/app/services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  projectId: number | null = null;
  public project: any;
  newProgress = { description: '' };
  loading: boolean = false;
  progressArr: any[] = [];
  totalProgress: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  loadingComp: boolean = false;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel) expansionPanel: MatExpansionPanel | undefined;

  private eventSubscription: Subscription | undefined;
  private progressSubscription: Subscription | undefined;
  private projectSubscription: Subscription | undefined;

  isAddProgressPanelExpanded = false; 
  isProgressPanelExpanded = true;  

  constructor(
    private progressService: ProgressService,
    private projectsService: ProjectsService,
    private eventService: EventService, 
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.eventSubscription = this.eventService.ProjectSelected$.subscribe((projectId : number) => {
      if (projectId) {
        this.projectId = projectId;
        this.loadProject();
        this.loadProgress();
      } else {
        this.projectId = null;
        this.project = null;
        this.progressArr = [];
        this.totalProgress = 0;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
  }

  loadProgress(): void {
    if (this.projectId) {
      this.loading = true;
      this.progressSubscription = this.progressService.getProgressWithPagination(this.projectId, this.pageIndex + 1, this.pageSize).subscribe(
        (response) => {
          this.progressArr = response.data;
          this.totalProgress = response.totalRecords;
          this.loading = false;
        },
        (error) => {
          this.loading = false;
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
  }

  loadProject(): void {
    if (this.projectId != null) {
      this.loadingComp = true;
      this.projectSubscription = this.projectsService.getProjectById(this.projectId).subscribe(
        (response) => {
          this.project = response;
          this.loadingComp = false;
        },
        (error) => {
          console.error('Error fetching project:', error);
          this.loadingComp = false;
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
  }

  addProgress(): void {
    this.loading = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && this.project) {
      const progressData = {
        progress: this.newProgress.description,
        projectId: this.project.id
      };

      this.progressSubscription = this.progressService.addProgress(progressData).subscribe(
        () => {
          this.loading = false;
          this.newProgress = { description: '' };
          this.isAddProgressPanelExpanded = false; 
          this.isProgressPanelExpanded = true; 
          this.loadProgress();
        },
        (error) => {
          this.loading = false;
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
    } else {
      this.loading = false;
      console.error('No project or user session found');
    }
  }

  onPaginateChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProgress();
  }
}
