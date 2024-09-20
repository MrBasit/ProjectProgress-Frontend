import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css']
})
export class SignOutComponent implements OnInit {

  loading: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<SignOutComponent>,
    private authService: AuthGuardService,
    private snackBar: MatSnackBar, 
  ) { }

  ngOnInit(): void {}

  signOut() {
    const userSession = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (userSession) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false
        this.dialogRef.close('confirm');
        this.authService.logout()
      }, 1000); 
    } else {
      this.snackBar.open('Server is not responding 😢.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }

}
