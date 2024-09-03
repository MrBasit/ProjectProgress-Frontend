import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private url = environment.url;
  private projectsSubject = new BehaviorSubject<any[]>([]);
  projects$ = this.projectsSubject.asObservable();

  constructor(private http: HttpClient){}

  getProjectsByAccountName(accountId: number, pageNumber: number, pageSize: number,searchValue: string, sortValue : number, statusArr: any) {
    const body = {
      sortDetails: {
        sortColumn: sortValue,
        sortDirection: 0
      },
      paginationDetails: {
        pageNumber: pageNumber,
        pageSize: pageSize
      },
      searchDetails: {
        searchTerm: searchValue
      },
      accountId: accountId,
      statuses: statusArr.map((status) => ({
        id: status.id,
        name: status.name
      }))
    }
    return this.http.post<any>(`${this.url}/api/Projects/GetProjects`, body);
  }
  
  getProjectById(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.url}/api/Projects/GetProject`, {
      params: { ProjectId: projectId.toString() }
    });
  }

  addProject(projectData: any): Observable<any> {
    return this.http.post<any>(`${this.url}/api/Projects/AddProject`, projectData)
  }

  deleteProject(id: number){
    return this.http.post<any>(`${this.url}/api/Projects/DeleteProject`, id)
  }
  getStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/api/Status/GetStatuses`);
  }
  editProject(projectData: any){
    return this.http.post(`${this.url}/api/Projects/EditProject`, projectData)
  }
}
