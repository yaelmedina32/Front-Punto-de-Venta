import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../services/api.service';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { ElementRef } from '@angular/core';
export class Marcas{
  marcaId: number;
  nombre: string;
  nuevo: number;
}

@Component({
    selector: 'app-marcas',
    imports: [CompartidosModule],
    templateUrl: './marcas.component.html',
    styleUrl: './marcas.component.css'
})


export class MarcasComponent implements OnInit{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  usuarioId = 0;
  menu: any[] = [];
  menuId = 7;
  dataSource = new MatTableDataSource<Marcas>();
  columnasDeplegadas = ['nombre', 'acciones'];

  constructor(private api: ApiService, private session: SessionService,private renderer: Renderer2){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');}
  }
 
  ngOnInit(): void {
   
    this.session.validarSesion(this.menuId);
  }
  ngAfterViewInit(): void {
    this.cargarMarcas();

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
  cargarMarcas(){
    this.api.consultaDatos('marcas/marcas').subscribe((marcas: Array<Marcas>) => {
      this.dataSource = new MatTableDataSource<Marcas>(marcas);
      this.obtenerPermisoBotones();
    })
  }

  agregarMarca(){
    this.dataSource.data.push(
      {
        marcaId: 0,
        nombre: '',
        nuevo: 1,
      }
    )
    this.dataSource.filter = "";
  }

  
  guardarMarcas(){
    swal({title: 'Guardar Marcas', text: '¿Seguro que desea guardar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
      if(valor){
        this.api.insertarDatos('marcas/marcas', this.dataSource.data.filter(ele => ele.nuevo != 0)).subscribe({ 
          // Con el next manejo la respuesta exitosa
          next :(response: any) => {
          this.cargarMarcas();
        },
        // y ahi el error o respuesta negativa
          error: (error)=> {
            if(error.includes('Error code: 500')){
              swal ("Error en el back", "No es posible Actualizar los datos", "warning");
              return ;
            }else{
            console.error('error que recibi:',error);
              // Si hubo un error (ej. 400 Bad Request)
          swal("Datos No Insertados", "No es posible eliminar Marcas que están asociadas a un producto", "error");
          this.cargarMarcas();
        }
   
  }      
          
      })
      }
    })
  }
  editarMarca(marcaId: number){
    const indice = this.dataSource.data.findIndex(ele => ele.marcaId == marcaId);
    console.log(indice);
    swal({title: 'Editar Marcas', text: '¿Seguro que desea Actualizar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
      if(valor){
          this.dataSource.data[indice].nuevo = 2;
          console.log(this.dataSource.data[indice].nuevo)
        }
      })
    }
  eliminarMarcas(marcaId: number){
    const indice = this.dataSource.data.findIndex(ele => ele.marcaId == marcaId);
    swal({title: 'Eliminar Marca', text: '¿Seguro que desea Eliminar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
      if(valor){
          this.dataSource.data[indice].nuevo = 3;
        }
      })
    }
}
