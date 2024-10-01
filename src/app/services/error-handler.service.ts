import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any): void {
    let message = '';

    if (error.status === 500 || error.status === 0) {
      message = 'Server is not responding 😢.';
    } else {
      message = error.error?.message + ' 😢.';
    }

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
