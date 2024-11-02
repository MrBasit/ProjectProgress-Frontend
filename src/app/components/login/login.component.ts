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
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe :  [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials = this.loginForm.value;
      localStorage.setItem('userEmail', credentials.username);
      localStorage.setItem('rememberMe', credentials.rememberMe);
      this.authGuardService.login(credentials).subscribe(
        (response : any) => {
          this.loading = false
          this.sucessHandler.handleSuccess(response.message)        
          this.router.navigate(['/home']);
        },
        (error) => {
          this.loading = false
          console.log(error)
          localStorage.removeItem('userEmail');
          localStorage.removeItem('rememberMe');
          if (error.status === 401) {
            this.snackBar.open('Username or password is incorrect 😢.', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
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
