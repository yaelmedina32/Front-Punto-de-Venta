import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { ApiService } from '../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { MatDialogRef } from '@angular/material/dialog';
import { jsPDF } from 'jspdf';
import swal from 'sweetalert';
import { TicketService } from '../../../../services/ticket.service';

interface DatoVenta{
  cantidad: number;
  nombre: string;
  precioVenta: string;
  importe: string;
  telefono?: string;
  iva?: number;
}

interface ResponseTicket{
  datosVenta: DatoVenta[];
  tipoPago: string;
  totalIva: number;
  totalSinIva: number;
}

interface DetalleVenta{
  producto: string;
  precioventa: number;
  descuento: number;
  dot: string;
  cantidad: number;
}

interface TipoPago {
  tipoId: number;
  descripcion: string;
  porcentajeDescuento: string;
}

@Component({
    selector: 'app-mod-abonos-deudas',
    imports: [CompartidosModule],
    templateUrl: './mod-abonos-deudas.component.html',
    styleUrl: './mod-abonos-deudas.component.css'
})
export class ModAbonosDeudasComponent implements OnInit{
  nombreCliente = "";
  totalDeuda = 0.0;
  subTotalDeuda = 0.0;
  IVA = 0.0;
  restante = 0.0;
  dataSource = new MatTableDataSource<any>();
  columnasDesplegadas = ['foliopago', 'monto', 'tipo', 'fechapago', 'estatus', 'acciones'];
  columnasDesplegadasMixtos = ['descripcion', 'monto', 'eliminar']
  sucursalId = 0;
  tipoVenta = [ 'Contado', 'Plazos' ];
  tipoVentaSeleccionada = "Contado";
  usuarioId = 0;
  turnoId = 0;
  isLoading:boolean= false;
  tipoPagoId = 5;
  turnoAbierto = false;
  tipoPagos: TipoPago[];
  conTipoPago = false;
  conTipoVenta = false;
  detalleVenta: DetalleVenta[] = []

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialog: MatDialogRef<any>) { }
  ngOnInit(): void {
    this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
    this.cargarTipoPagos();
    this.cargarDetalles();
    this.comprobarTurno();
  }
  
  validarInput(posicion: number, monto: number){
    if(monto < 0){
      swal("Error en el monto del pago", "El pago no puede ser menor o igual que 0", "error");
    }
  }


  marcarEliminado(pagoid: number, index: number){
    if(pagoid == 0 && index != 0){
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
      return;
    }
    swal({text: '¿Seguro que desea cancelar este pago?', title: 'Marcar pago como cancelado', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        const indice = this.dataSource.data.findIndex((ele: any) => ele.pagoid == pagoid);
        this.dataSource.data[indice].nuevo = -1;
        this.dataSource.data[indice].estatus = 'Cancelado';
        swal("Pago marcado como cancelado", "Guarde para cancelar el pago seleccionado", "success");
      }
    })
  }

  comprobarTurno(){
    this.api.consultaDatos(`administracion/turno/${this.usuarioId}/${this.sucursalId}`).subscribe((response: Array<any> )=> {
      this.turnoAbierto = response.length > 0;
      this.turnoId = response[0].turnoid
    })
  }

  cargarTipoPagos(){
    this.api.consultaDatos('catalogos/tipopagos').subscribe((tipos: Array<TipoPago>) => {
      this.tipoPagos = tipos;
    })
  }

  guardarAbonos(){
    if(this.dataSource.data.some( ele => ele.monto <= 0.0)){
      swal("Error en el monto del pago", "El pago no puede ser menor o igual que 0", "error");
      return;}
    swal({title: 'Guardar Pago', text: '¿Seguro que quiere guardar los pagos?', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if (!response) return; 
      this.isLoading =true;
      this.dataSource.data.map(ele => {
        ele.tipopagoid = ele.tipoId;
        ele.tipoventa = this.tipoVentaSeleccionada;
        ele.completo = (this.totalDeuda - this.dataSource.data.reduce((acum, actual) => acum += parseFloat(actual.monto), 0)) <= 0;
      })
      if(response){
        this.api.insertarDatos('operaciones/abonos', this.dataSource.data.filter((ele: any) => ele.nuevo != 0)).subscribe((response: ResponseTicket) => {
          this.printAbonoTicketPDF(response);
          this.isLoading=false;
          this.cargarDetalles();
          this.dialog.close();
            
        })
      }
    })
  }

  agregarAbono(){
    if(this.dataSource.data.some( ele => Number(ele.monto) >= this.totalDeuda)){
      swal("Monto igual al de la deuda", "Para agregar otro método de pago, modifique el total de un pago seleccionado", "warning");
      return;
    }
    this.dataSource.data.push(
      {
        pagoid: 0,
        monto: 0.0,
        fechapago: moment(new Date()).format('DD/MM/YYYY'),
        estatusid: 1,
        estatus: 'Agregado',
        ventaid: this.data.ventaid,
        turnoid: this.turnoId,
        nuevo: 1,
        tipopagoid: 7
      }
    )
    this.dataSource.filter = "";
  }

  cargarDetalles(){
    this.api.consultaDatos('operaciones/detalle/venta/' + this.data.ventaid).subscribe((venta: DetalleVenta[]) => {
      this.detalleVenta = venta;
    })
    this.api.consultaDatos('operaciones/detalle/deuda/' + this.data.ventaid).subscribe((detalles) => {
      this.nombreCliente = detalles[0].nombre;
      this.totalDeuda = detalles[0].totalVenta;
      this.subTotalDeuda = parseFloat(detalles[0].subTotal!);
      this.IVA = parseFloat(detalles[0].IVA!);
      this.restante = parseFloat(detalles[0].totalVenta!) - detalles
      .map((d: { pagos: string }) => parseFloat(d.pagos))
      .reduce((acum: number, pago: number) => acum + pago, 0);

      this.conTipoPago = detalles[0].tipopagoid ? true : false;
      this.conTipoVenta = detalles[0].tipoventa ? true : false;
      this.api.consultaDatos('operaciones/abonos/' + this.data.ventaid).subscribe((abonos) => {
        this.dataSource.data = abonos;
        if(this.dataSource.data.length == 0){      
          this.dataSource.data = [
            {
              tipopagoid: 5,
              monto: this.restante,
              fechapago: moment(new Date()).format('DD/MM/YYYY'),
              estatusid: 1,
              estatus: 'Agregado',
              ventaid: this.data.ventaid,
              turnoid: this.turnoId,
              nuevo: 1,
            }
          ]
        }
      })
    })
  }
  ticketService = inject(TicketService);
  private async printAbonoTicketPDF(response: ResponseTicket) {
      await this.ticketService.imprimirTicket(this.data.ventaid);
  }
}
