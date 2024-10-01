import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  loading: boolean = false;
  registerForm: FormGroup;

  passwordHasUppercase: boolean = false;
  passwordHasLowercase: boolean = false;
  passwordHasNumber: boolean = false;
  passwordHasSpecialChar: boolean = false;
  passwordMinLength: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authGuardService: AuthGuardService, 
    private errorHandler: ErrorHandlerService,
    private successHandler: SuccessHandlerService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/)
      ]]
    });

    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password);
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      const credentials = this.registerForm.value;
      this.authGuardService.register(credentials).subscribe(
        () => {
          this.loading = false;
          this.successHandler.handleSuccess("Hurry!! you are registered 🥳.")
          this.router.navigate(['/login']);
        },
        (error) => {
          this.loading = false;
          this.errorHandler.handleError(error)
        }
      );
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

  checkPasswordStrength(password: string) {
    this.passwordHasUppercase = /[A-Z]/.test(password);
    this.passwordHasLowercase = /[a-z]/.test(password);
    this.passwordHasNumber = /\d/.test(password);
    this.passwordHasSpecialChar = /[^A-Za-z\d]/.test(password);
    this.passwordMinLength = password.length >= 6;
  }
}
