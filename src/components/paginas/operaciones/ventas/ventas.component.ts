import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { SessionService } from '../../../services/session.service';
import { ApiService } from '../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ModAutorizacionComponent } from './modales/mod-autorizacion/mod-autorizacion.component';
import { ModVentasComponent } from './modales/mod-ventas/mod-ventas.component';
import { ModAbonosDeudasComponent } from '../cuentas-x-cobrar/mod-abonos-deudas/mod-abonos-deudas.component';
import { ModArmarVentaComponent } from './mod-armar-venta/mod-armar-venta.component';
import{ FormControl } from '@angular/forms';
import { lastValueFrom, map, Observable, startWith } from 'rxjs';
import { ModClientesComponent } from '../../administracion/clientes/clientes.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Inventario } from '../inventario/lista-inventario/lista-inventario.component';
import { NotificationService } from '../../../services/notification.service';

interface Cliente{
  nombreCliente: string;
  numeroCliente: string;
}

export class HistorialVenta{
  folioventa: number;
}
export class InventarioDisponible  {
  dot: string;
  nombre: string;
  cantidad: number;
}
export class servicio{
  productoid: number;
  nombre: string;
  precio: string;
  nuevo: number;
  seleccionadoS: boolean;
 
}
export class Venta{
  nombreproducto: string;
  nombrefiltro: string;
  modelo: string;
  marca: string;
  productoid: number;
  dot: string;
  inventarioid: number;
  cantidad: number;
  precioventa: string;
  ubicacionFiltrado: string;
  total: number;
  descuento: number;
  autorizadoDescuento: boolean;
  seleccionado: boolean;
  inventarios: any[];
}

export class PagoMixto{
  tipoid: number;
  monto: number;
}

