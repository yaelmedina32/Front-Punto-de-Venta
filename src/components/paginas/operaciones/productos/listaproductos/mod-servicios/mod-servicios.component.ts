import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { ApiService } from '../../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'app-mod-servicios',
    imports: [CompartidosModule],
    templateUrl: './mod-servicios.component.html',
    styleUrl: './mod-servicios.component.css'
})
export class ModServiciosComponent implements OnInit{
  columnasDesplegadas = ['clave', 'nombre', 'precio', 'acciones'];
  dataSource = new MatTableDataSource<any>();
  constructor(private api: ApiService) { }
  ngOnInit(): void {
    this.cargarServicios();
  }

  eliminarProducto(indice: number){
    this.dataSource.data[indice].productoid == 0 ? this.dataSource.data.splice(indice, 1) : this.dataSource.data[indice].nuevo = 3;
    this.dataSource.filter = "";
  }

  validarInput(indice: number, valor: number){
    if(valor < 0){
      swal("Error en el precio", "No puede haber precios menores que 0", "error");
      this.dataSource.data[indice].precio = 0;
      return;
    }
  }

  guardarServicios(){
    if(this.dataSource.data.some(ele => ele.nombre == '')){
      swal("Error en los nombres","No puede haber campos vacíos en el nombre", "error");
      return;
    }
    if(this.dataSource.data.some(ele => ele.precio == 0)){
      swal("Error en los precios","No puede haber precios iguales o menores que 0", "error");
      return;
    }
    swal({text: '¿Seguro que desea guardar lo servicios actuales?', title: 'Guardar Servicios', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        this.api.insertarDatos('operaciones/servicios', this.dataSource.data.filter(ele => ele.nuevo != 0)).subscribe((response) =>{
          swal("Datos insertados", "Se insertaron los servicios correctamente", "success");
          this.cargarServicios();
        })
      }
    })
  }

  agregarServicio(){
    this.dataSource.data.push(
      {
        productoid: 0,
        nombre: '',
        precio: 0.0,
        nuevo: 1
      }
    )
    this.dataSource.filter = "";
  }

  cargarServicios(){
    this.api.consultaDatos('operaciones/productos/servicios').subscribe((categorias) => {
      this.dataSource.data = categorias;
    })
  }
}
