import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaludarComponent } from './saludar.component';

describe('SaludarComponent', () => {
  let component: SaludarComponent;
  let fixture: ComponentFixture<SaludarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaludarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaludarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
