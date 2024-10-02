import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverProjectComponent } from './recover-project.component';

describe('RecoverProjectComponent', () => {
  let component: RecoverProjectComponent;
  let fixture: ComponentFixture<RecoverProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecoverProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
