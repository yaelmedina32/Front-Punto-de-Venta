import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { CommonModule } from '@angular/common';
import { MatCellDef } from '@angular/material/table';
import { SessionService } from '../../../services/session.service';
export class formasPago{
  tipoId: number;
  descripcion: string;
  nuevo: number = 0;
}
@Component({
  selector: 'app-formas-pago',
  standalone: true,
  imports: [CompartidosModule, CommonModule, MatCellDef],
  templateUrl: './formas-pago.component.html',
  styleUrl: './formas-pago.component.css'
})
export class FormasPagoComponent implements OnInit{
  menuId = 14;
  dataSource = new MatTableDataSource<formasPago>();
  tipoPagos: Array<any> = [];
  columnasDeplegadas = ['nombre', 'acciones'];
  constructor (private api: ApiService, private session: SessionService){}

  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
   this.cargarTipoPagos();
 }

 cargarTipoPagos(){
  this.api.consultaDatos('catalogos/formaspagos').subscribe((tipos: Array<formasPago>) => {
    console.log(tipos)
    this.dataSource = new MatTableDataSource<formasPago>(tipos);
    
  })
}
agregarFormaPago(){
  this.dataSource.data.push({ 
    tipoId: 0,
    descripcion: " ",
    nuevo: 1,
  })
  this.dataSource.filter = ""
}

guardarTipos(){
  swal({title: 'Guaradar formas de pago', text: '¿Seguro que desea guardar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
    if(valor){
      this.api.insertarDatos('catalogos/formaspagos', this.dataSource.data.filter(ele => ele.nuevo != 0)).subscribe((response: any) => {
        swal("Datos Insertados", "Se insertaron los datos correctamente", "success");
        this.cargarTipoPagos();
      })
    }
  })
}
editarLetra(tipoId: number){
  const indice = this.dataSource.data.findIndex(ele => ele.tipoId == tipoId);
  console.log(indice);
  swal({title: 'Editar Letra de velocidad', text: '¿Seguro que desea Actualizar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
    if(valor){
        this.dataSource.data[indice].nuevo = 2;
        console.log(this.dataSource.data[indice].nuevo)
      }
    })
  }
eliminarTipos(tipoId: number){
  const indice = this.dataSource.data.findIndex(ele => ele.tipoId == tipoId);
  swal({title: 'Eliminar formas de pago', text: '¿Seguro que desea Eliminar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
    if(valor){
        this.dataSource.data[indice].nuevo = 3;
        swal("Tipo eliminado", "Para eliminar el tipo, guarde los datos", "success");
      }
    })
  }
}
