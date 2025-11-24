import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MutedButton } from './muted-button';

describe('MutedButton', () => {
  let component: MutedButton;
  let fixture: ComponentFixture<MutedButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MutedButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MutedButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
