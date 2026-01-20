import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { SessionService } from '../../../services/session.service';
import { RouterLink } from '@angular/router';
import { CompartidosModule } from '../../../modulos/compartidos.module';
export class Rechazos{
  motivoId: number;
  motivo: string;
  nuevo: number;
}
@Component({
    selector: 'app-rechazos',
    imports: [CompartidosModule],
    templateUrl: './rechazos.component.html',
    styleUrl: './rechazos.component.css'
})
export class RechazosComponent {
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  usuarioId = 0;
  menu: any[] = [];
  menuId = 7;
  dataSource = new MatTableDataSource<Rechazos>();
  columnasDeplegadas = ['motivo', 'acciones'];

  constructor(private api: ApiService, private session: SessionService,private renderer: Renderer2){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');}
  }
 
  ngOnInit(): void {
   
    this.session.validarSesion(this.menuId);
  }
  ngAfterViewInit(): void {
    this.cargarRechazos();

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
  cargarRechazos(){
    this.api.consultaDatos('operaciones/rechazos').subscribe((Rechazos: Array<Rechazos>) => {
      this.dataSource = new MatTableDataSource<Rechazos>(Rechazos);
      this.obtenerPermisoBotones();
    })
  }

  agregarRechazos(){
    this.dataSource.data.push(
      {
        motivoId: 0,
        motivo: '',
        nuevo: 1,
      }
    )
    this.dataSource.filter = "";
  }

  
  guardarRechazos(){
    swal({title: 'Guardar Rechazos', text: '¿Seguro que desea guardar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
      if(valor){
        this.api.insertarDatos('operaciones/rechazos', this.dataSource.data.filter(ele => ele.nuevo != 0)).subscribe({ 
          // Con el next manejo la respuesta exitosa
          next :(response: any) => {
          swal("Datos Insertados", "Se insertaron los datos correctamente", "success");
          this.cargarRechazos();
        },
        // y ahi el error o respuesta negativa
          error: (error)=> {
            console.log(error);
            if(error.includes('Error code: 500')){
              swal ("Error en el back", "No es posible Actualizar los datos", "warning");
              return ;
            }else{
            console.error('error que recibi:',error);
              // Si hubo un error (ej. 400 Bad Request)
          swal("Datos No Insertados", "No es posible eliminar Rechazos que están asociadas a un producto", "error");
          this.cargarRechazos();
        } }   
      })
      }
    })
  }
  editarRechazos(motivoId: number){
    const indice = this.dataSource.data.findIndex(ele => ele.motivoId == motivoId);
    console.log(indice);
    swal({title: 'Editar Rechazos', text: '¿Seguro que desea Actualizar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
      if(valor){
          this.dataSource.data[indice].nuevo = 2;
          console.log(this.dataSource.data[indice].nuevo)
        }
      })
    }
  eliminarRechazos(motivoId: number){
    const indice = this.dataSource.data.findIndex(ele => ele.motivoId == motivoId);
    swal({title: 'Eliminar Rechazos', text: '¿Seguro que desea Eliminar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
      if(valor){
          this.dataSource.data[indice].nuevo = 3;
          console.log(this.dataSource.data[indice].nuevo)
          swal("Rechazo eliminado", "Para eliminar el Rechazo Completamente, guarde los datos", "success");
        }
      })
    }
}