@Component({
    selector: 'app-listaventas',
    imports: [CompartidosModule,MatTooltipModule],
    templateUrl: './ventas.component.html',
    styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit, AfterViewInit{
  valorFiltro : any;
  myControl = new FormControl('');
  mezclaDatos:Array<any> = [];
  mezclaDatosAuxiliar:Array<any> = [];
  dataHistorial : number;
  totalPrecioventa: Array<any> = [];
  totalVentaFinal = 0;
  totalVentaFinal2 = 0;
  servicioSeleccionado: Array<any> = [];
  desplazarse = false;
  datosConfirmVenta: Array<any> = [];
  servicioAct: Array<any> = [];
    cliente = new FormControl();
    clientesFiltrados: Observable<any>;
    clientes: Array<string> = [];

    numeroCliente = new FormControl();
    numerosClientesFiltrados: Observable<any>;
    numeroClientes: Array<any> = [];
  clientesNumero: Array<Cliente> = [];
   servicios: Array<any> = [];
   serviciosOficial: Array<any> = [];
   productos: Array<any> = [];
   dataSourceFinal = new MatTableDataSource<any>();
   dataSourceServicios = new MatTableDataSource<servicio>();
  dataSourceProductos = new MatTableDataSource<Venta>();
  dataSourcePagosMixtos = new MatTableDataSource<PagoMixto>();
  inventarioDisponible: Array<InventarioDisponible> = [];
  sucursalId = 0;
  usuarioId = 0;
  cantidadServicio=1;
  turnoId = 0;
  columnasDesplegadas3 = ['nombre', 'marca', 'modelo', 'dot', 'ubicacion', 'precioventa', 'cantidad', "descuento", "acciones"];
  columnasDesplegadas2 = ['seleccionar','nombre', 'precio'];
  columnasDesplegadas = ['seleccionar', 'nombre', 'marca', 'modelo', 'dot', 'ubicacion', 'precioventa'];
  columnasDesplegadasMixtos = ['descripcion', 'monto', 'eliminar']
  totalVenta = 0;
  totalVentaServicio = 0;
  turnoAbierto = false;
  tipoPagos: Array<any> = [];
  servicioActualizado: Array<servicio> = [];
  tipoPagosMixtos: Array<any> = [];
  //EL 5 ES CON EFECTIVO DENTRO DE LA TABLA DE "TIPOPAGO"
  tipoPagoId = 5;
  pagoMixto = [];
  dataSourceAuxiliar: Venta[];
  dataSourceAuxiliarServicios: servicio[];
  dataSourceAuxiliarFinal: any[];
  seleccionados: Venta[] = [];
  menuId = 2
  almacenId = 0;
  totalLlantas = 0;
  filteredOptions: Observable<string[]>;

  serviciosEdicion: servicio[] = [];
  productosEdicion: Inventario[] = [];

  subTotal = 0;
  IVA = 0;
  banderaIVA = false;
  

  constructor(private sesion: SessionService, private api: ApiService, private dialog: MatDialog, private route: ActivatedRoute
    , private notification: NotificationService){  
    const router = inject(Router);
    const navigation = router.currentNavigation();
    if(navigation?.extras.state){
      const datosRecibidos = navigation.extras.state['inventario'];
      console.log(datosRecibidos)
      this.subTotal = datosRecibidos.reduce((acum: number, actual: Inventario) => acum += parseFloat((actual.total || '0').toString()), 0) 
      console.log(this.subTotal)

      this.productosEdicion = [...datosRecibidos.filter((ele: Inventario) => ele.inventarioid !== 0)];
      
      for(let ele of datosRecibidos.filter((ele: Inventario) => ele.inventarioid !== 0)){
        this.dataSourceProductos.data.push({...ele, precioventa: parseFloat(ele.precioventa.toString()), seleccionado: true})
      }
      this.serviciosEdicion = [...datosRecibidos.filter((ele: Inventario) => ele.inventarioid === 0).map((ele: any) => ({productoid: ele.productoid, nombre: ele.nombre, precio: parseFloat(ele.total || '0'), nuevo: ele.nuevo, seleccionadoS: true}))];
      // this.dataSourceServicios.data = [...datosRecibidos.filter((ele: Inventario) => ele.inventarioid === 0).map((ele: any) => ({...ele, seleccionados: true, precio: parseFloat(ele.precioventa.toString())}))];
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.sesion.validarSesion(this.menuId);
    }
  }

  seleccionarCliente(event: MatAutocompleteSelectedEvent){
    const cliente = event.option.value;
    this.cliente.setValue(cliente);
    this.numeroCliente.setValue(this.clientesNumero.find(ele => ele.nombreCliente == cliente)?.numeroCliente);
  }

  seleccionarNumeroCliente(event: MatAutocompleteSelectedEvent){
    const numeroCliente = event.option.value;
    this.numeroCliente.setValue(numeroCliente);
    this.cliente.setValue(this.clientesNumero.find(ele => ele.numeroCliente == numeroCliente)?.nombreCliente);
  }

  calcularTotalVenta(switchIva: boolean, subTotal: number = 0){
    this.IVA =  switchIva ? this.totalVenta * 0.16 : 0;
    console.log(this.subTotal)
    this.totalVenta = switchIva ? this.subTotal + this.IVA : this.subTotal;
    this.totalVentaFinal = this.totalVenta;
  }

  agregarProducto(){
    //Esta función sirve más que nada para hacer los cálculos de los subtotales y los totales de la venta

    //Primero se calcula el subtotal de la venta
    this.subTotal = (this.dataSourceAuxiliar.filter(ele => ele.seleccionado)
      .reduce((acum: number, actual: any) => acum += parseFloat((actual.precioventa || '0').toString()) , 0)) 
          +
        (this.dataSourceAuxiliarServicios.filter(ele => ele.seleccionadoS)
      .reduce((acum: number, actual: any) => acum += parseFloat(actual.precio), 0));
      this.datosConfirmVenta = this.dataSourceAuxiliar.filter(ele => ele.seleccionado).map(ele =>({...ele, productoid:0}))
      console.log(this.subTotal)
      this.totalVenta = this.subTotal;

      this.totalVentaServicio = this.dataSourceAuxiliarServicios.filter(ele => ele.seleccionadoS)
        .reduce((acum, actual) => acum += parseFloat(actual.precio), 0);
      const seleccionadosDataSource2 = this.dataSourceAuxiliarServicios.filter(ele => ele.seleccionadoS).length == 0 
        ? this.dataSourceServicios.filter = ""
        : this.dataSourceAuxiliarServicios.filter(ele => ele.seleccionadoS).map(ele => ({ ...ele, inventarioid: 0, cantidad: 1, descuento: 0,modelo: '',marca: '', dot: '', }));
      const serviciosPrevios = this.dataSourceFinal.data.filter(ele => ele.identificador == 1 ); 
      this.datosConfirmVenta = [...serviciosPrevios,...this.datosConfirmVenta, ...seleccionadosDataSource2 ];

      this.dataSourceFinal.data =    this.datosConfirmVenta;
      this.dataSourceAuxiliarFinal = this.dataSourceFinal.data;



    const totalPrecioProducto = this.dataSourceFinal.data
      .filter(ele => ele.seleccionado && ele.precioventa)
      .reduce((acc, ele) => acc + (parseFloat(ele.precioventa) - parseFloat(ele.descuento)), 0);
    
    const totalPrecioServicio = this.dataSourceFinal.data
      .filter(ele => ele.seleccionadoS && ele.precio)
      .reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);
    
      
    const totalPreciosProductoAbajo = this.dataSourceFinal.data
      .filter(ele => !ele.seleccionado && ele.productoid == 0)
      .reduce((acc, ele) => acc + (parseFloat(ele.precioventa)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);
    
    const totalPreciosServiciosAbajo = this.dataSourceFinal.data
      .filter(ele => !ele.seleccionadoS && ele.inventarioid==0)
      .reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);
    
    const sumaDeNumeros = totalPrecioProducto + totalPrecioServicio + totalPreciosProductoAbajo + totalPreciosServiciosAbajo;
  
    this.totalVentaFinal = sumaDeNumeros ;
    this.subTotal = sumaDeNumeros;
    this.calcularTotalVenta(this.banderaIVA);
  }
  
  guardarDescuento(element: any){
    if (element.descuento == null || element.descuento === '') {
    element.descuento = 0;
      
    }
    

  const totalPrecioProducto = this.dataSourceFinal.data
  .filter(ele => ele.seleccionado && ele.precioventa)
  .reduce((acc, ele) => acc + (parseFloat(ele.precioventa) - parseFloat(ele.descuento)), 0);

const totalPrecioServicio = this.dataSourceFinal.data
  .filter(ele => ele.seleccionadoS && ele.precio)
  .reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);

  
const totalPreciosProductoAbajo = this.dataSourceFinal.data
.filter(ele => !ele.seleccionado && ele.productoid == 0)
.reduce((acc, ele) => acc + (parseFloat(ele.precioventa)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);

const totalPreciosServiciosAbajo = this.dataSourceFinal.data
.filter(ele => !ele.seleccionadoS && ele.inventarioid==0)
.reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);

  const sumaDeNumeros = totalPrecioProducto + totalPrecioServicio + totalPreciosProductoAbajo + totalPreciosServiciosAbajo;

this.totalVentaFinal = sumaDeNumeros ;
  }

  limpiarSeleccion(){
    this.dataSourceAuxiliar.map(ele => ele.seleccionado = false);
    this.dataSourceAuxiliarServicios.map(ele => ele.seleccionadoS = false);
    this.cliente.setValue('');
    this.numeroCliente.setValue('');
    this.agregarProducto();
    this.desplazarse = false;
  }

  folioVenta: number = 0;

  ngOnInit(): void {
    this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
    this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
    this.cargarTipoPagos();
    this.obtenerInventario();

    this.cargarFuncionesAsincronas();
    // this.cargarClientes();

    this.route.queryParams.subscribe(params => {
      //En dado caso de que no tenga el folio en la url, quiere decir que va a ser una venta nueva, si lo tiene, entonces se va a editar una venta existente
      if(params['folio']){
        this.folioVenta = parseInt(params['folio']);
      }
    });
  }

  async cargarFuncionesAsincronas() {
    await Promise.all([
      this.cargarServicios(),
      this.cargarInventario()
    ]);

    await this.comprobarTurno();
  }

bufferCambios: Map<string, string> = new Map();

filtroNombreProducto = new FormControl('');
filtroMarca = new FormControl('');
filtroModelo = new FormControl('');
filtroDot = new FormControl('');
filtroUbicacion = new FormControl('');


filtrarDatos(texto: string, objeto: string) {
  const nombreFiltro = this.filtroNombreProducto.value;
  const marcaFiltro = this.filtroMarca.value;
  const modeloFiltro = this.filtroModelo.value;
  const dotFiltro = this.filtroDot.value;
  const ubicacionFiltro = this.filtroUbicacion.value;
  this.dataSourceProductos.data = this.dataSourceAuxiliar.filter(ele => {
    const nombreProducto = ele.nombreproducto.toLowerCase();
    const nombreProductoFiltrado = ele.nombrefiltro.toLowerCase();
    const marca = ele.marca.toLowerCase();
    const modelo = ele.modelo ? ele.modelo.toLowerCase() : '';
    const dot = ele.dot.toLowerCase();
    const ubicacion = ele.ubicacionFiltrado.toLowerCase();
    return (
      (nombreFiltro ? (nombreProducto.includes(nombreFiltro.toLowerCase())  || nombreProductoFiltrado.includes(nombreFiltro.toLowerCase())) : true) &&
      (marcaFiltro ? marca.includes(marcaFiltro.toLowerCase()) : true) &&
      (modeloFiltro ? modelo.includes(modeloFiltro.toLowerCase()) : true) &&
      (dotFiltro ? dot.includes(dotFiltro.toLowerCase()) : true) &&
      (ubicacionFiltro ? ubicacion.includes(ubicacionFiltro.toLowerCase()) : true)
    );
  });

  this.totalLlantas = this.dataSourceProductos.data.length;
}

bufferCambiosServicios: any[] = [];
filtrarDatosServicios(texto: string, objeto: string) {
  const seleccionadosPrevios = this.dataSourceAuxiliarServicios.filter(ele => ele.seleccionadoS);
  const indiceCambios = this.bufferCambiosServicios.findIndex(ele => (ele['objeto'] == objeto));
  if (indiceCambios == -1) {
      this.bufferCambiosServicios.push({ valor: texto, objeto: objeto });
  } else {
      this.bufferCambiosServicios[indiceCambios]['valor'] = texto;
  }
  const dataFiltrada = this.dataSourceAuxiliarServicios.filter((item: any) => {
      let contador = 0;
      this.bufferCambiosServicios.forEach(element => {
          if (item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())) {
              contador++;
          }
      });
      if (contador == this.bufferCambiosServicios.length) return item;
  });
  if (texto == '') {
      this.bufferCambiosServicios.splice(indiceCambios, 1);}
  dataFiltrada.forEach(item => {
      const elementoSeleccionado = seleccionadosPrevios.find(ele => ele.productoid === item.productoid);
      if (elementoSeleccionado) {
          item.seleccionadoS = true;}});
  this.dataSourceServicios.data = dataFiltrada;
  this.dataSourceAuxiliarServicios.forEach(item => {
      if (item.seleccionadoS) {
          const index = this.dataSourceServicios.data.findIndex(product => product.productoid === item.productoid);
          if (index === -1) {
              this.dataSourceServicios.data.push(item);
          } else {
              this.dataSourceServicios.data[index].seleccionadoS = true;
          }
      }
  });
}
bufferCambiosFinal: any[] = [];


