import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../services/api.service';
import { ModDevolucionComponent } from '../mod-devolucion/mod-devolucion.component';

@Component({
  selector: 'app-mod-edicion-ventas',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-edicion-ventas.component.html',
  styleUrl: './mod-edicion-ventas.component.css'
})
export class ModEdicionVentasComponent implements OnInit{

  dataSource = new MatTableDataSource<any>();
  columnasDesplegadas = ['producto', 'precioventa', 'dot', 'eliminar']

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialog: MatDialog) {}
  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(){
    this.api.consultaDatos('operaciones/detalle/inventario/venta/' + this.data.ventaid).subscribe((detalles: Array<any>) => {
      this.dataSource.data = detalles;
    })
  }

  cambiarProducto(inventarioid: number){
    swal(
      {
        title: 'Cambiar Producto',
        text: `¿Seguro que desea cambiar este producto del folio de venta ${this.data.ventaid}?
         Se marcará como dañado y se intercambiará por el que usted seleccione. 
         ${this.dataSource.data.length == 1 ? '\nNOTA: Si cancela este producto la venta se cancelará automáticamente.' : ''} `,
        buttons: ['No', 'Si'],
        icon: "warning",
      }
    ).then((response) => {
      if(response){
        const datos = {
          inventarioid: inventarioid,
          preciounitario: this.dataSource.data.find((ele:any) => ele.inventarioid == inventarioid)?.precioventa,
          cancelada: false,
          cambio: true,
        }
        const dialog = this.dialog.open(ModDevolucionComponent,
          {
            maxWidth: '100vW',
            width: '60%',
            data: datos
          }
        )
        dialog.afterClosed().subscribe((response )=> {
          swal("Devolución completada", "Se hizo la devolución correctamente", "success");
          this.cargarProductos();
        })
      }
    })
  }

  eliminarVenta(inventarioid: number){
    swal(
      {
        title: 'Devolver producto', 
        text: `¿Seguro que desea eliminar este producto del folio de venta ${this.data.ventaid}?
         Se regresará al almacén. ${this.dataSource.data.length == 1 ? '\nNOTA: Si cancela este producto la venta se cancelará automáticamente.' : ''} `,
        buttons: ['No', 'Si'],
        icon : "warning",
      }).then((response) => {
        if(response){
          const datos = {
            inventarioid: inventarioid,
            preciounitario: this.dataSource.data.find((ele:any) => ele.inventarioid == inventarioid)?.precioventa,
            cancelada: this.dataSource.data.length == 1,
          }
          const dialog = this.dialog.open(ModDevolucionComponent,
            {
              maxWidth: '100vW',
              width: '60%',
              data: datos
            }
          )
          dialog.afterClosed().subscribe((response )=> {
            swal("Devolución completada", "Se hizo la devolución correctamente", "success");
            this.cargarProductos();
          })
        }
      })
  }
}
