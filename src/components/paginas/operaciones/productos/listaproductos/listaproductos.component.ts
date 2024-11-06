import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { RouterLink, Router } from '@angular/router';
import swal from 'sweetalert' ;
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../../../services/api.service';
import { ListaProductos } from './listaproductos.interface';
import { MatDialog } from '@angular/material/dialog';
import { ModCategoriasComponent } from './mod-categorias/mod-categorias.component';
import { AltaletrasComponent } from '../altaletras/altaletras/altaletras.component';
import { ModServiciosComponent } from './mod-servicios/mod-servicios.component';
import { SessionService } from '../../../../services/session.service';
import { QueryList } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ViewChildren } from '@angular/core';
@Component({
  selector: 'app-listaproductos',
  standalone: true,
  imports: [CompartidosModule, RouterLink],
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
  mostrarBotonEliminar: boolean = false;
  mostrarBotonEditar: boolean = false;
  columnasDesplegadas = ['clave', 'nombre', 'marca', 'modelo', 'categoria', 'acciones'];
  dataSource = new MatTableDataSource<ListaProductos>();
  dataSourceAuxiliar: ListaProductos[];
  @ViewChild(MatPaginator)  set paginator(value: MatPaginator) { this.dataSource.paginator = value; }
  constructor(private router: Router, private api: ApiService, private dialog: MatDialog, private session: SessionService, private renderer: Renderer2){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');}
  
  }
  toggleMostrarBoton() {
    this.mostrarBotonEditar = !this.mostrarBotonEditar;
  }
  toggleMostrarBotonE() {
    this.mostrarBotonEliminar = !this.mostrarBotonEliminar;
  }
  ngAfterViewInit(): void {
    this.arregloElementos = this.elementosBotones.toArray();
    console.log('arrreglo elementos botones',this.arregloElementos)
    }
  ngOnInit(){
    this.session.validarSesion(this.menuId);
    this.obtenerProductos();
  }

  bufferCambios: any[] = [];

  filtrarDatos(texto: string, objeto: string){
    console.log("asd");
      //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
      const indiceCambios = this.bufferCambios.findIndex(ele => (ele['objeto'] == objeto));
      if(indiceCambios == -1){
          this.bufferCambios.push({ valor:  texto , objeto: objeto });
      }else{
          //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
          this.bufferCambios[indiceCambios]['valor'] = texto;
      }
      //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
      this.dataSource.data = this.dataSourceAuxiliar.filter( (item: any) => {
          let contador = 0;
          //USO UN CONTADOR PARA IR CONTANDO LAS VECES QUE EL FILTRO ES CORRECTO, SE SUMA UNO POR CADA FILTRO CORRECTO DENTRO DEL VECTOR DE BUFFS
          //EL REGISTRO ES CORRECTO SI EL OBJETO DE ESE REGISTRO ACTUAL ES IGUAL AL TEXTO 
          this.bufferCambios.forEach( element=> {
              if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
                  contador++;
              }
          })
          //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL BUFFER, ENTONCES LO DEVUELÑVE
          if (contador == this.bufferCambios.length) return item;
      });
      //Y CUANDO EL FILTRO ESTÉ VACÍO, ENTONCES LO ELIMINO DEL BUFFER
      if(texto == ''){
          this.bufferCambios.splice(indiceCambios, 1);
      }

      //MANEJO EL BUFFER PORQUE EN CASO DE QUE APLIQUEN FILTROS EN DESORDEN, EL SISTEMA NO VA A SABER CUÁL FUE EL ANTERIOR
      //YA TENIENDO EL BUFFER, COMO RECORRE LOS FILTROS APLICADOS, ENTONCES NO IMPORTA EN QUÉ ORDEN LO MANEJES
  }

  abrirCategorias(){
    this.dialog.open(ModCategoriasComponent, 
      {
        maxWidth: '30vW',
        width: '100%',
      }
    )
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
  abirServicio(){
    this.dialog.open(ModServiciosComponent,
      {
        maxWidth: '60vW',
        width: '80%'
      }
    )
  }

  abrirAltasLetras(){
    this.dialog.open( AltaletrasComponent, {
      maxWidth: '40vw',
      width: '70%',
    })
  }

  abrirProducto(productoid: number, accion: string){
    this.router.navigate([`/operaciones/productos/alta/${productoid}/${accion}`]);
  }

  obtenerProductos(){
    this.api.consultaDatos('operaciones/productos').subscribe((productos: Array<ListaProductos>) => {
      this.dataSource = new MatTableDataSource<ListaProductos>(productos)
      this.dataSourceAuxiliar = this.dataSource.data;
      this.obtenerPermisoBotones();
    })
  }

  eliminarProducto(idProducto: number, nombreProducto: string){
    swal({text: `¿Seguro que desea eliminar el producto ${nombreProducto}?`, buttons:['No', 'Si']}).then((response) => {
      if(response){
        console.log("Se elimina el producto " + idProducto);
      }
    })
  }

  ubicacionProducto(productoid: number){
    this.router.navigate(['/operaciones/productos/ubicacion/' + productoid]);
  }

}
