import { Component, EventEmitter, inject, Inject, OnDestroy, OnInit, Output, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { VistaOC } from '../vista-oc/vista-oc';
import { OrdenesCompra } from '../compras.interface';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../../../services/api.service';
import { ModNofacturaComponent } from '../mod-nofactura/mod-nofactura.component';
import { MatDialog } from '@angular/material/dialog';
import { ModPagosComponent } from '../mod-pagos/mod-pagos.component';
import { ViewChildren } from '@angular/core';
import { ElementRef } from '@angular/core';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { VistaComprasService } from './vista-compras.service';
import { DatosProveedores } from '../../../operaciones/proveedores/listaproveedores/listaproveedores.interface';
import { Subscription } from 'rxjs';
import { ComprasService } from '../compras.service';
import { ComprasInventarioService } from '../compras_inventario.service';
import { ModPreciosVentaComponent } from '../../../operaciones/inventario/altainventario/mod-precios-venta/mod-precios-venta.component';
import { DatosOrdenCompra } from '../../../operaciones/inventario/altainventario/altainventario.component';

interface OrdenesCompraConProductos extends OrdenesCompra{
  productos: Array<any>;
}

@Component({
  selector: 'app-vista-compras',
  standalone: true,
  imports: [CompartidosModule, VistaOC],
  templateUrl: './vista-compras.html',
  styleUrl: './vista-compras.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class VistaCompras implements OnInit, AfterViewInit, OnDestroy{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  @Output() editarOC = new EventEmitter<void>();
  @Output() setOrdenCompraSeleccionada = new EventEmitter<OrdenesCompraConProductos>();
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  menu: any[] = [];
  displayedColumns: string[] = ['ordencompraid', 'solicitante', 'proveedor', 'ventas', 'fecha', 'importetotal', 'pendiente', 'nofactura', 'estatus', 'acciones'];

  displayedColumnsOC: string[] = ['consecutivo', 'producto', 'cantidad', 'unidad', 'preciounitario', 'importe'];

  dataSource = new MatTableDataSource<OrdenesCompra>();
  dataSourceAuxiliar : Array<OrdenesCompra> = [];
  filtroCambios: any [] = [];
  @ViewChild(MatPaginator)  set paginator(value: MatPaginator) { this.dataSource.paginator = value; }
  almacenId = 0;
  usuarioId = 0;

  vistaComprasService = inject(VistaComprasService);
  proveedor: DatosProveedores = {} as DatosProveedores;
  datosOC: Array<any> = [];

  private susbscription: Subscription = new Subscription();
  comprasService = inject(ComprasService);
  
  constructor(private api: ApiService, @Inject(Router) public router: Router, private dialog: MatDialog, private renderer: Renderer2){
    if (typeof window !== 'undefined') {
    this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
  }}
  ngAfterViewInit(): void {
    
    if(this.arregloElementos){
        this.obtenerPermisoBotones();
    }
  }

  setOrdenCompraSeleccionadaOC(ordenCompra: OrdenesCompra){
    this.api.consultaDatos('administracion/productos/ordencompra/' + ordenCompra.ordencompraid).subscribe((datosOC: Array<any>) => {
      this.setOrdenCompraSeleccionada.emit({...ordenCompra, productos: datosOC});
    });
  }

  // editarOC(ordencompraid: number){
  //   this.router.navigate(['/administracion/compras/editar-oc', ordencompraid]);
  // }
  
  ocInventarioService = inject(ComprasInventarioService);

  ngOnInit(): void {
    this.obtenerCatalogos()
    this.susbscription.add(
      this.comprasService.ocActualizada$.subscribe((actualizada) => {
        if (actualizada) {
          this.obtenerCatalogos();
          this.comprasService.resetNotificacion();
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.susbscription.unsubscribe();
  }
  
  cambiaVista = signal<boolean>(false);
  compraSeleccionada = signal<OrdenesCompra>({} as OrdenesCompra);
  verCompra(compra?: OrdenesCompra){
    if (compra) {
      this.compraSeleccionada.set(compra);
      this.cambiaVista.set(true);
    }
  }
  
  cambiarVista(valor: boolean){
    this.cambiaVista.set(valor);
  }

  async obtenerCatalogos(){
    this.api.consultaDatos('administracion/ordenescompra/' + this.almacenId  + '/compras').subscribe((ordenescompra: Array<OrdenesCompra>) => {
      this.dataSource = new MatTableDataSource<OrdenesCompra>(ordenescompra);
      this.dataSourceAuxiliar = ordenescompra;
    });
  }
  
   aceptarRechazarOC(aceptado: number, ordencompraid: number){
    swal({
      title: `${aceptado == 1 ? 'Aceptación ' : aceptado == 2 ? 'Rechazo ' : 'Cancelación' }de OC con folio ${ordencompraid}`,
      text: `¿Seguro que desea ${aceptado == 1 ? 'aceptar' : aceptado == 2 ? 'rechazar' : 'cancelar'} la OC?`,
      buttons: ['No', 'Si'],
      icon: 'warning'
    }).then((response: any) => {
      if(response){
        const datosAEnviar = {
          aceptado: aceptado,
          ordencompraid: ordencompraid
        }
        this.api.modificarDatos('administracion/estatus/ordencompra', datosAEnviar).subscribe((response: any) => {
          if(response.mensaje){
            this.obtenerCatalogos();
          }
        })
      }
    })
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

  async agregarFactura(ordencompraid: number){
    const inventario = await this.ocInventarioService.obtenerInventario(ordencompraid);
    const dialog = this.dialog.open(ModNofacturaComponent, {
        maxWidth: '70vW',
        width: '100%',
        data: {
          ordencompraid: ordencompraid,
        },
      });
  
      dialog.afterClosed().subscribe((response) => {
        if (response) {
          try{
            const dialogInventario = this.dialog.open(ModPreciosVentaComponent, {
              maxWidth: '70vW',
              data: inventario,
            });
            dialogInventario.afterClosed().subscribe((response) => {
              const productosArray: Array<any> = [];
              inventario.forEach((producto: DatosOrdenCompra) => {
                productosArray.push({
                  productoid: producto.productoid,
                  nombreproducto: producto.nombreproducto,
                  cantidad: (producto.cantidad - producto.cantidadinventario),
                  dot: '',
                  cantidadrestante: 0,
                  ubicaciones: [],
                  ubicacionid: response.find((ele: any) => ele.productoid == producto.productoid).ubicacionid,
                  precioventa: response.find((ele: any) => ele.productoid == producto.productoid).precioventa,
                  ordencompraid: ordencompraid,
                });   
              });
              this.api.insertarDatos('administracion/inventario', productosArray).subscribe((response) => {
                this.obtenerCatalogos(); 
                this.obtenerPermisoBotones(); 
              })
            })
          }catch(error){
            console.error(error);
          }
        }
      });
  }

  registrarAbono(ordencompraid: number) {
    const abonoDialog = this.dialog.open(ModPagosComponent, {
      maxWidth: '100vW',
      width: '70%',
      data: {
        ordencompraid: ordencompraid,
      },
    });
  
    abonoDialog.afterClosed().subscribe(() => {
      this.obtenerCatalogos();
      this.obtenerPermisoBotones();
    });
  }
  
  
  abrirOC(oc: number){
    this.router.navigate(['administracion/compras/vista/' + oc]);
  }
  //texto y objetos son del html, los elige y escribe el usuario
  filtrarDatos(texto: string, objeto: string ){
  //el findIndex busca la pocision y la almacena en indicecambios, esto cuando busque dentro del arreglo filtrarcambios  y encuentre el objeto que  coincioda
  //con el que escogio el usuario como nombre por ejemplo, si no esta dentro del arreglo fintrarcambios, se agrega con el push
  const  indiceCambios= this.filtroCambios.findIndex(ele => ele['objeto'] == objeto)
  if(indiceCambios == -1){
    this.filtroCambios.push({valor: texto, objeto: objeto})
    //si se estaba ya antes el objeto en filtrarcambios solo se le agrega el nuevo valor que ingreso el usuario 
  }else{
    this.filtroCambios[indiceCambios]['valor'] = texto;//se busca en la pocision de indicecambios para ingresarlo junto al objeto que ya estaba y se le agrega el valor:texto, como valor:25
  }
  //this.datasource es lo que se muestra y asi mismo es el nuevo arreglo que se esta filtrando
  //datasource es lo que se va a filtrar
  this.dataSource.data = this.dataSourceAuxiliar.filter((item:any)=>{
   let contador =0;
   //en cada iteracion de datasource se recorre el filtrarcambios para comparar el dato de datasorceauxiliar con el de filtrarcambios
   // ej. item puede ser   { nombre: "Juan", edad: 30 } y elem.objeto puede ser nombre por ende   item[element.objeto] es juan 
   //despues checa si se incluye o es lo mismo que element.valor, ej. si tambien es juan el contador aumenta
      this.filtroCambios.forEach(element =>{
        if(item[element.objeto] && item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){

        contador ++;
      }
      })
           //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL filtroCambios, ENTONCES LO DEVUELVE
           if (contador == this.filtroCambios.length) return item;
  })
  //se utiliza para eliminar un filtro de la lista filtroCambios en el caso de que el texto del filtro esté vacío.
  if(texto == ''){
    this.filtroCambios.splice(indiceCambios, 1);
    this.dataSource.data = this.dataSourceAuxiliar; // Restaurar los datos originales
}
  }
  cerrarModal(){
    this.dialog.closeAll();
  }

}
