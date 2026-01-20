import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarOc } from './generar-oc';

describe('GenerarOc', () => {
  let component: GenerarOc;
  let fixture: ComponentFixture<GenerarOc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarOc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarOc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
