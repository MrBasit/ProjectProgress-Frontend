import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  url= environment.url;
  constructor(private http: HttpClient) { }

  getTemplates(id){
    return this.http.post(`${this.url}/api/ProjectAccountTemplate/GetTemplates`, id);
  }

  addTemplate(template){
    return this.http.post(`${this.url}/api/ProjectAccountTemplate/AddTemplate`, template);
  }
  updateTemplate(template){
    return this.http.post(`${this.url}/api/ProjectAccountTemplate/UpdateTemplate`, template);
  }
  deleteTemplate(id: number) {
    return this.http.post(`${this.url}/api/ProjectAccountTemplate/DeleteTemplate/${id}`, {});
  }

}
