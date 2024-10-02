import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authGuardService: AuthGuardService, 
    private errorHandler: ErrorHandlerService,
    private sucessHandler: SuccessHandlerService,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials = this.loginForm.value;
      localStorage.setItem('userEmail', credentials.username);
      this.authGuardService.login(credentials).subscribe(
        (response : any) => {
          this.loading = false
          this.sucessHandler.handleSuccess(response.message)        
          this.router.navigate(['/otp']);
        },
        (error) => {
          this.loading = false
          console.log(error)
          localStorage.removeItem('userEmail');
          if (error.status === 401) {
            this.errorMessage = 'Username or password is incorrect 😢.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000); 
          }
          else {
            this.errorHandler.handleError(error)
          }
        }
      );
    }
  }

  register() {
    this.router.navigate(['/register']);
  }
}
