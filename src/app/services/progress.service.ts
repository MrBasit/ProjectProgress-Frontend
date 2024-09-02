import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private url = environment.url;
  constructor(private http: HttpClient) {}

  addProgress(progressData){
    return this.http.post(`${this.url}/api/Progress/AddProgress`, progressData);
  }

  getProgressWithPagination(projectId: number, pageNumber: number, pageSize: number){
    const params = {
      projectId: projectId.toString(),
    };
    const body = {
      pageNumber: pageNumber,
      pageSize: pageSize
    };
  
    return this.http.post<any>(`${this.url}/api/Progress/GetProgress`, body, { params });
  }
}
