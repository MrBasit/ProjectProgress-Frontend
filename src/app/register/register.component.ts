import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  loading: boolean = false;
  registerForm: FormGroup;
  errorMessage: string = '';

  passwordHasUppercase: boolean = false;
  passwordHasLowercase: boolean = false;
  passwordHasNumber: boolean = false;
  passwordHasSpecialChar: boolean = false;
  passwordMinLength: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private authGuardService: AuthGuardService, private snackBar: MatSnackBar) {
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
          this.snackBar.open('Hurry!! you are registered 🥳.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.router.navigate(['/login']);
        },
        (error) => {
          this.loading = false;
          this.errorMessage = error.message;
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000); 
          if (error) {
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
