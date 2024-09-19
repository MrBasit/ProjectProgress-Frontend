import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private SearchTermChanged = new Subject<string>(); 
  private SortChanged = new Subject<number>();
  private OnRefresh = new Subject<boolean>(); 
  private OnAddProject = new Subject<boolean>(); 
  private ProjectSelected = new Subject<number>(); 
  private userEmail = new Subject<any>(); 
  private noProjects = new Subject<boolean>(); 
  private statusChange = new Subject<any[]>();

  private firstProjectAccount = new BehaviorSubject<any | null>(null);

  SearchTermChanged$ = this.SearchTermChanged.asObservable();
  SortChanged$ = this.SortChanged.asObservable();
  OnRefresh$ = this.OnRefresh.asObservable();
  OnAddProject$ = this.OnAddProject.asObservable();
  ProjectSelected$ = this.ProjectSelected.asObservable();
  userEmail$ = this.userEmail.asObservable();
  noProjects$ = this.noProjects.asObservable();
  statusChange$ = this.statusChange.asObservable();

  firstProjectAccount$ = this.firstProjectAccount.asObservable();

  PublishSearchTermChanged(SearchTerm: string) {
    this.SearchTermChanged.next(SearchTerm);
  }

  PublishSortChanged(SortId: number) {
    this.SortChanged.next(SortId);
  }

  PublishOnRefresh(value: boolean) {
    this.OnRefresh.next(value);
  }

  PublishOnAddProject(value: boolean) {
    this.OnAddProject.next(value);
  }

  PublishProjectSelected(value: number) {
    this.ProjectSelected.next(value);
  }

  PublishUserEmail(email: string) {
    this.userEmail.next(email);
  }

  PublishNoProjects(value: boolean) {
    this.noProjects.next(value);
  }

  publishStatusChange(value: any[]) {
    this.statusChange.next(value);
  }

  updateFirstProjectAccount(value: any) {
    this.firstProjectAccount.next(value);
  }
}
