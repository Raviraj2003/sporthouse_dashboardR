import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsmasterComponent } from './sportsmaster';

describe('SportsmasterComponent', () => {
  let component: SportsmasterComponent;
  let fixture: ComponentFixture<SportsmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SportsmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportsmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
