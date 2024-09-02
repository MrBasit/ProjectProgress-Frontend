import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectsService } from '../../services/projects.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit, OnDestroy {
  projectForm: FormGroup;
  account: string = '';
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
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (userSession && userSession.username) {
      this.account = userSession.username;
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
        console.error('Error loading status options:', error);
      }
    );
  }

  addProject() {
    this.loading = true;
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (userSession && userSession.username) {
      const projectData = {
        projectTitle: this.projectForm.value.title,
        projectIniateDate: this.currentDate,
        statusId: this.projectForm.value.status, 
        projectAccountId: userSession.id,
        description: this.projectForm.value.description
      };

      if (this.isEditMode) {
        console.log(projectData)
        this.projectSubscription = this.projectsService.editProject().subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close("confirm");
          },
          (error) => {
            this.loading = false;
            console.error('Error updating project:', error);
          }
        );
      } else {
        this.projectSubscription = this.projectsService.addProject(projectData).subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close("confirm");
          },
          (error) => {
            this.loading = false;
            console.error('Error adding project:', error);
          }
        );
      }
    } else {
      this.loading = false;
      alert('User session has expired or is invalid. Please sign in again.');
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