filtrarDatosFinal(texto: string, objeto: string){
  //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
  const indiceCambios = this.bufferCambiosFinal.findIndex(ele => (ele['objeto'] == objeto));
  if(indiceCambios == -1){
      this.bufferCambiosFinal.push({ valor:  texto , objeto: objeto });
  }else{
      //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
      this.bufferCambiosFinal[indiceCambios]['valor'] = texto;
  }
  //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
  this.dataSourceFinal.data = this.dataSourceAuxiliarFinal.filter( (item: any) => {
      let contador = 0;
      //USO UN CONTADOR PARA IR CONTANDO LAS VECES QUE EL FILTRO ES CORRECTO, SE SUMA UNO POR CADA FILTRO CORRECTO DENTRO DEL VECTOR DE BUFFS
      //EL REGISTRO ES CORRECTO SI EL OBJETO DE ESE REGISTRO ACTUAL ES IGUAL AL TEXTO 
      this.bufferCambiosFinal.forEach( element=> {
          if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
              contador++;
          }
      })
      //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL BUFFER, ENTONCES LO DEVUELÑVE
      if (contador == this.bufferCambiosFinal.length) return item;
  });
  //Y CUANDO EL FILTRO ESTÉ VACÍO, ENTONCES LO ELIMINO DEL BUFFER
  if(texto == ''){
      this.bufferCambiosFinal.splice(indiceCambios, 1);
  }

  //MANEJO EL BUFFER PORQUE EN CASO DE QUE APLIQUEN FILTROS EN DESORDEN, EL SISTEMA NO VA A SABER CUÁL FUE EL ANTERIOR
  //YA TENIENDO EL BUFFER, COMO RECORRE LOS FILTROS APLICADOS, ENTONCES NO IMPORTA EN QUÉ ORDEN LO MANEJES
}


  async obtenerInventario(): Promise<void> {
    const req$ = this.api.consultaDatos('operaciones/inventario/1/' + this.almacenId);
    const inventario = await lastValueFrom(req$);
    this.dataSourceProductos.data = [...this.dataSourceProductos.data, ...inventario];//new MatTableDataSource(inventario);
    this.productos = inventario;
    this.dataSourceProductos.data.map(ele => ele.seleccionado = ele.seleccionado || false);
    this.dataSourceAuxiliar = this.dataSourceProductos.data;
    this.totalLlantas = this.dataSourceProductos.data.length;
  }


  eliminarPagoMixto(indice: number){
    this.dataSourcePagosMixtos.data.splice(indice, 1);
    this.dataSourcePagosMixtos.filter = "";
    this.validarPagos();
  }

  validarPagos(){
    this.tipoPagosMixtos.map(ele => ele.seleccionado = false);
    this.dataSourcePagosMixtos.data.forEach((pago)=> {
      const indice = this.tipoPagosMixtos.findIndex(ele => ele.tipoId == pago.tipoid);
      indice != -1 ? this.tipoPagosMixtos[indice].seleccionado = true : null;
    })
  }


  seleccionarPagosMixtos(){
    this.dataSourcePagosMixtos.data.push(
      {
        tipoid: -1,
        monto: 0,
      }
    )
    this.dataSourcePagosMixtos.filter = "";
  }

  cargarTipoPagos(){
    this.api.consultaDatos('catalogos/tipopagos').subscribe((tipos) => {
      this.tipoPagos = tipos;
      this.tipoPagosMixtos = tipos.filter((ele: any) => ele.tipoId != 0);
      this.tipoPagosMixtos.map(ele => ele.selccionado = false);
    })
  }

  consultarVentas(){
    const dialog = this.dialog.open(ModVentasComponent,
      {
        maxWidth: '100vW',
        width: '90%',
        maxHeight: '100vH',
      });
    dialog.afterClosed().subscribe((response) => {
      this.cargarInventario();
    });
  }

  async comprobarTurno(): Promise<void> {
    const req$ = this.api.consultaDatos(`administracion/turno/${this.usuarioId}/${this.sucursalId}`);
    const response = await lastValueFrom(req$);
    this.turnoAbierto = response.length > 0;
    if(!this.turnoAbierto){
      swal("Turno sin abrir", "No hay un turno abierto", "error");
      return;
    }
    this.turnoId = response[0].turnoid
    
    if(this.productosEdicion.length > 0 || this.serviciosEdicion.length > 0){

      this.realizarVenta();
      this.agregarProducto();
    }
  }

  realizarVenta(){
    if(!this.turnoAbierto){
      swal("Error en la venta", "No hay un turno abierto", "error");
      return;
    }
    this.desplazarse = true; 
    setTimeout(() => {
      document.getElementById("seccionDestino")?.scrollIntoView({ behavior: "smooth" });  
    }, 200);
  }

  comprobarAutorizacion(index: number){
    const dialog = this.dialog.open(ModAutorizacionComponent);
    dialog.afterClosed().subscribe((response) => {
      if(response){
        this.dataSourceProductos.data[index].autorizadoDescuento = true;
      }
    });
  }

  async cargarInventario(): Promise<void> {
    const req$ = this.api.consultaDatos('operaciones/inventario/disponible/' + this.sucursalId);
    const inventario = await lastValueFrom(req$);
    this.inventarioDisponible = inventario;
  }


