import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  noProjectsFound: boolean = false;
  private noProjectsSubscription: Subscription | undefined;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.noProjectsSubscription = this.eventService.noProjects$.subscribe(
      (response) => {
        this.noProjectsFound = response === true;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.noProjectsSubscription) {
      this.noProjectsSubscription.unsubscribe();
    }
  }
}
