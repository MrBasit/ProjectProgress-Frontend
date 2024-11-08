import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressService } from '../../services/progress.service';
import { MatPaginator } from '@angular/material/paginator';
import { EventService } from 'src/app/services/event.service';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { types } from 'util';
import { TemplatesService } from 'src/app/services/templates.service';

@Component({
  selector: 'project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  projectId: number | null = null;
  public project: any;
  newProgress = {progress:''};
  loading: boolean = false;
  progressArr: any[] = [];
  totalProgress: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  loadingComp: boolean = false;
  aliases = []
  types = ["Fill", "Append"]
  aliasSelection = {alias:'', type:''}
  accountId;
  isLoading = false
  loadingPro = false


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
    private errorHandler: ErrorHandlerService,
    private templateService: TemplatesService,
  ) {}

  ngOnInit(): void {
    const firstProjectAccount$ = this.eventService.firstProjectAccount$;
    firstProjectAccount$.subscribe(value => {
      this.accountId = value.id;
      this.getTemplates();
    });
    this.eventSubscription = this.eventService.ProjectSelected$.subscribe((projectId : number) => {
      this.totalProgress= 0;
      this.pageSize= 5;
      this.pageIndex= 0;
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
  getTemplates(){
    this.aliases = []
    this.isLoading = true
    this.templateService.getTemplates(this.accountId).subscribe(
      (templates: any) => {
        this.isLoading = false
        this.aliases = templates;
      }, 
      (error) => {
        this.isLoading = false
        this.errorHandler.handleError(error)
        // this.noTemplates = true;
      }
    );
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

  onTemplateSelect(): void {
    if (this.aliasSelection.type && this.aliasSelection.alias) { 
      if (this.aliasSelection.type === 'Fill') {
        this.newProgress.progress = this.aliasSelection.alias; 
      } else if (this.aliasSelection.type === 'Append') {
        this.newProgress.progress += this.aliasSelection.alias;
      }

      this.aliasSelection.alias = '';
      this.aliasSelection.type = '';
    }
  }

  loadProgress(): void {
    if (this.projectId) {
      this.loadingPro = true;
      this.progressSubscription = this.progressService.getProgressWithPagination(this.projectId, this.pageIndex + 1, this.pageSize).subscribe(
        (response) => {
          this.progressArr = response.data;
          this.totalProgress = response.totalRecords;
          this.loadingPro = false;
        },
        (error) => {
          this.loadingPro = false;
          this.errorHandler.handleError(error)
        }
      );
    }
  }

  loadProject(): void {
    this.aliasSelection.alias = '';
    this.aliasSelection.type = '';
    this.newProgress = { progress: '' };
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
          this.errorHandler.handleError(error)
        }
      );
    }
    this.project = null
  }

  convertToLinks(link: string): string {
    let text = link.toLowerCase()
    const urlPattern = /\b((https?:\/\/|htt:\/\/|ht:\/\/|h:\/\/|http:\/\/|https:\/)?(www\.|ww\.|w\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}([\/?].*)?)\b/g;
    return text.replace(urlPattern, function (url) {
      let hyperlink = url;

      if (
        hyperlink.startsWith('htt://') || 
        hyperlink.startsWith('ht://')|| 
        hyperlink.includes('https://ww.') ||
        hyperlink.includes('https://w.') ||
        hyperlink.startsWith('ww.')
      ) {
        return url; 
      }


      if (!hyperlink.startsWith('http')) {
        hyperlink = 'https://' + hyperlink;
      }

      try {

        const parsedUrl = new URL(hyperlink);

        const domain = parsedUrl.hostname.replace('www.', '');
        const domainName = domain.split('.')[0]; 

        return `<a href="${hyperlink}" target="_blank">${domainName}</a>`;
      } catch (e) {
        return url; 
      }
    });
  }

  addProgress(progressForm: NgForm): void {
    this.loading = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && this.project) {
      const description = this.newProgress.progress
      const progressData = {
        progress: description,
        projectId: this.project.id
      };

      this.progressSubscription = this.progressService.addProgress(progressData).subscribe(
        () => {
          this.loading = false;
          this.newProgress = { progress:''};
          this.isAddProgressPanelExpanded = false; 
          this.isProgressPanelExpanded = true; 
          this.loadProgress();
          progressForm.resetForm();  
        },
        (error) => {
          this.loading = false;
          this.errorHandler.handleError(error)
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
