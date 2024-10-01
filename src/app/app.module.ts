import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';


import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatComponentsModule } from './mat-components.modules';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { AddProjectComponent } from './components/add-project/add-project.component';
import { DeleteProjectComponent } from './components/delete-project/delete-project.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './components/loader/loader.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './auth.guard';
import { OtpComponent } from './components/otp/otp.component';
import { SignOutComponent } from './components/sign-out/sign-out.component';
import { OtpGuard } from './otp.guard';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { LoginGuard } from './login.guard';
import { ProjectAccountTemplatesComponent } from './components/project-account-templates/project-account-templates.component';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    ProjectsComponent,
    ProjectDetailsComponent,
    AddProjectComponent,
    DeleteProjectComponent,
    LoaderComponent,
    LoginComponent,
    RegisterComponent,
    OtpComponent,
    SignOutComponent,
    ProjectAccountTemplatesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatComponentsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'register', component: RegisterComponent, canActivate: [LoginGuard]  },
      { path: 'login', component: LoginComponent, canActivate: [LoginGuard]  },
      { path: 'otp', component: OtpComponent, canActivate: [OtpGuard] },
      { path: 'home', component: HomeComponent, canActivate: [OtpGuard, AuthGuard] }
    ])
  ],
  providers: [
    DatePipe, 
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
