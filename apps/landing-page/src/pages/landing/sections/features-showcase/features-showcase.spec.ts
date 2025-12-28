import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesShowcase } from './features-showcase';

describe('FeaturesShowcase', () => {
  let component: FeaturesShowcase;
  let fixture: ComponentFixture<FeaturesShowcase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesShowcase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesShowcase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
