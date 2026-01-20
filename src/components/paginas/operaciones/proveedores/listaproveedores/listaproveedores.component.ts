import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { SessionService } from '../../../../services/session.service';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { ElementRef } from '@angular/core';
import { text } from 'node:stream/consumers';
export class Proveedor{
  proveedorid: string;
  nombre: string;
  telefono: string;
  rfc: string;
  calle: string;
  nointerior: string;
  noexterior: string;
  colonia: string;
  ciudad: string;
  municipio: string;
  estado: string;
  pais: string;
  email: string;
  cp: string;
  alias: string;
}

@Component({
    selector: 'app-listaproveedores',
    imports: [CompartidosModule, RouterLink],
    templateUrl: './listaproveedores.component.html',
    styleUrl: './listaproveedores.component.css'
})
export class ListaproveedoresComponent implements OnInit {
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  usuarioId = 0;
  menu: any[] = [];
  menuId=5;
  dataSource = new MatTableDataSource<Proveedor>();
  dataSourceAuxiliar :Array<Proveedor> = [];

  columnasDesplegadas = ['clave', 'nombre', 'estado', 'numero','alias','acciones'];

  constructor(private api: ApiService, private session: SessionService,private renderer: Renderer2){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');}
  }

  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
  }
  ngAfterViewInit(): void {
    this.cargarProveedores();
    }
    obtenerPermisoBotones() {
      this.api.consultaDatos('configuraciones/permisoBoton/' + this.usuarioId).subscribe({
        next: (permisos: any[]) => {
        const menu = permisos.map(permisos=> permisos.menuId);
        this.menu = menu;
        console.log(this.menu)
          console.log('Datos extraidos', permisos);
          this.permisosBotones = permisos;
          
          this.compararPermisosConBotones();
        },
        error: (error) => {
          console.error('Error al obtener permisos de botones:', error);
        }
      });
    }
    compararPermisosConBotones() {
      this.arregloElementos = this.elementosBotones.toArray();
      this.arregloElementos.forEach((elemento) => {
        const botonId = elemento.nativeElement.id; 
        const permisoEncontrado = this.permisosBotones.find(permiso => permiso.nombre === botonId);
        console.log(permisoEncontrado);
        if (permisoEncontrado) {
          console.log(`Permiso encontrado para el botón con id: ${botonId}`);
          this.renderer.setProperty(elemento.nativeElement, 'disabled', false); 
        } else {
          console.log(`No hay permiso para el botón con id: ${botonId}`);
          this.renderer.setStyle(elemento.nativeElement, 'display', 'none'); 
        }
      });
    }
  cargarProveedores(){
    this.api.consultaDatos('operaciones/proveedores').subscribe((proveedores: Array<Proveedor>) => {
      this.dataSource = new MatTableDataSource<Proveedor>(proveedores);
      this.dataSourceAuxiliar=proveedores;
      this.obtenerPermisoBotones();
    })
  }

  eliminarProveedor(proveedorid: number, nombre: string){
    swal({title: 'Eliminar Proveedor', text: '¿Seguro de que quiere eliminar el proveedor ' + nombre + '?', buttons: ['No', 'Si'], icon: 'warning'}).then((response: any) => {
      if(response){
        this.api.eliminarDatos('operaciones/proveedor/' + proveedorid).subscribe((respuesta: any) => {
          if(respuesta.affectedRows > 0){
            swal('Proveedor Eliminado', 'El proveedor ' + nombre + ' ha sido eliminado', 'success');
            this.cargarProveedores();
          }
        })
      }
    })
  }
  bufferCambios: any[] =[];
  filtrarDatos(texto:string, objeto:string){
    const indiceCambios = this.bufferCambios.findIndex(ele => ele['objeto']== objeto)
    if(indiceCambios==-1){
      this.bufferCambios.push({objeto:objeto, valor:texto});
    }else{
      this.bufferCambios[indiceCambios]['valor'] =texto;
    }
    this.dataSource.data= this.dataSourceAuxiliar.filter((item:any)=>{
     let contador =0;
        this.bufferCambios.forEach(element =>{
          if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
              contador++;
          }
        })
        if (contador == this.bufferCambios.length) return item;
    })
    if(texto == ''){
      this.bufferCambios.splice(indiceCambios, 1);
      this.dataSource.data = this.dataSourceAuxiliar;
  }
  }
}
