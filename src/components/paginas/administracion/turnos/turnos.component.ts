import { AfterViewChecked, Component, OnInit, AfterViewInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ModCortesComponent } from './mod-cortes/mod-cortes.component';
import { ModHistorialCortesComponent } from './mod-historial-cortes/mod-historial-cortes.component';
import { SessionService } from '../../../services/session.service';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { ModHistorialRetirosEfectivoComponent } from './mod-historial-retiros-efectivo/mod-historial-retiros-efectivo.component';
import * as ExcelJS from 'exceljs';
export class Turno{
  nombre: string;
  fechainicio: string;
  usuarioid: string;
  turnoid: number;
  cortes: number;
  restante: number;
  cantidadinicial: number;
}

@Component({
    selector: 'app-turnos',
    imports: [CompartidosModule],
    templateUrl: './turnos.component.html',
    styleUrl: './turnos.component.css'
})
export class TurnosComponent implements OnInit, AfterViewInit{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  usuarioId = 0;
  turnoId = 0;
  llantasNuevas= 0;
  llantasSemiNuevas= 0;
  menu: any[] = [];
  cortes: any[] = [];
  pagoEfectivo: any[] = [];
  pagoTarjeta: any[] = [];
  TotalpagoTarjetaCredito: any =0;
  TotalpagoCheque: any =0;
  TotalpagoTransferencia: any =0;
  TotalpagoMSI: any =0;
  cantidadInicial: number = 0;
  totalPagosEfectivo:any = 0;
  totalPagosTarjetaDebito:any = 0;
  serviciosVendidos: any[] = [];
  menuId = 9;
  dataSource = new MatTableDataSource<Turno>();
  columnasDesplegadas = ['usuario', 'fecha', 'cortes', 'restante', 'acciones'];
  sucursalId = 0;
  botonTerminarTurno:boolean = false;
  botonCortoParcial:boolean = false;
  constructor(private api: ApiService, private dialog: MatDialog, private session: SessionService, private renderer: Renderer2){
    this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');

  
  }
  
  ngAfterViewInit(): void {
    this.obtenerTurnos();

}
  
  ngOnInit(): void {
    console.time("oninit")
    this.session.validarSesion(this.menuId);


    if(this.sucursalId == 0){
      swal("Seleccione almacén para continuar.", "Para poder administrar los turnos, debe seleccionar un almacén", "warning");
    }
    console.timeEnd("oninit")

  }