//_______________________________Tabla Servicios_____________________________________
async cargarServicios(): Promise<void>{
  const req$ = this.api.consultaDatos('operaciones/productos/servicios');
  const servicios = await lastValueFrom(req$);
  this.serviciosOficial = servicios;
  this.servicios = this.serviciosOficial;
  this.dataSourceServicios.data = this.serviciosOficial.map(ele => ({...ele, preciounitario: ele.precio, seleccionadoS: this.serviciosEdicion.some((servicio: servicio) => servicio.productoid === ele.productoid)}));
  this.dataSourceAuxiliarServicios=this.dataSourceServicios .data;
  this.totalVentaServicio = this.dataSourceServicios.data.filter(ele => ele.seleccionadoS).reduce((acc: number, ele: any) => acc += parseFloat(ele.precio), 0);

}
//_____________________________________________________________________________________
//_________________________________Confirmar Venta____________________________________

cargarClientes(){
  this.api.consultaDatos('administracion/clientes').subscribe((clientes: Array<Cliente>) => {
    this.clientesNumero = clientes;
    this.clientes = clientes.map(ele => ele.nombreCliente);
    this.numeroClientes = clientes.map(ele => ele.numeroCliente);
    
    this.clientesFiltrados = this.cliente.valueChanges.pipe(
      startWith(''),
      map(valor => this.filtrarClientes(valor))
    )
    this.numerosClientesFiltrados = this.numeroCliente.valueChanges.pipe(
      startWith(''),
      map(valor => this.filtrarNumerosClientes(valor))
    )
  })
}

