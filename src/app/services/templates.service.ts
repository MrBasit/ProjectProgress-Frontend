import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  url= environment.url;
  constructor(private http: HttpClient) { }

  getTemplates(){
    return this.http.get(`${this.url}/api/ProjectAccountTemplate/GetTemplates`);
  }

  addTemplate(template){
    return this.http.post(`${this.url}/api/ProjectAccountTemplate/AddTemplate`, template);
  }
  updateTemplate(template){
    return this.http.post(`${this.url}/api/ProjectAccountTemplate/UpdateTemplate`, template);
  }
  deleteTemplate(id){
    const params ={
      TemplateId: id
    }
    return this.http.delete(`${this.url}/api/ProjectAccountTemplate/DeleteTemplate`,{params});
  }

}
