import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar
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
      this.authGuardService.login(credentials).subscribe(
        () => {
          this.loading = false
          this.snackBar.open('Welcome back 🥳!!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });          
          this.router.navigate(['/home']);
        },
        (error) => {
          this.loading = false
          if (error.status === 401) {
            this.errorMessage = 'Username or password is incorrect 😢.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000); 
          } else {
            this.snackBar.open('Server is not responding 😢.', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        }
      );
    }
  }

  register() {
    this.router.navigate(['/register']);
  }
}
