import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { SessionService } from '../../../services/session.service';
import { ApiService } from '../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ModAutorizacionComponent } from './modales/mod-autorizacion/mod-autorizacion.component';
import { ModVentasComponent } from './modales/mod-ventas/mod-ventas.component';
import { ModSeleccionClienteComponent } from './modales/mod-seleccion-cliente/mod-seleccion-cliente.component';
import { ModAbonosDeudasComponent } from '../cuentas-x-cobrar/mod-abonos-deudas/mod-abonos-deudas.component';
import { ModArmarVentaComponent } from './mod-armar-venta/mod-armar-venta.component';

export class InventarioDisponible  {
  dot: string;
  nombre: string;
  cantidad: number;
}

export class Venta{
  nombre: string;
  modelo: string;
  productoid: number;
  cantidad: number;
  precioventa: string;
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
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit, AfterViewInit{
  dataSource = new MatTableDataSource<Venta>();
  dataSourcePagosMixtos = new MatTableDataSource<PagoMixto>();
  inventarioDisponible: Array<InventarioDisponible> = [];
  sucursalId = 0;
  usuarioId = 0;
  turnoId = 0;
  columnasDesplegadas = ['seleccionar', 'nombre', 'marca', 'modelo', 'dot', 'precioventa'];
  columnasDesplegadasMixtos = ['descripcion', 'monto', 'eliminar']
  totalVenta = 0;
  turnoAbierto = false;
  tipoPagos: Array<any> = [];
  tipoPagosMixtos: Array<any> = [];
  //EL 5 ES CON EFECTIVO DENTRO DE LA TABLA DE "TIPOPAGO"
  tipoPagoId = 5;
  pagoMixto = [];
  dataSourceAuxiliar: Venta[];
  seleccionados: Venta[] = [];
  menuId = 2

  constructor(private sesion: SessionService, private api: ApiService, private dialog: MatDialog){   }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.sesion.validarSesion(this.menuId);
    }
  }

  agregarProducto(){
    this.totalVenta = this.dataSource.data.filter(ele => ele.seleccionado)
      .reduce((acum, actual) => acum += parseFloat(actual.precioventa), 0);
  }

  ngOnInit(): void {
    this.cargarTipoPagos();
    this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
    this.cargarInventario();
    this.obtenerInventario();
    this.comprobarTurno();
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

  obtenerInventario(){
    this.api.consultaDatos('operaciones/inventario/1').subscribe((inventario) => {
      this.dataSource = new MatTableDataSource(inventario);
      this.dataSource.data.map(ele => ele.seleccionado = false);
      this.dataSourceAuxiliar = this.dataSource.data;
    })
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
    console.log(this.tipoPagosMixtos);
  }

  validarInput(posicion: number, monto: number){
    if(monto < 0){
      swal("Error en el monto del pago", "El pago no puede ser menor o igual que 0", "error");
      this.dataSourcePagosMixtos.data[posicion].monto = 0;
    }
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
    this.dialog.open(ModVentasComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      });
  }

  comprobarTurno(){
    console.log(this.usuarioId);
    this.api.consultaDatos(`administracion/turno/${this.usuarioId}/${this.sucursalId}`).subscribe((response: Array<any> )=> {
      this.turnoAbierto = response.length > 0;
      this.turnoId = response[0].turnoid
    })
  }

  guardarVenta(clienteId: number){
    const currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
        swal({title: 'Realización de la Venta', 
          text: '¿Seguro que desea aplicar la venta por ' + currency.format(this.totalVenta) + '?',
          buttons: ['No', 'Si'], 
          icon: "warning"}).then((response) => {
            if(response){
              const datos = {
                monto: this.totalVenta,
                inventarios: this.dataSource.data.filter(ele => ele.seleccionado),
                turnoid: this.turnoId,
                tipoid: this.tipoPagoId,
                clienteid: clienteId,
                usuarioid: this.usuarioId,
                pagos: this.dataSourcePagosMixtos.data,
              }
              this.api.insertarDatos('operaciones/vender', datos).subscribe((response) => {
                swal("Venta Realizada", "Se hizo la venta correctamente", "success");
                this.api.consultaDatosPost('operaciones/ultimaventa', this.dataSource.data.filter(ele => ele.seleccionado)).subscribe((ventaid) => {
                  this.dialog.open(ModAbonosDeudasComponent, {
                    maxWidth: "80vW",
                    width: '60%',
                    data:{
                      ventaid: ventaid
                    }
                  })
                  this.obtenerInventario();
                  this.tipoPagoId = 5;
                })
              })
            }
          })
  }

  realizarVenta(){
    const dialog = this.dialog.open(ModArmarVentaComponent,
      {
        maxWidth: '80vW',
        width: '80%',
        data: this.dataSource.data.filter(ele => ele.seleccionado).length == 0 ? [{lectura: false, precioventa: 0, nombre: '', cantidad: 0}] : this.dataSource.data.filter(ele => ele.seleccionado),
      }
    )
    dialog.afterClosed().subscribe((response) => {
      this.cargarInventario();
    })
  }

  comprobarAutorizacion(index: number){
    const dialog = this.dialog.open(ModAutorizacionComponent);
    dialog.afterClosed().subscribe((response) => {
      console.log(response);
      if(response){
        this.dataSource.data[index].autorizadoDescuento = true;
      }
    });
  }

  cargarInventario(){
    this.api.consultaDatos('operaciones/inventario/disponible/' + this.sucursalId).subscribe((inventario: Array<InventarioDisponible>) => {
      this.inventarioDisponible = inventario;
    })
  }

}
