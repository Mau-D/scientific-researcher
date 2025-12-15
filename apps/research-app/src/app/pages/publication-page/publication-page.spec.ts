import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationPage } from './publication-page';

describe('PublicationPage', () => {
  let component: PublicationPage;
  let fixture: ComponentFixture<PublicationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