filtrarClientes(valor: string){
  return this.clientes.filter(ele => ele.toLowerCase().includes(valor.toLowerCase()))
}

filtrarNumerosClientes(valor: string){
  return this.numeroClientes.filter(ele => ele.toLowerCase().includes(valor.toLowerCase()))
}

irAbajo() {
  document.getElementById("seccionProducto")?.scrollIntoView({ behavior: "smooth" });
}


eliminarProducto(indice: number){
  const productoeliminar = this.dataSourceFinal.data.find(ele => ele.inventarioid == this.dataSourceFinal.data[indice].inventarioid);
  const servicioeliminar = this.dataSourceFinal.data.find(ele => ele.productoid == this.dataSourceFinal.data[indice].productoid);

  this.dataSourceAuxiliar.map(ele => ele.inventarioid == productoeliminar.inventarioid ? ele.seleccionado = false : this.dataSourceAuxiliar)
  this.dataSourceAuxiliarServicios.map(ele => ele.productoid == servicioeliminar.productoid ? ele.seleccionadoS = false : this.dataSourceAuxiliarServicios)
  this.dataSourceFinal.data.splice(indice, 1);
  this.dataSourceAuxiliarFinal = this.dataSourceFinal.data;
  this.dataSourceFinal.filter = ""
  

  const totalPrecioProducto = this.dataSourceFinal.data
    .filter(ele => ele.seleccionado && ele.precioventa)
    .reduce((acc, ele) => acc + (parseFloat(ele.precioventa) - parseFloat(ele.descuento)), 0);

  const totalPrecioServicio = this.dataSourceFinal.data
    .filter(ele => ele.seleccionadoS && ele.precio)
    .reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);

    
  const totalPreciosProductoAbajo = this.dataSourceFinal.data
    .filter(ele => !ele.seleccionado && ele.productoid == 0)
    .reduce((acc, ele) => acc + (parseFloat(ele.precioventa)*parseFloat(ele.cantidad)) - parseFloat(ele.descuento), 0);

  const totalPreciosServiciosAbajo = this.dataSourceFinal.data
    .filter(ele => !ele.seleccionadoS && ele.inventarioid==0)
    .reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad)) - parseFloat(ele.descuento), 0);

  const sumaDeNumeros = totalPrecioProducto + totalPrecioServicio + totalPreciosProductoAbajo + totalPreciosServiciosAbajo;

  this.totalVentaFinal = sumaDeNumeros ;
  this.subTotal = sumaDeNumeros;
  this.calcularTotalVenta(this.banderaIVA);

}

validarInput(indice: number, valor: number){
  if(valor <= 0){
    swal("Error en la cantidad", "La cantidad no puede ser menor que 0", "error");
    this.dataSourceFinal.data[indice].cantidad = 1;
    return;
  }
  this.dataSourceFinal.data[indice].cantidad = valor;

  const totalPrecioProducto = this.dataSourceFinal.data
    .filter(ele => ele.seleccionado && ele.precioventa)
    .reduce((acc, ele) => acc + (parseFloat(ele.precioventa) - parseFloat(ele.descuento || 0)), 0);

  const totalPrecioServicio = this.dataSourceFinal.data
    .filter(ele => ele.seleccionadoS && ele.precio)
    .reduce((acc, ele) => acc + (parseFloat(ele.precio) * parseFloat(ele.cantidad || 1)) - parseFloat(ele.descuento || 0), 0);

  const totalPreciosProductoAbajo = this.dataSourceFinal.data
    .filter(ele => !ele.seleccionado && ele.productoid == 0)
    .reduce((acc, ele) => acc + (parseFloat(ele.precioventa) * parseFloat(ele.cantidad || 1)) - parseFloat(ele.descuento || 0), 0);

  const totalPreciosServiciosAbajo = this.dataSourceFinal.data
    .filter(ele => !ele.seleccionadoS && ele.inventarioid == 0)
    .reduce((acc, ele) => acc + (parseFloat(ele.precio) * parseFloat(ele.cantidad || 1)) - parseFloat(ele.descuento || 0), 0);

  const sumaDeNumeros = totalPrecioProducto + totalPrecioServicio + totalPreciosProductoAbajo + totalPreciosServiciosAbajo;

  this.totalVentaFinal = sumaDeNumeros;
  this.subTotal = sumaDeNumeros;
  this.calcularTotalVenta(this.banderaIVA);
}

