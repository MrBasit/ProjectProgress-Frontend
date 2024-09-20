import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/services/auth-guard.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit {
  otpForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  email;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authGuardService: AuthGuardService, 
    private snackBar: MatSnackBar,
  ) {
    this.otpForm = this.fb.group({
      email: [{value: '', disabled: true}, Validators.required],
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(){
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      this.email = storedEmail;
      this.otpForm.patchValue({ email: this.email });
    }
  }

  onSubmit() {
    if (this.otpForm.valid) {
      this.loading = true;
      this.otpForm.get('email').enable();
      const finalCredentials = this.otpForm.value;
      this.otpForm.get('email').disable();
      this.authGuardService.otpConfirmation(finalCredentials).subscribe(
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
            this.errorMessage = 'OTP is incorrect 😢.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000); 
          }
          else if(error.status == 400 || error.status == 500 || error.status == 0){
            this.snackBar.open('Server is not responding 😢.', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }else {
            this.snackBar.open(error.error.message + ' 😢.', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        }
      );
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
    localStorage.removeItem('userEmail')
  }
}