  private formatearFecha(fecha: string | Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
    obtenerPermisoBotones() {
      
      if (typeof window !== 'undefined') {
        this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
      }
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
  
    private formatearMoneda(valor: number): string {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
    }
    terminarTurno(turnoid: number) {
      const turno = this.dataSource.data.find(ele => ele.turnoid === turnoid);
      const corte = this.cortes
            if (!turno) {
        swal({ title: 'Error', text: 'No se encontró el turno.', icon: 'error' });
        return;
      }
    
      swal({
        title: 'Cerrar Turno',
        text: `¿Seguro que desea terminar el turno del usuario ${turno.nombre}?\n\n` +
              `📌 ID del turno: ${turno.turnoid}\n` ,
        buttons: {
          cancel: {
            text: 'No',
            value: false,
            visible: true,
          },
          confirm: {
            text: 'Sí',
            value: true,
          }
        },
        icon: 'warning'
      }).then((response) => {
if (response) {
    // Generar el archivo Excel y descargarlo
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Turno Info');
          
          worksheet.columns = [
            { header: 'Nombre', key: 'nombre' },
            { header: 'Cantidad Inicial', key: 'cantidadInicial' },
            { header: 'Fecha Inicio', key: 'fechaInicio' },
            { header: 'Retiros', key: 'cortes' },

          ];
          worksheet.getColumn('A').width = 20;
          worksheet.getColumn('B').width = 20;
          worksheet.getColumn('C').width = 30;
          worksheet.getColumn('D').width = 20;
          worksheet.getColumn('E').width = 20;
          worksheet.getColumn('F').width = 25;
          worksheet.getColumn('G').width = 30;
          worksheet.getRow(1).font = { bold: true };
        


          worksheet.addRow({
            nombre: turno.nombre,
            cantidadInicial: this.formatearMoneda(turno.cantidadinicial),
            fechaInicio: this.formatearFecha(turno.fechainicio), 
            cortes: turno.cortes
          });
          worksheet.getCell('B4').value = 'Corte Efectivo: ';
          worksheet.getCell('C4').value =this.totalPagosEfectivo;
          worksheet.getCell('B5').value = 'Corte Tarjeta Debito: ';
          worksheet.getCell('C5').value = this.totalPagosTarjetaDebito;
          worksheet.getCell('B6').value = 'Corte Cheque: ';
          worksheet.getCell('C6').value = this.TotalpagoCheque;
          worksheet.getCell('B7').value = 'Corte Transferencia: ';
          worksheet.getCell('C7').value = this.TotalpagoTransferencia;
          worksheet.getCell('B8').value = 'Corte MSI: ';
          worksheet.getCell('C8').value = this.TotalpagoMSI;
          worksheet.getCell('B9').value = 'Corte Tarjeta Credito: ';
          worksheet.getCell('C9').value = this.TotalpagoTarjetaCredito;
          worksheet.getCell('B10').value = 'Total Corte: ';
          worksheet.getCell('C10').value = this.totalPagosEfectivo + this.totalPagosTarjetaDebito + this.TotalpagoCheque + this.TotalpagoTransferencia + this.TotalpagoMSI + this.TotalpagoTarjetaCredito;
          const celdas = ['C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'];
        celdas.forEach(celda => {
          worksheet.getCell(celda).numFmt = '$#,##0.00';
        });
        worksheet.getCell('B2').numFmt = '$#,##0.00';

          worksheet.getCell('A13').value = 'Llantas Nuevas: ';
          worksheet.getCell('B13').value = this.llantasNuevas;
          worksheet.getCell('B13').numFmt = '$#,##0.00';
          worksheet.getCell('A14').value = 'Llantas Semi Nuevas: ';
          worksheet.getCell('B14').value = this.llantasSemiNuevas;
          worksheet.getCell('B14').numFmt = '$#,##0.00';
          worksheet.getCell('A15').value = 'Total: ';
          worksheet.getCell('B15').value = this.llantasNuevas + this.llantasSemiNuevas;
          worksheet.getCell('B15').numFmt = '$#,##0.00';


          worksheet.getCell('D13').value = 'Retiro de Efectivo ';
          worksheet.getCell('E13').value = 'Cantidad';
          worksheet.getCell('F13').value = 'Fecha Retiro';
          worksheet.getCell('G13').value = 'Motivo Retiro';

          
          let startRow = 14; 
        this.cortes.forEach((corte: any) => {
          worksheet.getRow(startRow).getCell(4).value = corte.tipo; 
          worksheet.getRow(startRow).getCell(5).value = this.formatearMoneda(corte.monto); 
          worksheet.getRow(startRow).getCell(6).value = this.formatearFecha(corte.fechaCorte);
          worksheet.getRow(startRow).getCell(7).value = corte.descrpcion; 
          startRow++;
        });
        worksheet.getCell('E14').numFmt = '$#,##0.00';

        worksheet.getCell('A18').value = 'Servicios Vendidos: ';
        worksheet.getCell('B18').value = 'Cantidad';
        let startRow2 = 19; 
        this.serviciosVendidos.forEach((servicio: any) => {
          worksheet.getRow(startRow2).getCell(1).value = servicio.servicio; 
          worksheet.getRow(startRow2).getCell(2).value = servicio.cantidad; 

          startRow2++;
        });

          const fileName = `turno_${turno.turnoid}.xlsx`;
          workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
          });
          const datos = {
            turnoid: turnoid,
            usuarioid: turno.usuarioid,
          };
          this.api.modificarDatos('administracion/terminar/turno', datos).subscribe(() => {
            this.obtenerTurnos();
          });
        }
      });
    }
    


