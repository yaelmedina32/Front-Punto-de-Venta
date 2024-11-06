import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { ApiService } from '../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { PagoMixto } from '../../ventas/ventas.component';

@Component({
  selector: 'app-mod-abonos-deudas',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-abonos-deudas.component.html',
  styleUrl: './mod-abonos-deudas.component.css'
})
export class ModAbonosDeudasComponent implements OnInit{
  nombreCliente = "";
  totalDeuda = 0.0;
  restante = 0.0;
  dataSource = new MatTableDataSource<any>();
  columnasDesplegadas = ['foliopago', 'monto', 'tipo', 'fechapago', 'estatus', 'acciones'];
  columnasDesplegadasMixtos = ['descripcion', 'monto', 'eliminar']
  sucursalId = 0;
  tipoVenta = [ 'Contado', 'Plazos' ];
  tipoVentaSeleccionada = "Contado";
  usuarioId = 0;
  turnoId = 0;
  tipoPagoId = 5;
  turnoAbierto = false;
  tipoPagos: any[];
  tipoPagosMixtos: any[];
  dataSourcePagosMixtos = new MatTableDataSource<PagoMixto>();
  conTipoPago = false;
  conTipoVenta = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService) { }
  ngOnInit(): void {
    this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
    this.cargarTipoPagos();
    this.cargarDetalles();
    this.comprobarTurno();
  }

  eliminarPagoMixto(indice: number){
    this.dataSourcePagosMixtos.data.splice(indice, 1);
    this.dataSourcePagosMixtos.filter = "";
    this.validarPagos();
  }
  
  validarInput(posicion: number, monto: number){
    if(monto < 0){
      swal("Error en el monto del pago", "El pago no puede ser menor o igual que 0", "error");
      this.dataSourcePagosMixtos.data[posicion].monto = 0;
    }
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


  marcarEliminado(pagoid: number){
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
    this.api.consultaDatos('catalogos/tipopagos').subscribe((tipos: Array<any>) => {
      this.tipoPagos = tipos;
      this.tipoPagosMixtos = tipos.filter((ele: any) => ele.tipoId != 0);
      this.tipoPagosMixtos.map(ele => ele.selccionado = false);
    })
  }

  guardarAbonos(){
    if(this.dataSource.data.some((ele: any) => ele.pagoid == 0)){
      swal({title: 'Error en forma de pago', text: "Seleccione una forma de pago para continuar", icon: "error"});
      return;
    }
    swal({title: 'Guardar Abonos', text: '¿Seguro que desea guardar los abonos nuevos?', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      this.dataSource.data.map(ele => {
        ele.tipoid = this.tipoPagoId;
        ele.tipoventa = this.tipoVentaSeleccionada;
        ele.completo = (this.totalDeuda - this.dataSource.data.reduce((acum, actual) => acum += actual.monto, 0)) <= 0;
      })
      if(response){
        this.api.insertarDatos('operaciones/abonos', this.dataSource.data.filter((ele: any) => ele.nuevo != 0)).subscribe((response) => {
          swal("Datos insertados correctamente", "Se insertaron los bonos correctamente", "success");
          this.cargarDetalles();
        })
      }
    })
  }

  agregarAbono(){
    if(this.dataSource.data.reduce((acum, actual) => acum += actual.monto, 0) >= this.totalDeuda){
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
      }
    )
    this.dataSource.filter = "";
  }

  cargarDetalles(){
    this.api.consultaDatos('operaciones/detalle/deuda/' + this.data.ventaid).subscribe((detalles) => {
      console.log(detalles);
      this.nombreCliente = detalles[0].nombre;
      this.totalDeuda = detalles[0].monto;
      this.restante = detalles[0].restante;    
      this.conTipoPago = detalles[0].tipopagoid ? true : false;
      this.conTipoVenta = detalles[0].tipoventa ? true : false;
      this.api.consultaDatos('operaciones/abonos/' + this.data.ventaid).subscribe((abonos) => {
        this.dataSource.data = abonos;
        console.log(this.dataSource.data);
        if(this.dataSource.data.length == 0){      
          this.dataSource.data = [
            {
              pagoid: 0,
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
}
