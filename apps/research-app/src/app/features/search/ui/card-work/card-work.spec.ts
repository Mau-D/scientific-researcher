import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardWork } from './card-work';

describe('CardWork', () => {
  let component: CardWork;
  let fixture: ComponentFixture<CardWork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardWork]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardWork);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
