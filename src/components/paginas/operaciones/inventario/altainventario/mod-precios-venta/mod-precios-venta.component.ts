import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../../services/api.service';

export class Ubicaciones{
  ubicacionid: number;
  ubicacion: string;
}

@Component({
    selector: 'app-mod-precios-venta',
    imports: [CompartidosModule],
    templateUrl: './mod-precios-venta.component.html',
    styleUrl: './mod-precios-venta.component.css'
})
export class ModPreciosVentaComponent implements OnInit{
  dataSource = new MatTableDataSource();
  columnasDesplegadas = ['nombre', 'preciocompra', 'precioventa', 'ubicacion'];
  almacenId = 0;
  ubicaciones: Array<Ubicaciones> = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<any>, private api: ApiService){
    this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
  }
  ngOnInit(): void {
    this.data.forEach((element: any) => {
      this.dataSource.data.push({
        productoid: element.productoid,
        nombre: element.nombreproducto,
        preciounitario: element.preciounitario,
        precioventa: 0,
        ubicacionid: 0,
      });
    });
    this.cargarUbicaciones();
  }

  cargarUbicaciones(){
    this.api.consultaDatos('operaciones/ubicaciones/lista/formateadas/' + this.almacenId).subscribe((ubicaciones: Array<Ubicaciones>) => {
      this.ubicaciones = ubicaciones;
    })
  }

  guardarPrecios(){
    if(this.dataSource.data.some((element: any) => element.precioventa == 0)){
      swal("Precio de venta requerido", "Se requiere el precio de venta para poder continuar", "error");
      return;
    }
    this.dialog.close(this.dataSource.data);
  }
}
