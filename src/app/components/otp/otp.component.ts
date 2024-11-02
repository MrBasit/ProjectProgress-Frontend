import { Component, OnInit, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { SuccessHandlerService } from 'src/app/services/success-handler.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit {
  otpForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  email: string;
  rememberMe: boolean = false;
  otpControls: number[] = Array(6).fill(0);
  resendLoading = false;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authGuardService: AuthGuardService, 
    private errorHandler: ErrorHandlerService,
    private successHandler: SuccessHandlerService,
    private snackBar: MatSnackBar,
    private sucessHandler: SuccessHandlerService
  ) {
    this.otpForm = this.fb.group({
      email: [{ value: '', disabled: true }, Validators.required],
      otp0: ['', [Validators.required, Validators.minLength(1)]],
      otp1: ['', [Validators.required, Validators.minLength(1)]],
      otp2: ['', [Validators.required, Validators.minLength(1)]],
      otp3: ['', [Validators.required, Validators.minLength(1)]],
      otp4: ['', [Validators.required, Validators.minLength(1)]],
      otp5: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    const storedEmail = localStorage.getItem('userEmail');
    this.rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (storedEmail) {
      this.email = storedEmail;
      this.otpForm.patchValue({ email: this.email });
    }
  }

  onOtpInput(index: number) {
    const nextIndex = index + 1;
    if (nextIndex < this.otpControls.length) {
      const nextInput = this.otpInputs.toArray()[nextIndex].nativeElement;
      nextInput.focus(); 
    }
  }

  onPaste(event: ClipboardEvent, index: number) {
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData) {
      const otpArray = pastedData.split('').slice(0, this.otpControls.length);
      otpArray.forEach((digit, idx) => {
        if (idx < this.otpControls.length) {
          this.otpForm.get(`otp${idx}`)?.setValue(digit);
        }
      });
      this.otpInputs.last.nativeElement.focus();
      event.preventDefault();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && this.otpForm.get(`otp${index}`)?.value === '') {
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        const prevInput = this.otpInputs.toArray()[prevIndex].nativeElement;
        prevInput.focus();
        setTimeout(() => {
          prevInput.focus();
          prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
      }, 0);
      }
    }
  }

  onResend(){
    this.resendLoading = true
    this.authGuardService.resendOtp(this.email).subscribe(
      (response : any) => {
        this.resendLoading = false
        this.sucessHandler.handleSuccess(response.message)  
      },
      (error) => {
        this.resendLoading = false
        this.errorHandler.handleError(error);
      }
    );
  }

  onSubmit() {
    if (this.otpForm.valid) {
      this.loading = true;
      this.otpForm.get('email').enable();
      const otpValue = Object.values(this.otpForm.value)
        .slice(1) 
        .join('');
      const finalCredentials = {
        ...this.otpForm.value,
        otp: otpValue,
        rememberMe: this.rememberMe
      };
      this.otpForm.get('email').disable();
      this.authGuardService.otpConfirmation(finalCredentials).subscribe(
        () => {
          this.loading = false;
          this.successHandler.handleSuccess("Welcome back 🥳!!");
          this.router.navigate(['/home']);
        },
        (error) => {
          this.loading = false;
          if (error.status === 401) {
            this.snackBar.open('OTP is incorrect 😢.', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            this.errorHandler.handleError(error);
          }
        }
      );
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
  }
}
