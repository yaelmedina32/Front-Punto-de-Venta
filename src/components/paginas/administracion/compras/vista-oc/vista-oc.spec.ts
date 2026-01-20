import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaOC } from './vista-oc';

describe('VistaOC', () => {
  let component: VistaOC;
  let fixture: ComponentFixture<VistaOC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaOC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaOC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
