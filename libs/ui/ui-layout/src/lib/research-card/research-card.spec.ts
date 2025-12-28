import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchCard } from './research-card';

describe('ResearchCard', () => {
  let component: ResearchCard;
  let fixture: ComponentFixture<ResearchCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
