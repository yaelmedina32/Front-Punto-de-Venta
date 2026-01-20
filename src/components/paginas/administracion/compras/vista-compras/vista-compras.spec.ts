import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaCompras } from './vista-compras';

describe('VistaCompras', () => {
  let component: VistaCompras;
  let fixture: ComponentFixture<VistaCompras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaCompras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaCompras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
