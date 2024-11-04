import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthGuardService } from '../services/auth-guard.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { SuccessHandlerService } from '../services/success-handler.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthGuardService,
    private errorHandler: ErrorHandlerService,
    private successHandler: SuccessHandlerService,
  ) {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgetPasswordForm.valid) {
      this.loading = true;
      const email = this.forgetPasswordForm.value.email;

      this.authService.forgetPassword(email).subscribe(
        (response: any) => {
          this.successHandler.handleSuccess(response.message)
          this.loading = false;
          this.forgetPasswordForm.reset();
          this.forgetPasswordForm.get('email')?.setErrors(null);
          this.forgetPasswordForm.get('email')?.markAsUntouched();
          this.forgetPasswordForm.get('email')?.markAsPristine();
        },
        (error) => {
          this.loading = false;
          this.errorHandler.handleError(error)
        },
      );
    }
  }
}
