import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectsService } from '../../services/projects.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-project',
  templateUrl: './delete-project.component.html',
  styleUrls: ['./delete-project.component.css']
})
export class DeleteProjectComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  private deleteSubscription: Subscription | undefined;

  constructor(
    private dialogRef: MatDialogRef<DeleteProjectComponent>,
    private projectsService: ProjectsService,
    @Inject(MAT_DIALOG_DATA) public project: any 
  ) { }

  ngOnInit(): void {}

  deleteProject() {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    if (userSession && userSession.username) {
      this.loading = true; 
      this.deleteSubscription = this.projectsService.deleteProject(this.project.id).subscribe(
        (response) => {
          this.dialogRef.close('confirm');
          this.loading = false; 
        },
        (error) => {
          alert('An error occurred while deleting the project.');
          this.loading = false; 
        }
      );
    } else {
      alert('User session has expired or is invalid. Please sign in again.');
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.deleteSubscription) {
      this.deleteSubscription.unsubscribe();
    }
  }
}
