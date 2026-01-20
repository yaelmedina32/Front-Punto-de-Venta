import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, inject } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { ApiService } from '../../../../services/api.service';
import { OrdenesCompra } from '../compras.interface';
import { DatosProveedores } from '../../../operaciones/proveedores/listaproveedores/listaproveedores.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vista-oc',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './vista-oc.html',
  styleUrl: './vista-oc.css'
})
export class VistaOC implements OnInit, OnChanges {
  private api = inject(ApiService);

  ordencompra: Array<OrdenesCompra> = []
  @Input() ordenSeleccionada: OrdenesCompra = {} as OrdenesCompra;
  proveedor: DatosProveedores = {} as DatosProveedores;
  datosOC: Array<any> = [];
  displayedColumnsOC: string[] = ['unidad', 'producto','surtido',  'vendido',  'preciounitario', 'iva', 'preciounitarioiva', 'importe'];
  @Output() close = new EventEmitter<void>();

  constructor(private route: Router){

  }

  ngOnInit(): void {
    if (this.ordenSeleccionada.ordencompraid > 0) {
      this.obtenerOC(this.ordenSeleccionada.ordencompraid);
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ordenSeleccionada'] && this.ordenSeleccionada.ordencompraid > 0) {
      this.obtenerOC(this.ordenSeleccionada.ordencompraid);
    }
  }

  devolverTotalIVA(){
    return this.datosOC.reduce((acum, actual) => {
      acum += actual.totalIva;
      return acum;
    }, 0);
  }

  surtir(ordencompraid: number){
    this.route.navigateByUrl('/operaciones/inventario/alta?oc=' + this.ordenSeleccionada.ordencompraid);
  }

  obtenerOC(idOC: number) {
    this.api.consultaDatos('administracion/ordencompra/' + idOC).subscribe((ordencompra: Array<OrdenesCompra>) => {
      this.ordencompra = ordencompra;
      if (this.ordencompra.length > 0) {
        this.api.consultaDatos('operaciones/proveedor/' + this.ordencompra[0].proveedorid).subscribe((proveedor: Array<DatosProveedores>) => {
          this.proveedor = proveedor[0];
          this.api.consultaDatos('administracion/productos/ordencompra/' + idOC).subscribe((datosOC: Array<any>) => {
            this.datosOC = datosOC;
          });
        });
      }
    });
  }

  cerrar() {
    this.close.emit();
  }
}
