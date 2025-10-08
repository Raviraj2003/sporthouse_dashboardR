import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTurfComponent } from './all-turf';

describe('AllTurfComponent', () => {
  let component: AllTurfComponent;
  let fixture: ComponentFixture<AllTurfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTurfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllTurfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
