import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public project: any 
  ) { }

  ngOnInit(): void {}

  deleteProject() {
    const userSession = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (userSession) {
      this.loading = true; 
      this.deleteSubscription = this.projectsService.deleteProject(this.project.id).subscribe(
        (response) => {
          this.dialogRef.close('confirm');
          this.loading = false; 
        },
        (error) => {
          this.loading = false;
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
      this.snackBar.open('Server is not responding 😢.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
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
