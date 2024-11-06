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
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-precios-venta.component.html',
  styleUrl: './mod-precios-venta.component.css'
})
export class ModPreciosVentaComponent implements OnInit{
  dataSource = new MatTableDataSource();
  columnasDesplegadas = ['nombre', 'modelo', 'precioventa', 'ubicacion'];
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
        modelo: element.modelo,
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
    swal({
      title: '¿Seguro que desea guardar los precios de venta?', 
      text: 'Se van a guardar los precios de venta de los productos a inventarear', 
      buttons: ['No', 'Si'], 
      icon: "warning"}).then((response: any) => {
        if(response){
          this.dialog.close(this.dataSource.data);
        }
      })
  }
}