  abrirHistorialCortes(){
    this.dialog.open(ModHistorialCortesComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      }
    );
  }
  obtenerPagos(){
    console.log('TurnoIdPago', this.turnoId);
    this.api.consultaDatos('administracion/turnos/pagos/' + this.turnoId).subscribe((pagos: any) => {
      this.TotalpagoCheque =pagos.filter((pago: any) => pago.tipoPagoId == 6).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
      this.totalPagosEfectivo = pagos.filter((pago: any) => pago.tipoPagoId == 5).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
      this.totalPagosTarjetaDebito = pagos.filter((pago: any) => pago.tipoPagoId == 7).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
      this.TotalpagoTransferencia = pagos.filter((pago: any) => pago.tipoPagoId == 11).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
      this.TotalpagoMSI = pagos.filter((pago: any) => pago.tipoPagoId == 13).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
      this.TotalpagoTarjetaCredito = pagos.filter((pago: any) => pago.tipoPagoId == 12).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
    })
  }

  consultarServicios(){
    this.api.consultaDatos('administracion/turnos/servicios/' + this.turnoId).subscribe((servicios: any) => {
      console.log('Servicios', servicios);
      this.serviciosVendidos = servicios;
    })
  }

  consultarProductos(){
    this.api.consultaDatos('administracion/turnos/tunoTipo/'+ this.turnoId).subscribe((producto:any)=>{
        console.log('Estos son los productos', producto);
        if(producto.tipo != null){}
        this.llantasNuevas = producto.filter((producto: any) => {
          const tipo = producto.tipo?.toLowerCase().trim();
          return tipo === 'nueva' || tipo === 'nuevas';
        }).length;
        
        this.llantasSemiNuevas = producto.filter((producto: any) => {
          const tipo = producto.tipo?.toLowerCase().trim();
          return tipo.includes('semi'); 
        }).length;
        console.log('Llantas Nuevas', this.llantasNuevas);
        console.log('Llantas Semi Nuevas', this.llantasSemiNuevas);
      
    })
  }

  
  consultarRetirosEfectivo() {
    console.log('TurnoId', this.turnoId);
    this.api.consultaDatos('administracion/turnos/turnosCorte/' + this.turnoId).subscribe((cortes: any) => {
      this.cortes=cortes;
    })
 }

  obtenerTurnos(){
    this.api.consultaDatos('administracion/turnos/' + this.sucursalId).subscribe((turnos: Array<Turno>) => {
      console.log('Turnos Oficial', turnos);
      this.turnoId = turnos[0].turnoid;
      this.dataSource = new MatTableDataSource<Turno>(turnos);
      this.obtenerPermisoBotones();
      this.obtenerPagos();
      this.consultarRetirosEfectivo();
      this.consultarProductos();
      this.consultarServicios();
   
    })
  }

  hacerCorte(turnoid: number){
    const config = {
      id: "dialog1",
      data: {
        turnoid: turnoid,
        cantidadMax: this.dataSource.data.find(ele => ele.turnoid == turnoid)?.cantidadinicial,
        cantidadRestante: this.dataSource.data.find(ele => ele.turnoid == turnoid)?.restante
      }
    }
    const dialogRef = this.dialog.open(ModCortesComponent, config);
    dialogRef.afterClosed().subscribe((response) => {
      this.obtenerTurnos();
    })
  }

  abrirHistorialRetiros(){
    this.dialog.open(ModHistorialRetirosEfectivoComponent,
      {
        maxWidth: '90vW',
        width: '90vW',
        data: {
          turnoid: this.turnoId
        }
      }
    )}

}
