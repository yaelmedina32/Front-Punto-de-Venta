import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { UbicacionProducto } from './ubicacionproducto.interface';

@Component({
  selector: 'app-ubicacionproducto',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './ubicacionproducto.component.html',
  styleUrl: './ubicacionproducto.component.css'
})
export class UbicacionproductoComponent implements OnInit{
  ruta: any;
  dataSource = new MatTableDataSource<UbicacionProducto>();
  columnasDesplegadas = ['clave', 'nombre', 'ubicacion', 'acciones'];
  ubicacionFiltrada: Observable<any>;
  ubicacion = new FormControl();
  ubicaciones: Array<any> = [];
  productoId: any;
  ubicacionesAuxiliar: Array<any> = [];
  almacenId = 0;
  constructor( private cdref: ChangeDetectorRef, private api: ApiService, private route: ActivatedRoute) {
    if (typeof window !== 'undefined') {
      this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
    }
  }  

  ngAfterContentChecked(){
    this.cdref.detectChanges()
  }

  ngOnInit(): void {
    if(this.almacenId != 0){
      this.ruta = this.route.params.subscribe(parametros => {
        this.productoId = parametros['idproducto']
        this.obtenerCatalogos();
      })
    }else{
      swal("Almacén no seleccionado.", "Seleccione almacén para continuar", "warning");
    }
  }

  obtenerCatalogos(){
    this.api.consultaDatos('operaciones/producto/ubicacion/' + this.productoId + '/' + this.almacenId).subscribe((productos: Array<UbicacionProducto>) => {
      this.dataSource.data = productos;
      this.api.consultaDatos('operaciones/ubicaciones/lista/formateadas/' + this.almacenId).subscribe((ubicaciones: Array<any>) => {
        this.ubicaciones = ubicaciones;
        this.ubicacionesAuxiliar = ubicaciones;
        this.ubicacionFiltrada = this.ubicacion.valueChanges.pipe(
          startWith(''),
          map((value: string) => this.filtrarUbicacion(value))
        );
        this.comprobarUbicaciones();
      })
    })
  }

  filtrarUbicacion(valor: string){
    return this.ubicaciones.filter(ele => ele.ubicacion.split('-').join('').toLowerCase().includes(valor.toLowerCase()) || ele.ubicacion.includes(valor.toLowerCase()));
  }

  pruebaCambio(event: any){
    console.log(event);
  }

  editarRegistro(ubicacion: string){
    const indice = this.dataSource.data.findIndex(ele => ele.ubicacion == ubicacion);
    this.dataSource.data[indice].nuevo = 2;
  }
  agregarRegistro(){
    const indice = this.dataSource.data.length - 1;
    this.dataSource.data.push(
      {
        id: 0,
        ubicacion: '',
        productoid: this.dataSource.data[indice].productoid,
        clave: this.dataSource.data[indice].clave,
        producto: this.dataSource.data[indice].producto,
        ubicacionid:0,
        almacenid: this.almacenId,
        nuevo: 1
      }
    )
    this.dataSource.filter = "";
  }
  guardarProducto(){
    console.log(this.dataSource.data);
    swal({text: "¿Desea guardar la asignación de ubicaciones?", buttons:['No', 'Si'], icon: "warning"}).then((response) =>{
      if(response){
        this.api.insertarDatos('operaciones/ubicaciones/producto', this.dataSource.data).subscribe(response => {
          if(response.error){
            swal("Error", "Consulte al desarrollador", "error");
            return;
          }
          swal("Datos insertados.", "Se insertaron los datos correctamente", "success");
          this.obtenerCatalogos();
        })
      }
    })
  }

  comprobarUbicaciones(){
    this.ubicaciones = [...this.ubicacionesAuxiliar];
    this.dataSource.data.forEach((registro: any) => {
      const indice = this.ubicaciones.findIndex(ele => ele.ubicacionid == registro.ubicacionid)
      console.log(indice);
      this.ubicaciones[indice].usado = 1;
    })
  }
}
