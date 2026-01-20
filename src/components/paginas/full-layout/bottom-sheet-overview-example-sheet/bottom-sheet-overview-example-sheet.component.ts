import { Component } from '@angular/core';
import {MatListModule} from '@angular/material/list';
import { inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import {ChangeDetectionStrategy, signal} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import { ModListadoComponent } from '../../administracion/mod-listado/mod-listado.component';
import { MatDialog } from '@angular/material/dialog';
import { ModDevolucionesConsultaComponent } from '../../operaciones/ventas/modales/mod-devoluciones-consulta/mod-devoluciones-consulta.component';
import { ModVentasComponent } from '../../operaciones/ventas/modales/mod-ventas/mod-ventas.component';
import { ModDetallespagoComponent } from '../../operaciones/ventas/modales/mod-detallespago/detallespago.component';
import { ModCategoriasComponent } from '../../operaciones/productos/listaproductos/mod-categorias/mod-categorias.component';
import { ModServiciosComponent } from '../../operaciones/productos/listaproductos/mod-servicios/mod-servicios.component';
import { AltaletrasComponent } from '../../operaciones/productos/altaletras/altaletras/altaletras.component';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-bottom-sheet-overview-example-sheet',
  imports: [MatListModule, MatExpansionModule],
  templateUrl: './bottom-sheet-overview-example-sheet.component.html',
  styleUrl: './bottom-sheet-overview-example-sheet.component.css'
})
export class BottomSheetOverviewExampleSheetComponent {
   constructor( private dialog: MatDialog,  public router: Router){

    }
  private _bottomSheetRef = inject<MatBottomSheetRef<BottomSheetOverviewExampleSheetComponent>>(MatBottomSheetRef);
  readonly panelOpenState = signal(false);
    abrirClientes(){
      this.dialog.open(ModListadoComponent,
        {
          maxWidth: '100vW',
          width: '90%'
        }
      )
    }
    abrirDevoluciones(){
        this.dialog.open(ModDevolucionesConsultaComponent,
          {
            maxWidth: '100vW',
            width: '90%',
            data: "devolucion"
          })
      }
      abrirVentas(){
        this.router.navigate(['/operaciones/historial']);
      }
      abrirDetallesPago(){
        this.dialog.open(ModDetallespagoComponent,
          {
            maxWidth: '100vW',
            width: '90%'
          }
        )
      }
       abrirCategorias(){
            this.dialog.open(ModCategoriasComponent, 
              { 
                maxWidth: '30vW',
                width: '100%',
              }
            )
          }
            abirServicio(){
              this.dialog.open(ModServiciosComponent,
                {
                  maxWidth: '60vW',
                  width: '80%'
                }
              )
            }
    
        abrirAltasLetras(){
          this.dialog.open( AltaletrasComponent, {
            width: '120%',
          })
        }
      abrirPagos(){
        this.dialog.open(ModDetallespagoComponent,
          {
            maxWidth: '100vW',
            width: '90%',
            data: "pago"
          })
    
      }
    
  logout(){
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('usuarioid');
      sessionStorage.removeItem('nombre');
      localStorage.removeItem('sucursalId');
      localStorage.removeItem('almacenId');
      localStorage.removeItem('navegacion');
      sessionStorage.removeItem('accesos');
      localStorage.removeItem('actual');
      this.router.navigate(['/login/iniciosesion']);
    }
  }
}
