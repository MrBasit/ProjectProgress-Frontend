import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAccountTemplatesComponent } from './project-account-templates.component';

describe('ProjectAccountTemplatesComponent', () => {
  let component: ProjectAccountTemplatesComponent;
  let fixture: ComponentFixture<ProjectAccountTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectAccountTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectAccountTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
