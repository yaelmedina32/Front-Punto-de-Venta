import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { Router } from '@angular/router';
import swal from 'sweetalert' ;
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../../../services/api.service';
import { ListaProductos } from './listaproductos.interface';
import { MatDialog } from '@angular/material/dialog';
import { SessionService } from '../../../../services/session.service';
import { QueryList } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModCotizacionesComponent } from './mod-cotizaciones/mod-cotizaciones.component';
@Component({
    selector: 'app-listaproductos',
    imports: [CompartidosModule],
    templateUrl: './listaproductos.component.html',
    styleUrl: './listaproductos.component.css'
})
export class ListaproductosComponent implements OnInit {
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  menu: any[] = [];
  usuarioId = 0;
  menuId = 3;
  mostrarBotonVer: boolean = false;
  mostrarBotonUP: boolean = false;
  mostrarBotonEliminar: boolean = false;
  mostrarBotonEditar: boolean = false;
  columnasDesplegadas = ['clave', 'nombre', 'marca', 'modelo', 'categoria','precioCompra', 'acciones'];
  dataSource = new MatTableDataSource<ListaProductos>();
  dataSourceAuxiliar: ListaProductos[];
  filtroNombre= new FormControl('');
  filtroMarca= new FormControl('');
  filtroModelo= new FormControl('');
  filtroCategoria= new FormControl('');
  filtroPrecioCompra= new FormControl('');

  @ViewChild(MatPaginator)  set paginator(value: MatPaginator) { this.dataSource.paginator = value; }
  constructor(private router: Router, private api: ApiService, private dialog: MatDialog, private session: SessionService, private renderer: Renderer2){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');}
  
  }
 
  ngAfterViewInit(): void {
    this.obtenerProductos();
    }
  ngOnInit(){
    this.session.validarSesion(this.menuId);
    
  }

  bufferCambios: any[] = [];

  filtrarDatos(texto: string, objeto: string){
    
      //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
      const indiceCambios = this.bufferCambios.findIndex(ele => (ele['objeto'] == objeto));
      if(indiceCambios == -1){
          this.bufferCambios.push({ valor:  texto , objeto: objeto });
      }else{
          //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
          this.bufferCambios[indiceCambios]['valor'] = texto;
      }
      //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
      
      // this.dataSource.data = this.dataSourceAuxiliar.filter( (item: any) => {
      //     let contador = 0;
      //     //USO UN CONTADOR PARA IR CONTANDO LAS VECES QUE EL FILTRO ES CORRECTO, SE SUMA UNO POR CADA FILTRO CORRECTO DENTRO DEL VECTOR DE BUFFS
      //     //EL REGISTRO ES CORRECTO SI EL OBJETO DE ESE REGISTRO ACTUAL ES IGUAL AL TEXTO 
      //     this.bufferCambios.forEach( element=> {
      //         if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
      //             contador++;
      //         }
      //     })
      //     //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL BUFFER, ENTONCES LO DEVUELÑVE
      //     if (contador == this.bufferCambios.length) return item;
      // });
      // //Y CUANDO EL FILTRO ESTÉ VACÍO, ENTONCES LO ELIMINO DEL BUFFER
      // if(texto == ''){
      //     this.bufferCambios.splice(indiceCambios, 1);
      // }

      // //MANEJO EL BUFFER PORQUE EN CASO DE QUE APLIQUEN FILTROS EN DESORDEN, EL SISTEMA NO VA A SABER CUÁL FUE EL ANTERIOR
      // //YA TENIENDO EL BUFFER, COMO RECORRE LOS FILTROS APLICADOS, ENTONCES NO IMPORTA EN QUÉ ORDEN LO MANEJES
  }


  obtenerPermisoBotones() {
    this.api.consultaDatos('configuraciones/permisoBoton/' + this.usuarioId).subscribe({
      next: (permisos: any[]) => {
      const menu = permisos.map(permisos=> permisos.menuId);
      this.menu = menu;
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
      if (permisoEncontrado) {
        this.renderer.setProperty(elemento.nativeElement, 'disabled', false); 
      } else {
        this.renderer.setStyle(elemento.nativeElement, 'display', 'none'); 
      }
    });
  }


  abrirProducto(productoid: number, accion: string){
    this.router.navigate([`/operaciones/productos/alta/${productoid}/${accion}`]);
  }

  obtenerProductos(){ 
    const datos = {
      filtroNombre: this.filtroNombre.value ? this.filtroNombre.value : '',
      filtroMarca: this.filtroMarca.value ? this.filtroMarca.value : '',
      filtroModelo: this.filtroModelo.value ? this.filtroModelo.value : '',
      filtroCategoria: this.filtroCategoria.value ? this.filtroCategoria.value : '',
      filtroPrecioCompra: this.filtroPrecioCompra.value ? this.filtroPrecioCompra.value : ''
    }
    this.api.consultaDatosPost('operaciones/productos', datos).subscribe((productos: Array<ListaProductos>) => {
      console.log(productos);
      this.dataSource = new MatTableDataSource<ListaProductos>(productos)
      this.dataSourceAuxiliar = this.dataSource.data;
      //this.obtenerPermisoBotones();
    })
    
  }
   imprimirCotizacion(productoid:number){
 
    this.api.consultaDatos('operaciones/imprimircotizacion/'+ productoid ).subscribe((response) => {

      if(response){
        console.log('El ticket se imprimio correctamente',response)
      }
      else{
        console.log('No se imprimio el ticket',response)
      }
    });
  }


  eliminarProducto(idProducto: number, nombreProducto: string){
    swal({title: `Eliminar ${nombreProducto}`, text: `¿Seguro que desea eliminar el producto ${nombreProducto}?`, icon: "warning", buttons: ['No', 'Si']}).then((response) => {
      this.api.eliminarDatos('operaciones/producto/' + idProducto).subscribe({
        next: (response) => {
          swal("Producto eliminado correctamente", "Se eliminó el producto correctamente", "success");
          this.obtenerProductos();
        },
        error: (error) => {
          console.log(error.includes('Error code: 400'))
          if(error.includes('Error code: 400')){
            swal("Error al eliminar el producto", "Hay ventas hechas con este producto, no es posible eliminarlo", "error");
            return;
          }
          swal("Error al eliminar el producto", "Hubo un problema al eliminar el producto", "error");
          console.error(error);
        },
      })
    })
  }

  abrirHistorial(){
      this.dialog.open(ModCotizacionesComponent,
        {
          maxWidth: '90vW',
          width: '90%',
        }
      )
    }

}