habilitarDescuento(inventarioid: number){
  const response = this.dialog.open(ModAutorizacionComponent, 
    {
      data: "cancelar",
      maxWidth: '60vW',
    }
  )
  response.afterClosed().subscribe((aprobado) => {
    if(aprobado){
      const indice = this.dataSourceFinal.data.findIndex(ele => ele.inventarioid == inventarioid);
      this.dataSourceFinal.data[indice].descuentoAutorizado = true;
    }
    else{
      swal("Error en la autorización", "No se pudo autorizar el descuento", "error");
    }
  })
}

descuentoAprobado: boolean = false;

habilitarDescuentoServicio(productoid: number){
  const response = this.dialog.open(ModAutorizacionComponent,
    {
      data: "cancelar",
      maxWidth: '60vW',
    }
  )
  response.afterClosed().subscribe((aprobado) => {
    if(aprobado){
      const indice = this.dataSourceFinal.data.findIndex(ele => ele.productoid == productoid);
      this.dataSourceFinal.data[indice].descuentoAutorizado = true;
      this.descuentoAprobado = true;
    }    else{
      this.descuentoAprobado = false;
      swal("Error en la autorización", "No se pudo autorizar el descuento", "error");
    }
  })
  }
 agregarCliente(){
    const dialog = this.dialog.open(ModClientesComponent,
      {
        maxWidth: '70vW',
        width: '100%',
      }
    )
    dialog.afterClosed().subscribe((response) => {
      this.cargarClientes();
    })
  }

  agregarServicio(){
    this.servicioAct = this.servicios.map(element => {
      if (element.hasOwnProperty('nombre')) {
        element.nombreproducto = element.nombre;
        delete element.nombre;
      }
      return element;
    });
    this.mezclaDatos= [...this.productos.map(ele => ({ ...ele, productoid: 0 })), ...this.servicioAct.map(ele => ({ ...ele, inventarioid: 0, cantidad: 1, descuento: 0,modelo: '',marca: '', dot: '', ubicacion: '', seleccionadoS: false }))];
    this.mezclaDatosAuxiliar = [...this.productos.map(ele => ({ ...ele, productoid: 0 })), ...this.servicioAct.map(ele => ({ ...ele, inventarioid: 0, cantidad: 1, descuento: 0,modelo: '',marca: '', dot: '', ubicacion: '', seleccionadoS: false }))];
    this.dataSourceFinal.data.push(
      {
        inventarioid: 0,
        productoid: 0,
        cantidad: 1,
        modelo: '',
        marca: '',
        nombreproducto: '',
        dot: '',
        descuento: 0,
        precioventa: 0,
        ubicacion: '',
        ubicacionid: 0,
        seleccionadoS:false,
        seleccionados:false,
        identificador: 1,

      }
    )
    this.dataSourceAuxiliarFinal = this.dataSourceFinal.data
    this.dataSourceFinal.filter = "";
  }
  get opcionesFiltradas() {
    this.valorFiltro = this.myControl.value?.toLowerCase() || '';
    const inventariosSeleccionados = this.dataSourceFinal.data
      .filter((ele: any) => ele.inventarioid && ele.inventarioid !== 0)
      .map((ele: any) => ele.inventarioid);
    const productosSeleccionados = this.dataSourceFinal.data
      .filter((ele: any) => ele.productoid && ele.productoid !== 0)
      .map((ele: any) => ele.productoid);

    return this.mezclaDatos.filter(opcion => {
      if (opcion.inventarioid && opcion.inventarioid !== 0) {
        if (inventariosSeleccionados.includes(opcion.inventarioid)) {
          return false;
        }
      }

      if (opcion.productoid && opcion.productoid !== 0) {
        if (productosSeleccionados.includes(opcion.productoid)) {
          return false;
        }
      }

      const nombreProductoOriginal = opcion.nombreproducto.toLowerCase().replace(/\//g, ''); 
      const nombreProductoSinR = nombreProductoOriginal.replace(/r/g, ''); 
      const valorFiltroLimpio = this.valorFiltro.replace(/\//g, ''); 
      const valorFiltroSinR = valorFiltroLimpio.replace(/r/g, ''); 
      const concatenar = (nombreProductoOriginal+'-'+opcion.marca+'-'+opcion.modelo+'-'+opcion.dot+'-'+opcion.ubicacion).toLowerCase().replace(/\//g, '').replace(/\s+/g, '');
      const concatenatedStringSinR = concatenar.replace(/r/g, '');
  
      return nombreProductoOriginal.includes(valorFiltroLimpio) || 
             nombreProductoSinR.includes(valorFiltroSinR) ||
              concatenatedStringSinR.includes(valorFiltroSinR)||
              concatenar.includes(valorFiltroLimpio);    
    });
  }
  
  
  seleccionarProducto(event: MatAutocompleteSelectedEvent, indice: number){
const ProductoseleccionadoEntero = event.option.value;
    const productoSeleccionado = event.option.value.nombreproducto; 
   
             this.dataSourceFinal.data[indice].nombreproducto = productoSeleccionado;
        
             if(ProductoseleccionadoEntero.productoid == 0){
             this.dataSourceFinal.data[indice].inventarioid = ProductoseleccionadoEntero.inventarioid;
             this.dataSourceFinal.data[indice].precioventa = ProductoseleccionadoEntero.precioventa;
             this.dataSourceFinal.data[indice].marca = ProductoseleccionadoEntero.marca;
             this.dataSourceFinal.data[indice].modelo = ProductoseleccionadoEntero.modelo;
             this.dataSourceFinal.data[indice].dot = ProductoseleccionadoEntero.dot;
             this.dataSourceFinal.data[indice].ubicacion = ProductoseleccionadoEntero.ubicacion;
            this.dataSourceFinal.data[indice].seleccionados =   ProductoseleccionadoEntero.seleccionados

             }else{
                this.dataSourceFinal.data[indice].productoid = ProductoseleccionadoEntero.productoid;
                this.dataSourceFinal.data[indice].precio = ProductoseleccionadoEntero.precio
                this.dataSourceFinal.data[indice].seleccionadoS = ProductoseleccionadoEntero.seleccionadoS
             

         }
         this.dataSourceAuxiliarFinal = this.dataSourceFinal.data
         this.myControl.reset();

  const totalPrecioProducto = this.dataSourceFinal.data
  .filter(ele => ele.seleccionado && ele.precioventa)
  .reduce((acc, ele) => acc + (parseFloat(ele.precioventa) - parseFloat(ele.descuento)), 0);

const totalPrecioServicio = this.dataSourceFinal.data
  .filter(ele => ele.seleccionadoS && ele.precio)
  .reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);

  
const totalPreciosProductoAbajo = this.dataSourceFinal.data
.filter(ele => !ele.seleccionado && ele.productoid == 0)
.reduce((acc, ele) => acc + (parseFloat(ele.precioventa)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);

const totalPreciosServiciosAbajo = this.dataSourceFinal.data
.filter(ele => !ele.seleccionadoS && ele.inventarioid==0)
.reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);

  const sumaDeNumeros = totalPrecioProducto + totalPrecioServicio + totalPreciosProductoAbajo + totalPreciosServiciosAbajo;
  this.subTotal = sumaDeNumeros;
  this.calcularTotalVenta(this.banderaIVA);
}

recalcularTotales() {
  const totalPrecioProducto = this.dataSourceFinal.data
    .filter(ele => ele.seleccionado && ele.precioventa)
    .reduce((acc, ele) => acc + (parseFloat(ele.precioventa)), 0);

  const totalPrecioServicio = this.dataSourceFinal.data
    .filter(ele => ele.seleccionadoS && ele.precio)
    .reduce((acc, ele) => acc + (parseFloat(ele.precio) * parseFloat(ele.cantidad)), 0);

  const totalPreciosProductoAbajo = this.dataSourceFinal.data
    .filter(ele => !ele.seleccionado && ele.productoid == 0)
    .reduce((acc, ele) => acc + (parseFloat(ele.precioventa) * parseFloat(ele.cantidad)), 0);

  const totalPreciosServiciosAbajo = this.dataSourceFinal.data
    .filter(ele => !ele.seleccionadoS && ele.inventarioid == 0)
    .reduce((acc, ele) => acc + (parseFloat(ele.precio) * parseFloat(ele.cantidad)), 0);

  const sumaDeNumeros = totalPrecioProducto + totalPrecioServicio + totalPreciosProductoAbajo + totalPreciosServiciosAbajo;

  this.subTotal = sumaDeNumeros;
  this.calcularTotalVenta(this.banderaIVA);
  this.totalVenta = this.totalVentaFinal;
}

cambiarPrecioVenta(element: any) {
  const esProducto = element.hasOwnProperty('precioventa') && element.precioventa !== '';
  const precioActual = esProducto ? element.precioventa : element.precio;

  // Guardar precio original si no existe
  if (!element.precioOriginal) {
    element.precioOriginal = precioActual;
  }

  swal({
    text: `Precio actual: $${precioActual}. Ingrese el nuevo precio:`,
    content: {
      element: "input",
      attributes: {
        placeholder: "Nuevo precio",
        type: "number",
        value: precioActual
      },
    },
    buttons: {
      cancel: {
        text: "Cancelar",
        visible: true,
        className: "",
        closeModal: true,
      },
      restore: {
        text: "Restaurar original",
        value: "restore",
        className: "",
        closeModal: true,
      },
      confirm: {
        text: "Guardar",
        value: true,
        visible: true,
        className: "",
        closeModal: true
      }
    },
  }).then((valor: any) => {
    if (valor === "restore") {
      if (esProducto) {
        element.precioventa = element.precioOriginal;
      } else {
        element.precio = element.precioOriginal;
      }
      swal("Precio restaurado", `El precio ha sido restaurado a $${element.precioOriginal}`, "success");
      this.recalcularTotales();
      return;
    }

    if (!valor || valor === true) return; // valor is true if confirm clicked but no input? No, with input it returns value.

    const nuevoPrecio = parseFloat(valor);
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
      swal("Error", "Ingrese un precio válido", "error");
      return;
    }

    if (esProducto) {
      element.precioventa = nuevoPrecio;
      element.descuento = element.precioOriginal - element.precioventa;
    } else {
      element.precio = nuevoPrecio;
      element.descuento = element.precioOriginal - element.precio;
    }

    this.recalcularTotales();
    this.notification.success(`El nuevo precio es $${nuevoPrecio}`, "Precio actualizado");
  });
}
  
  clicks = 0;
  realizarVentaFinal(){
    if(this.turnoId == 0){
      swal("Venta no permitida", "No se puede realizar la venta en el turno actual", "warning");
      return;
    }
    this.clicks++;
    if(this.clicks > 1){
      swal("Venta duplicada", "No se puede realizar la venta más de una vez", "warning");
      return;
    }
   if(this.dataSourceFinal.data.filter(ele => ele.nombreproducto == '').length > 0){
    swal("Campo sin registros", "Registre al menos una llanta y/o servicio o elimine el campo", "warning");
    return; 

   }

    const totalPrecioProducto = this.dataSourceFinal.data
    .filter(ele => ele.seleccionado && ele.precioventa)
    .reduce((acc, ele) => acc + (parseFloat(ele.precioventa) - parseFloat(ele.descuento)), 0);
    console.log("ejepr:", totalPrecioProducto);
  
  const totalPrecioServicio = this.dataSourceFinal.data
    .filter(ele => ele.seleccionadoS && ele.precio)
    .reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);
  
    
  const totalPreciosProductoAbajo = this.dataSourceFinal.data
  .filter(ele => !ele.seleccionado && ele.productoid == 0)
  .reduce((acc, ele) => acc + (parseFloat(ele.precioventa)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);
  console.log("eje:", totalPreciosProductoAbajo);
  
  const totalPreciosServiciosAbajo = this.dataSourceFinal.data
  .filter(ele => !ele.seleccionadoS && ele.inventarioid==0)
  .reduce((acc, ele) => acc + (parseFloat(ele.precio)*parseFloat(ele.cantidad))- parseFloat(ele.descuento), 0);
  
    const sumaDeNumeros = totalPrecioProducto + totalPrecioServicio + totalPreciosProductoAbajo + totalPreciosServiciosAbajo;
  
    this.totalVentaFinal = sumaDeNumeros;
    console.log(this.dataSourceFinal.data)
    console.log("Total Venta Final:",this.totalVentaFinal);

    if(this.totalVentaFinal == 0){
      swal({title:"Venta sin registros", text:"Registre al menos una llana y/o servicio", timer: 3000, icon: "warning"});
      return;
    }
    console.log(this.dataSourceFinal.data)

    const datos = {
      nombreCliente: this.cliente.value,
      numeroCliente: this.numeroCliente.value,
      usuarioid: this.usuarioId,
      monto: this.totalVentaFinal,
      ventas: this.dataSourceFinal.data.filter(ele => ele.inventarioid || ele.productoid),
      folioVenta: this.dataHistorial,
      turnoid: this.turnoId,
      IVA: this.IVA,
      subTotal: this.subTotal,
      totalVenta: this.totalVenta,
      modo: this.productosEdicion.length > 0 || this.serviciosEdicion.length > 0 ? 'edicionVenta' : 'insercionVenta',
      folioventa: this.folioVenta
    }
    // console.log(datos);
    this.api.insertarDatos('operaciones/vender', datos).subscribe({ next: async(response) => {  
      try {
        this.dataSourceFinal.data = [];
        this.api.consultaDatos('operaciones/historial/ventas').subscribe({
          next: (historial: Array<HistorialVenta>) => {
            const ultimaVenta = historial[0];
            this.dataHistorial = ultimaVenta.folioventa;
            const dialog = this.dialog.open(ModAbonosDeudasComponent,
              {
                  maxWidth: "80vW",
                  width: '60%',
                  data:{
                    ventaid: this.productosEdicion.length > 0 || this.serviciosEdicion.length > 0 ? this.folioVenta : ultimaVenta.folioventa,
                  }
                }
            )
            swal({ title: `Folio de venta: ${ this.dataHistorial} `, text: `Se concretó la venta correctamente`, icon: "success", timer: 2000});
            dialog.afterClosed().subscribe(() => {
              setTimeout(() => {
                location.reload();
              }, 2000);
            })
          }
        })
  
     
    } catch(error){
      console.log(`error al obtener los folios`, error)
  
    }},error:(err) => {
      swal("Venta No Realizada", `No se concretó la venta `, "warning");
      this.clicks = 0;
    }
  })
  }
}
