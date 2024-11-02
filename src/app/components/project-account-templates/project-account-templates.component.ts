import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TemplatesService } from 'src/app/services/templates.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';
import { DeleteTemplateComponent } from '../delete-template/delete-template.component';
import { EventService } from 'src/app/services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-account-templates',
  templateUrl: './project-account-templates.component.html',
  styleUrls: ['./project-account-templates.component.css']
})
export class ProjectAccountTemplatesComponent implements OnInit, OnDestroy {
  templates : any[] = [];
  allTemplates: any[] = [];
  searchTerm: string;
  Add = false;
  templateForm: FormGroup; 
  selectedTemplate: any;
  isLoading = false;
  loading= false;
  noTemplates= false;  
  @ViewChild('dialogContent') dialogContent: ElementRef;
  accountId = 0;
  private subscriptions: Subscription[] = [];


  constructor(
    private dialogRef: MatDialogRef<ProjectAccountTemplatesComponent>,
    private templateService: TemplatesService,
    private errorHandler: ErrorHandlerService,
    private successHandler: SuccessHandlerService,
    private dialog: MatDialog,
    private eventService: EventService,
    private fb: FormBuilder 
  ) {

    this.templateForm = this.fb.group({
      heading: ['', Validators.required],
      alias: ['', Validators.required], 
      templateString: ['', Validators.required] 
    });
  }

  ngOnInit(): void {
    const firstsubs = this.eventService.firstProjectAccount$.subscribe(value => {
      if(value != null){
        this.accountId = value.id;
        this.getTemplates();
      }
    });
    this.subscriptions.push(firstsubs);
    this.templateForm.get('alias').disable()
    this.templateForm.get('heading').valueChanges.subscribe((value: string) => {
      const aliasValue = value ? value.toLowerCase().replace(/\s+/g, '_') : '';
      this.templateForm.get('alias').setValue(aliasValue, { emitEvent: false });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchTerm = filterValue;
  
    if (this.searchTerm === '') {
      this.templates = [...this.allTemplates];
    } else {
      this.templates = this.allTemplates.filter(template => 
        template.heading.toLowerCase().includes(this.searchTerm) || 
        template.alias.toLowerCase().includes(this.searchTerm)
      );
    }
    this.noTemplates = this.templates?.length === 0;
  }
  

  getTemplates() {
    this.allTemplates = []
    this.templates = []
    this.isLoading = true
    this.templateService.getTemplates(this.accountId).subscribe(
      (templates: any) => {
        this.isLoading = false
        this.allTemplates = templates;
        this.templates = templates; 
        if(templates?.length == 0){
          this.noTemplates = true;
        }
      }, 
      (error) => {
        this.isLoading = false
        this.errorHandler.handleError(error)
        this.noTemplates = true;
      }
    );
  }
  scrollToTop() {
    console.log(this.dialogContent);
    setTimeout(() => {
      this.dialogContent.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
  

  OnAdd(event) {
    event.stopPropagation();
    this.Add = true;
    this.selectedTemplate = null; 
    this.templateForm.reset(); 
  }
  onCancel(){
    this.Add = false;
    this.selectedTemplate = null; 
    this.templateForm.reset();
  }

  editTemplate(template: any) {
    this.selectedTemplate = { ...template }; 
    this.Add = true; 
    this.templateForm.patchValue({
      heading: this.selectedTemplate.heading,
      alias: this.selectedTemplate.alias,
      templateString: this.selectedTemplate.templateString
    });
    this.scrollToTop();
  }

  onSubmit() {
    this.loading = true;
    this.templateForm.get('alias').enable()
    if (this.templateForm.valid) {
      if (this.selectedTemplate) {
        const template = {
          id: this.selectedTemplate.id,
          heading: this.templateForm.value.heading,
          alias: this.templateForm.value.alias,
          templateString: this.templateForm.value.templateString,
          projectAccoutId: this.accountId
        }
        this.templateService.updateTemplate(template).subscribe(
          () => {
            this.loading = false
            this.templateForm.get('alias').disable()
            this.Add = false; 
            this.selectedTemplate = null; 
            this.templateForm.reset();
            this.getTemplates();
            this.successHandler.handleSuccess("Template has been edited successfully 🥳!!")
          }, 
          (error)=>{
            this.templateForm.get('alias').disable()  
            this.loading = false
            this.errorHandler.handleError(error)
            this.getTemplates();
          }
        )
      } else {
        const template = {
          id: 0,
          heading: this.templateForm.value.heading,
          alias: this.templateForm.value.alias,
          templateString: this.templateForm.value.templateString,
          projectAccoutId: this.accountId
        }
        this.templateService.addTemplate(template).subscribe(
          () => {
            this.loading = false
            this.templateForm.get('alias').disable()
            this.Add = false; 
            this.selectedTemplate = null; 
            this.templateForm.reset();
            this.getTemplates();
            this.successHandler.handleSuccess("Template has been added successfully 🥳!!")
          },
          (error)=>{
            this.templateForm.get('alias').disable()
            this.loading = false
            this.errorHandler.handleError(error)
            this.getTemplates();
          }
        )
      }
    }
  }
  deleteTemplate(template){
    const dialogRef = this.dialog.open(DeleteTemplateComponent, {
      data: template,
      width:  'fit-content',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.getTemplates();
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
  ngOnDestroy(): void {
    if(this.subscriptions){
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = null;
    }
  }
}
