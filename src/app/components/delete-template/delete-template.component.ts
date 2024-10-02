import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';
import { TemplatesService } from 'src/app/services/templates.service';

@Component({
  selector: 'app-delete-template',
  templateUrl: './delete-template.component.html',
  styleUrls: ['./delete-template.component.css']
})
export class DeleteTemplateComponent implements OnInit {
  loading = false;
  constructor(
    private dialogRef: MatDialogRef<DeleteTemplateComponent>,
    private templateService: TemplatesService,
    private errorHandler: ErrorHandlerService,
    private successHandler: SuccessHandlerService,  
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) { }

  ngOnInit(): void {
  }
  deleteProject() {
    this.loading = true; 
    this.templateService.deleteTemplate(this.data.id).subscribe(
      (response) => {
        this.dialogRef.close('confirm');
        this.loading = false;
        this.successHandler.handleSuccess(`${this.data.heading} has been deleted`) 
      },
      (error) => {
        this.loading = false;
        this.errorHandler.handleError(error)
      }
    );
  }

  close() {
    this.dialogRef.close();
  }

}
