import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { CommonModule } from '@angular/common';
import { MatCellDef } from '@angular/material/table';
import { SessionService } from '../../../services/session.service';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChildren } from '@angular/core';
export class formasPago{
  tipoId: number;
  descripcion: string;
  nuevo: number = 0;
}
@Component({
    selector: 'app-formas-pago',
    imports: [CompartidosModule, CommonModule, MatCellDef],
    templateUrl: './formas-pago.component.html',
    styleUrl: './formas-pago.component.css'
})
export class FormasPagoComponent implements OnInit{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  usuarioId = 0;
  menu: any[] = [];
  menuId = 14;
  dataSource = new MatTableDataSource<formasPago>();
  tipoPagos: Array<any> = [];
  columnasDeplegadas = ['nombre', 'acciones'];
  constructor (private api: ApiService, private session: SessionService,  private renderer: Renderer2){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');}
  }

  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
  
 }
 ngAfterViewInit(): void {
  this.cargarTipoPagos();
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
    console.log('arreglo elementos botones',this.arregloElementos)
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

 cargarTipoPagos(){
  this.api.consultaDatos('catalogos/formaspagos').subscribe((tipos: Array<formasPago>) => {
    console.log(tipos)
    this.dataSource = new MatTableDataSource<formasPago>(tipos);
    this.obtenerPermisoBotones();
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
      this.api.insertarDatos('catalogos/formaspagos', this.dataSource.data.filter(ele => ele.nuevo != 0)).subscribe({ 
        next:(response: any) => {
        this.cargarTipoPagos();
      },
      error: (error)=> {
        if(error.includes('Error code: 500')){
          swal ("Error en el back", "No es posible Actualizar los datos", "warning");
          return ;
        }else{
        console.error('error que recibi:',error);
          // Si hubo un error (ej. 400 Bad Request)
      swal("Datos No Insertados", "No es posible eliminar Formas de Pago que están asociadas a un producto", "error");
      this.cargarTipoPagos();
    }

      }
    });
    }
  })
}
editarFormasPago(tipoId: number){
  const indice = this.dataSource.data.findIndex(ele => ele.tipoId == tipoId);
  console.log(indice);
  swal({title: 'Editar Forma de pago', text: '¿Seguro que desea Actualizar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
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
        swal("Tipo de Pago eliminado", "Para eliminar el tipo, guarde los datos", "success");
      }
    })
  }
}
