import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TemplatesService } from 'src/app/services/templates.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';

@Component({
  selector: 'app-project-account-templates',
  templateUrl: './project-account-templates.component.html',
  styleUrls: ['./project-account-templates.component.css']
})
export class ProjectAccountTemplatesComponent implements OnInit {
  templates : any[];
  searchTerm: string;
  Add = false;
  templateForm: FormGroup; 
  selectedTemplate: any;
  isLoading = false;
  loading= false;
  noTemplates= false;  
  @ViewChild('dialogContent') dialogContent: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<ProjectAccountTemplatesComponent>,
    private templateService: TemplatesService,
    private errorHandler: ErrorHandlerService,
    private successHandler: SuccessHandlerService,
    private fb: FormBuilder 
  ) {

    this.templateForm = this.fb.group({
      heading: ['', Validators.required],
      alias: ['', Validators.required], 
      templateString: ['', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.getTemplates();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim().toLowerCase();
  }

  getTemplates() {
    this.isLoading = true
    this.templateService.getTemplates().subscribe(
      (templates: any) => {
        if(templates.length == 0){
          this.noTemplates = true;
        }
        this.isLoading = false
        this.templates = templates;
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
    if (this.templateForm.valid) {
      if (this.selectedTemplate) {
        const template = {
          id: this.selectedTemplate.id,
          heading: this.templateForm.value.heading,
          alias: this.templateForm.value.alias,
          templateString: this.templateForm.value.templateString,
          projectAccoutId: 0
        }
        this.templateService.updateTemplate(template).subscribe(
          () => {
            this.loading = false
            this.Add = false; 
            this.selectedTemplate = null; 
            this.templateForm.reset();
            this.getTemplates();
            this.successHandler.handleSuccess("Template has been edited successfully 🥳!!")
          }, 
          (error)=>{
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
          projectAccoutId: 1
        }
        this.templateService.addTemplate(template).subscribe(
          () => {
            this.loading = false
            this.Add = false; 
            this.selectedTemplate = null; 
            this.templateForm.reset();
            this.getTemplates();
            this.successHandler.handleSuccess("Template has been added successfully 🥳!!")
          },
          (error)=>{
            this.loading = false
            this.errorHandler.handleError(error)
            this.getTemplates();
          }
        )
      }
    }
  }
  deleteTemplate(id){
    this.templateService.deleteTemplate(id).subscribe(
      () => {
        this.getTemplates();
      },
      (error)=>{
        this.errorHandler.handleError(error)
        this.getTemplates();
      }
    )
  }

  close(): void {
    this.dialogRef.close();
  }
}
