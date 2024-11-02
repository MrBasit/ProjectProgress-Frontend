import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading: boolean = false;

  passwordHasUppercase: boolean = false;
  passwordHasLowercase: boolean = false;
  passwordHasNumber: boolean = false;
  passwordHasSpecialChar: boolean = false;
  passwordMinLength: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthGuardService,
    private errorHandler: ErrorHandlerService,
    private successHandler: SuccessHandlerService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/)
      ]]
    });

    this.resetPasswordForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password);
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.resetPasswordForm.addControl('email', this.fb.control(params['email']));
      this.resetPasswordForm.addControl('resetCode', this.fb.control(params['token']));
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.loading = true;
      const resetData = {
        email: this.resetPasswordForm.value.email,
        resetCode: encodeURIComponent(this.resetPasswordForm.value.resetCode),
        newPassword: this.resetPasswordForm.value.newPassword
      };

      this.authService.resetPassword(resetData).subscribe(
        () => {
          this.loading = false;
          this.successHandler.handleSuccess("Password reset successfully. Now You can login from your new password.");
          this.router.navigate(['/login']);
        },
        (error) => {
          this.loading = false;
          this.errorHandler.handleError(error.message);
        }
      );
    }
  }

  checkPasswordStrength(password: string) {
    this.passwordHasUppercase = /[A-Z]/.test(password);
    this.passwordHasLowercase = /[a-z]/.test(password);
    this.passwordHasNumber = /\d/.test(password);
    this.passwordHasSpecialChar = /[^A-Za-z\d]/.test(password);
    this.passwordMinLength = password.length >= 6;
  }
}
