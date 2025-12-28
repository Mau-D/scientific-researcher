import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchShell } from './research-shell';

describe('ResearchShell', () => {
  let component: ResearchShell;
  let fixture: ComponentFixture<ResearchShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
