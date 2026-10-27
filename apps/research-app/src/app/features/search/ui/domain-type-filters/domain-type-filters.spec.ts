import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainTypeFilters } from './domain-type-filters';

describe('DomainTypeFilters', () => {
  let component: DomainTypeFilters;
  let fixture: ComponentFixture<DomainTypeFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomainTypeFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DomainTypeFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
