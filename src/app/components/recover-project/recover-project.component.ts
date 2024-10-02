import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectsService } from 'src/app/services/projects.service';
import { SuccessHandlerService } from './../../services/success-handler.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';

@Component({
  selector: 'app-recover-project',
  templateUrl: './recover-project.component.html',
  styleUrls: ['./recover-project.component.css']
})
export class RecoverProjectComponent implements OnInit {
  loading: boolean = false;
  statusLoading = false
  statuses;

  constructor(
    private dialogRef: MatDialogRef<RecoverProjectComponent>,
    private projectsService: ProjectsService,
    private successHandler:SuccessHandlerService,
    private errorHandler: ErrorHandlerService,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) { }

  ngOnInit(): void {
    this.statusLoading = true;
    this.projectsService.getStatuses().subscribe(
      (response) => {
        this.statusLoading = false;
        this.statuses = response;
      },
      (error) => {
        this.statusLoading = false;
        this.errorHandler.handleError(error);
      }
    );
  }
  recycleProject() {
    this.loading = true;
    const activeStatus = this.statuses.find(status => status.name === "Active"); 
    let projectData = {
      id: this.data.project.id, 
      title: this.data.project.title,
      description: this.data.project.description,
      status:{
        id: activeStatus?.id,
        name: activeStatus?.name
      }, 
    };
    this.projectsService.editProject(projectData).subscribe(
      () => {
        this.loading = false;
        this.successHandler.handleSuccess('Project recovered successfully 🥳!!');
        this.dialogRef.close('confirm');
      },
      (error) => {
        this.loading = false;
        this.errorHandler.handleError(error);
      }
    )
  }

  close() {
    this.dialogRef.close();
  }

}
