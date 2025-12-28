import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchCta } from './research-cta';

describe('ResearchCta', () => {
  let component: ResearchCta;
  let fixture: ComponentFixture<ResearchCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchCta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchCta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
