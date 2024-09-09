import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from '../../services/projects.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit, OnDestroy {
  projectForm: FormGroup;
  account: any;
  currentDate: string = '';
  loading: boolean = false;
  isEditMode: boolean = false;
  statusOptions: { id: number, name: string }[] = [];
  statusFieldDisabled: boolean = true; 

  private projectSubscription: Subscription | undefined;
  private statusSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProjectComponent>,
    private projectsService: ProjectsService,
    private datePipe: DatePipe,
    private eventService: EventService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: [{ value: '', disabled: true }],
      account: [{ value: '', disabled: true }],
      status: ['', Validators.required]  
    });
  }

  ngOnInit(): void {
    const userSession = JSON.parse(localStorage.getItem('user') || '{}');
    if (userSession) {
      this.eventService.firstProjectAccount$.subscribe(value => {
        this.account = value.name;
      });
      this.currentDate = new Date().toISOString();
      this.projectForm.patchValue({ date: this.currentDate, account: this.account });
    }

    if (this.data && this.data.project) {
      this.isEditMode = true;
      this.statusFieldDisabled = false;
      const formattedDate = this.datePipe.transform(this.data.project.projectIniateDate, 'MMM d, yyyy');
      this.projectForm.patchValue({
        title: this.data.project.title,
        description: this.data.project.description,
        status: this.data.project.status.id,
        date: formattedDate
      });
    } else {
      const currentDate = this.datePipe.transform(new Date(), 'MMM d, yyyy');
      this.projectForm.patchValue({
        date: currentDate,
        status: 1 
      });
    }
    this.loadStatusOptions();
  }

  loadStatusOptions() {
    this.statusSubscription = this.projectsService.getStatuses().subscribe(
      (response) => {
        this.statusOptions = response; 
      },
      (error) => {
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
  }

  addProject() {
    this.loading = true;
    const userSession = JSON.parse(localStorage.getItem('user') || '{}');
    this.eventService.firstProjectAccount$.subscribe(value => {
      this.account = value;
    });
    if (userSession) {
      let projectData: any;
  
      if (this.isEditMode) {
        const selectedStatus = this.statusOptions.find(status => status.id === this.projectForm.value.status);
        console.log(selectedStatus)
        projectData = {
          id: this.data.project.id, 
          title: this.projectForm.value.title,
          description: this.projectForm.value.description,
          status:{
            id: selectedStatus?.id,
            name: selectedStatus?.name
          }, 
        };
        
        this.projectSubscription = this.projectsService.editProject(projectData).subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close("confirm");
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
        projectData = {
          projectTitle: this.projectForm.value.title,
          projectIniateDate: new Date().toISOString(), 
          statusId: 1, 
          projectAccountId: this.account.id,
          description: this.projectForm.value.description
        };
  
        this.projectSubscription = this.projectsService.addProject(projectData).subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close("confirm");
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
      }
    } else {
      this.loading = false;
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
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }
}
