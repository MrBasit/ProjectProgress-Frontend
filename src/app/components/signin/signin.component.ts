import { Component, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnDestroy {
  username: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  private userSubscription: Subscription | undefined;

  constructor(private userService: UserService) {}

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    
    this.userSubscription = this.userService.getUserByUsername(this.username).subscribe(
      (userData: any) => {
        this.loading = false;
        if (userData) {
          const now = new Date();
          const expirationTime = now.getTime() + 24 * 60 * 60 * 1000;

          const userSession = {
            username: this.username,
            id: userData.id,
            expiration: expirationTime
          };

          localStorage.setItem('userSession', JSON.stringify(userSession));
          window.location.reload();
        } else {
          alert('Invalid username. Please try again.');
        }
      },
      (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.errorMessage = 'No account with this name.';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000); 
        } else {
          console.error('Error fetching user data', error);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
