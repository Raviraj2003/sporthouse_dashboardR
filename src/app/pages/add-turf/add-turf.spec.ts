import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTurfComponent } from './add-turf';

describe('AddTurfComponent', () => {
  let component: AddTurfComponent;
  let fixture: ComponentFixture<AddTurfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTurfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTurfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
