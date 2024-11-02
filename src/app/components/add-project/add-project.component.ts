import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from '../../services/projects.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { EventService } from 'src/app/services/event.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';
import { TemplatesService } from 'src/app/services/templates.service';

@Component({
  selector: 'add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit, OnDestroy {
  projectTypeOptions: string[] = [
    'Website',
    'SMM',
    'Graphic Designing',
    'Video Editing',
    'Other'
  ];
  
  contractTypeOptions: string[] = [
    'Fixed',
    'Hourly'
  ];

  projectForm: FormGroup;
  account: any;
  currentDate: string = '';
  loading: boolean = false;
  statusLoading = false;
  isEditMode: boolean = false;
  statusOptions: { id: number, name: string }[] = [];
  statusFieldDisabled: boolean = true; 
  aliases = []
  types = ["Fill", "Append"]
  aliasSelection = {alias:'', type:''}
  accountId;
  isLoading = false;

  private projectSubscription: Subscription | undefined;
  private statusSubscription: Subscription | undefined;
  private templateSubscription : Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProjectComponent>,
    private projectsService: ProjectsService,
    private datePipe: DatePipe,
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private errorHandler: ErrorHandlerService,
    private templateService: TemplatesService,
    private sucessHandler: SuccessHandlerService,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      clientName: ['', Validators.required],
      webOrAccountName: ['', Validators.required],
      projectType: ['', Validators.required],
      contractType: ['', Validators.required],
      description: ['', Validators.required],
      date: [{ value: '', disabled: true }],
      account: [{ value: '', disabled: true }],
      status: ['', Validators.required]  
    });
  }

  ngOnInit(): void {
    this.aliasSelection.alias = '';
    this.aliasSelection.type = '';
    const firstProjectAccount$ = this.eventService.firstProjectAccount$;
    this.templateSubscription = firstProjectAccount$.subscribe(value => {
      this.accountId = value.id;
      this.getTemplates();
    });
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
  
      this.projectForm.get('clientName')?.clearValidators();
      this.projectForm.get('webOrAccountName')?.clearValidators();
      this.projectForm.get('projectType')?.clearValidators();
      this.projectForm.get('contractType')?.clearValidators();
      this.projectForm.get('title')?.setValidators(Validators.required);

    } else {
      const currentDate = this.datePipe.transform(new Date(), 'MMM d, yyyy');
      this.projectForm.patchValue({
        date: currentDate,
        status: 1
      });
  
      this.projectForm.get('clientName')?.setValidators(Validators.required);
      this.projectForm.get('webOrAccountName')?.setValidators(Validators.required);
      this.projectForm.get('projectType')?.setValidators(Validators.required);
      this.projectForm.get('contractType')?.setValidators(Validators.required);
      this.projectForm.get('title')?.clearValidators();
    }
  
    this.projectForm.get('title')?.updateValueAndValidity();
    this.projectForm.get('clientName')?.updateValueAndValidity();
    this.projectForm.get('webOrAccountName')?.updateValueAndValidity();
    this.projectForm.get('projectType')?.updateValueAndValidity();
    this.projectForm.get('contractType')?.updateValueAndValidity();

    this.loadStatusOptions();
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
      }
    );
  }

  loadStatusOptions() {
    this.statusLoading = true;
    this.statusSubscription = this.projectsService.getStatuses().subscribe(
      (response) => {
        this.statusLoading = false;
        this.statusOptions = response; 
      },
      (error) => {
        this.statusLoading = false;
        this.errorHandler.handleError(error)
      }
    );
  }

  onTemplateSelect(): void {
    if (this.aliasSelection.type && this.aliasSelection.alias) { 
      if (this.aliasSelection.type === 'Fill') {
        this.projectForm.patchValue({description: this.aliasSelection.alias});
      } else if (this.aliasSelection.type === 'Append') {
        const currentDescription = this.projectForm.get('description').value;
        this.projectForm.patchValue({ description: currentDescription + this.aliasSelection.alias });
      }
      this.aliasSelection.alias = '';
      this.aliasSelection.type = '';
    }
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
            this.sucessHandler.handleSuccess('Project updated successfully 🥳!!');
          },
          (error) => {
            this.loading = false;
            this.errorHandler.handleError(error)
          }
        );
  
      } else {
        const name = this.projectForm.value.clientName + ' | ' + this.projectForm.value.webOrAccountName+ ' | ' +  this.projectForm.value.projectType+ ' | ' +  this.projectForm.value.contractType;
        projectData = {
          projectTitle: name,
          projectIniateDate: new Date().toISOString(), 
          statusId: 1, 
          projectAccountId: this.account.id,
          description: this.projectForm.value.description
        };
  
        this.projectSubscription = this.projectsService.addProject(projectData).subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close("confirm");
            this.sucessHandler.handleSuccess('Project added successfully 🥳!!');
          },
          (error) => {
            this.errorHandler.handleError(error)
          }
        );
      }
    } else {
      this.loading = false;
      this.snackBar.open('UserSeesion not found. Kindly, login again 😢.', 'Close', {
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
    if(this.templateSubscription){
      this.templateSubscription.unsubscribe();
    }
  }
}
