import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
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
  searchTerm:string = "";
  projects: any[] = [];
  selectedProject: any = null;
  loadingProjects: boolean = false;

  totalProjects: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private projectsSubscription: Subscription | undefined;

  constructor(private projectsService: ProjectsService, private dialog: MatDialog, private eventService: EventService) {}

  ngOnInit(): void {
    this.loadProjects();
    
    this.eventService.SearchTermChanged$.subscribe(
      (r:string)=>{
        this.searchTerm = r == null?"":r;
        this.loadProjects();
      }
    )

    this.eventService.SortChanged$.subscribe(
      (r:number)=>{
        this.sortValue = r;
        this.loadProjects();
      }
    )
    this.eventService.OnRefresh$.subscribe(
      (refresh)=>{
        if(refresh){
          this.eventService.PublishProjectSelected(null)
          this.loadProjects();
        }
      }
    )
    this.eventService.OnAddProject$.subscribe(
      (addProject)=>{
        if(addProject){
          this.loadProjects();
        }
      }
    )
  }

  loadProjects(): void {
    this.loadingProjects = true;
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    if (userSession && userSession.expiration > new Date().getTime()) {
      var getProjectsRequestModel = {
        username: ""
      }
      var projests$ = this.projectsService.getProjectsByAccountName(userSession.username, this.pageIndex + 1, this.pageSize, this.searchTerm, this.sortValue);
  
      if (this.projectsSubscription) {
        this.projectsSubscription.unsubscribe();
      }
  
      this.projectsSubscription = projests$.subscribe(
        (response: any) => {
          this.projects = response.data;
          this.totalProjects = response.totalRecords;
          if(this.projects.length === 0){
            this.eventService.PublishNoProjects(true)
          }else{
            this.eventService.PublishNoProjects(false)
          }
          this.loadingProjects = false;
        },
        (error) => {
          console.error('Error loading projects:', error);
          this.loadingProjects = false;
        }
      );
    } else {
      this.loadingProjects = false;
    }
  }
  
  deleteProject(event: Event, project: any): void {
    event.stopPropagation();
    console.log(project)
    const dialogRef = this.dialog.open(DeleteProjectComponent, {
      data: project
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.projects = this.projects.filter(p => p.id !== project.id);
        this.loadProjects(); 
        if (this.selectedProject === project) {
          this.eventService.PublishProjectSelected(project.id)
        }
      }
    });
  }

  openEditProject(event: Event, project: any) {
    event.stopPropagation()
    const dialogRef = this.dialog.open(AddProjectComponent, {
      data: { project } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
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
    this.eventService.PublishProjectSelected(project.id)
  }

  ngOnDestroy(): void {
    if(this.projectsSubscription)
      this.projectsSubscription.unsubscribe();
  }
}
