import { Injectable } from '@angular/core';
import { BehaviorSubject,Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private SearchTermChanged = new Subject(); 
  private SortChanged = new Subject();
  private OnRefresh = new Subject(); 
  private OnAddProject = new Subject(); 
  private ProjectSelected = new Subject(); 
  private noProjects = new Subject(); 

  
  SearchTermChanged$ = this.SearchTermChanged.asObservable();
  SortChanged$ = this.SortChanged.asObservable();
  OnRefresh$ = this.OnRefresh.asObservable();
  OnAddProject$ = this.OnAddProject.asObservable();
  ProjectSelected$ = this.ProjectSelected.asObservable();
  noProjects$ = this.noProjects.asObservable();



  PublishSearchTermChanged(SearchTerm:string){
    this.SearchTermChanged.next(SearchTerm);
  }
  PublishSortChanged(SortId:number){
    this.SortChanged.next(SortId);
  }
  PublishOnRefresh(value: boolean){
    this.OnRefresh.next(value);
  }
  PublishOnAddProject(value: boolean){
    this.OnAddProject.next(value);
  }
  PublishProjectSelected(value: number){
    this.ProjectSelected.next(value);
  }
  PublishNoProjects(value: boolean){
    this.noProjects.next(value);
  }

}


// private events = new Map<string, BehaviorSubject<any>>();

  // constructor() {}

  // getEvent(eventName: string) {
  //   if (!this.events.has(eventName)) {
  //     this.events.set(eventName, new BehaviorSubject<any>(null));
  //   }
  //   return this.events.get(eventName)!.asObservable();
  // }

  // emitEvent(eventName: string, value: any) {
  //   if (!this.events.has(eventName)) {
  //     this.events.set(eventName, new BehaviorSubject<any>(value));
  //   } else {
  //     this.events.get(eventName)!.next(value);
  //   }
  // }

  // resetEvent(eventName: string) {
  //   if (this.events.has(eventName)) {
  //     this.events.get(eventName)!.next(null);
  //   }
  // }