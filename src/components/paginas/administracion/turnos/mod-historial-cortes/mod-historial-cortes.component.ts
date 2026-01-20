import { Component, OnInit, viewChildren } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { ApiService } from '../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChildren } from '@angular/core';
import * as ExcelJS from 'exceljs';
export class Cortes{
  corteid: number;
  monto: number;
  fechacorte: string;
  nombre: string;
  fechainicio: string;
  fechacierre: string;
  cantidadInicial: number;
  turnoId: number;
}

@Component({
    selector: 'app-mod-historial-cortes',
    imports: [CompartidosModule],
    templateUrl: './mod-historial-cortes.component.html',
    styleUrl: './mod-historial-cortes.component.css'
})
export class ModHistorialCortesComponent implements OnInit{
  @ ViewChildren ('mostrarAlta') elementosBotones:     QueryList<ElementRef>
  usuarioId =0;
  mostrarBotonE: boolean = false;
  menu:any[]= [];
  filtroCambios: any [] = [];
  dataSourceAuxiliar: Cortes[] = [];
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  dataSource = new MatTableDataSource<Cortes>();
  columnasDesplegadas = ['nombre', 'monto','CantidadInicial', 'fechacorte', 'fechainicio', 'fechafin', 'estatus', 'acciones'];
  historialRetiros: {turnoid: number, monto: number, usuario: string, tipo: string}[] = []

  constructor(private api: ApiService, private renderer: Renderer2){

  }
  
  ngOnInit(): void {
    this.cargarHistorial();
    this.cargarRetiros();
    }
  ngAfterView() :void {


  }


  cargarRetiros(){
    this.api.consultaDatos('administracion/historial/retiros').subscribe((retiros: Array<{turnoid: number, monto: number, usuario: string, tipo: string}>) => {
      this.historialRetiros = retiros;
    })
  }

  toggleBotoE(){
    this.mostrarBotonE = !this.mostrarBotonE
  }
  cancelarCorte(corteid: number){
    const datos = {
      corteid: corteid
    }
    swal({title: 'Cancelar Corte', text: '¿Seguro que desea cancelar el corte realizado?', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        this.api.modificarDatos('administracion/cancelar/corte', datos).subscribe((response )=> {
          this.cargarHistorial();
        })
      }
    })
  }

  catalogoServicios: Array<{productoId: number, nombre: string}> = []

  cargarHistorial(){
    this.api.consultaDatos('administracion/historial/cortes').subscribe((cortes: Array<Cortes>) => {
      this.dataSource  = new MatTableDataSource<Cortes>(cortes);
      this.dataSourceAuxiliar = cortes;
      this.obtenerPermisoBotones();
    })

    this.api.consultaDatos('administracion/servicios').subscribe((servicios: Array<{productoId: number, nombre: string}>) => {
      this.catalogoServicios = servicios;
    })
  }

  obtenerPermisoBotones() {
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
    }
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
        if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){

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


  imprimirRegistro(element: Cortes){
    console.log(this.historialRetiros.find(ele => ele.turnoid == element.turnoId));
    this.api.consultaDatos('administracion/ventas/turno/' + element.turnoId).subscribe((ventas: Array<{ ventaId: number, cantidad: number, montoVenta: number, tipo: string, ordencompraId: number, productoId: number, producto: string, precioVenta: number }>) => {
      this.api.consultaDatos('administracion/ingresos/turno/' + element.turnoId).subscribe((ingresos: Array<{ ventaId: number, cantidad: number, montoVenta: number, tipo: string, ordencompraId: number, productoId: number, producto: string, precioVenta: number }>) => {
        this.api.consultaDatos('administracion/turnos/pagos/' + element.turnoId).subscribe((pagos: any) => {  
        const TotalpagoCheque =pagos.filter((pago: any) => pago.tipoPagoId == 6).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
        const totalPagosEfectivo = pagos.filter((pago: any) => pago.tipoPagoId == 5).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
        const totalPagosTarjetaDebito = pagos.filter((pago: any) => pago.tipoPagoId == 7).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
        const TotalpagoTransferencia = pagos.filter((pago: any) => pago.tipoPagoId == 11).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
        const TotalpagoMSI = pagos.filter((pago: any) => pago.tipoPagoId == 13).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
        const TotalpagoTarjetaCredito = pagos.filter((pago: any) => pago.tipoPagoId == 12).reduce((total:number,pago:any)=>(total + Number(pago.monto)), 0);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Corte');

        worksheet.columns = [
          { header: 'Nombre', key: 'nombre', width: 25 },
          { header: 'Ventas', key: 'monto', width: 22 },
          { header: 'Cantidad Inicial', key: 'cantidadInicial', width: 20 },
          { header: 'Fecha del Corte', key: 'fechacorte', width: 20 },
          { header: 'Inicio del Turno', key: 'fechainicio', width: 20 },
          { header: 'Fin del Turno', key: 'fechacierre', width: 20 },
        ];

        worksheet.getRow(1).font = { bold: true };

        worksheet.getColumn(7).width = 20;
        worksheet.getColumn(8).width = 20;

        const retiroIngresos = this.historialRetiros.find(ele => ele.turnoid == element.turnoId && ele.tipo == 'retiroIngresos');
        const retiroCaja = this.historialRetiros.find(ele => ele.turnoid == element.turnoId && ele.tipo == 'retiroCaja');

        const row = worksheet.addRow({
          nombre: (element as any).nombre,
          monto: Number((element as any).monto ?? 0),
          cantidadInicial: element.cantidadInicial,
          fechacorte: (element as any).fechacorte,
          fechainicio: (element as any).fechainicio,
          fechacierre: (element as any).fechacierre,
        });

        // Formato de moneda para la celda de monto
        row.getCell(2).numFmt = '$#,##0.00';
        row.getCell(3).numFmt = '$#,##0.00';

        worksheet.getColumn('C').numFmt = '$#,##0.00';
        worksheet.getColumn('B').width = 22;

        
        worksheet.getCell('B4').value = 'Corte Efectivo: ';
        worksheet.getCell('C4').value =totalPagosEfectivo;
        worksheet.getCell('E4').value = 'Retiro de ingresos';
        worksheet.getCell('F4').value = retiroIngresos ? Number(retiroIngresos.monto) : 0;
        worksheet.getCell('F4').numFmt = '$#,##0.00';

        worksheet.getCell('B5').value = 'Corte Tarjeta Debito: ';
        worksheet.getCell('C5').value = totalPagosTarjetaDebito;
        worksheet.getCell('E5').value = 'Retiro de Caja';
        worksheet.getCell('F5').value = retiroCaja ? Number(retiroCaja.monto) : 0;
        worksheet.getCell('F5').numFmt = '$#,##0.00';
        worksheet.getCell('B6').value = 'Corte Cheque: ';
        worksheet.getCell('C6').value = TotalpagoCheque;
        worksheet.getCell('B7').value = 'Corte Transferencia: ';
        worksheet.getCell('C7').value = TotalpagoTransferencia;
        worksheet.getCell('B8').value = 'Corte MSI: ';
        worksheet.getCell('C8').value = TotalpagoMSI;
        worksheet.getCell('B9').value = 'Corte Tarjeta Credito: ';
        worksheet.getCell('C9').value = TotalpagoTarjetaCredito;
        worksheet.getCell('B10').value = 'Total Ventas: ';
        worksheet.getCell('C10').value = totalPagosEfectivo + totalPagosTarjetaDebito + TotalpagoCheque + TotalpagoTransferencia + TotalpagoMSI + TotalpagoTarjetaCredito;
        worksheet.getCell('B11').value = 'Cantidad Inicial: ';
        worksheet.getCell('C11').value = Number(element.cantidadInicial);
        worksheet.getCell('B12').value = 'Total Corte: ';
        worksheet.getCell('C12').value = totalPagosEfectivo + totalPagosTarjetaDebito + TotalpagoCheque + TotalpagoTransferencia + TotalpagoMSI + TotalpagoTarjetaCredito + Number(element.cantidadInicial);

        // Sección de Ventas del Turno a partir de A12

        worksheet.addRow([]);

        // Escribir filas de ventas comenzando en la fila 14
        worksheet.mergeCells('B14:I14');
        const mergedCell = worksheet.getCell('B14');
        mergedCell.value = 'VENTAS';
        mergedCell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };

        mergedCell.font = { bold: true, color: { argb: 'FF000000' } };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        const ventasHeader = ['', 'Folio Venta', 'Producto', 'Cantidad', 'Precio Uniatrio', 'Precio Venta', 'Monto Venta', 'Pago Venta', 'Folio OC'];
        ventasHeader.push(...ventasHeader);
        const headerRowVentas = worksheet.getRow(15);
        headerRowVentas.values = ventasHeader;
        headerRowVentas.font = { bold: true };
        headerRowVentas.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRowVentas.height = 24;

        // Ajuste de anchos de columnas para la sección de ventas
        worksheet.getColumn(1).width = 12; // A: Venta ID
        worksheet.getColumn(2).width = 30; // B: Monto Venta
        worksheet.getColumn(3).width = 18; // C: Orden Compra ID
        worksheet.getColumn(4).width = 18; // D: Producto ID
        worksheet.getColumn(5).width = 26; // E: Producto
        worksheet.getColumn(6).width = 18; // F: Precio Venta
        worksheet.getColumn(7).width = 18; // G: Cantidad
        let ventasStartRow = 16;
        ventas.forEach((venta: any) => {
          const r = worksheet.getRow(ventasStartRow);
          r.values = ['', venta.ventaId, venta.producto, venta.cantidad, parseFloat(venta.precioUnitario), parseFloat(venta.precioVenta), parseFloat(venta.montoVenta), parseFloat(venta.pagoVenta), venta.ordencompraId];
          r.alignment = { horizontal: 'center', vertical: 'middle' };
          // Formatos de moneda
          ventasStartRow++;
        });

        for(let i = 14; i <= ventas.length + 14; i++){
          let valor = worksheet.getCell('G' + i);
          valor.numFmt = '$#,##0.00';
          valor = worksheet.getCell('E' + i);
          valor.numFmt = '$#,##0.00';
          
          valor = worksheet.getCell('F' + i);
          valor.numFmt = '$#,##0.00';

          valor = worksheet.getCell('H' + i);
          valor.numFmt = '$#,##0.00';
        }

        
        worksheet.mergeCells('K14:R14');
        const mergedCell2 = worksheet.getCell('K14');
        mergedCell2.value = 'INGRESOS';
        mergedCell2.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
        
        mergedCell2.font = { bold: true, color: { argb: 'FF000000' } };
        mergedCell2.alignment = { horizontal: 'center', vertical: 'middle' };
        
        worksheet.getColumn(9).width = 12; // A: Venta ID
        worksheet.getColumn(10).width = 30; // B: Monto Venta
        worksheet.getColumn(11).width = 30; // B: Pago Venta
        worksheet.getColumn(12).width = 18; // C: Orden Compra ID
        worksheet.getColumn(13).width = 18; // D: Producto ID
        worksheet.getColumn(14).width = 26; // E: Producto
        worksheet.getColumn(15).width = 18; // F: Precio Venta
        worksheet.getColumn(16).width = 18; // G: Cantidad

        let ingresosStartRow = 16;
        ingresos.forEach((ingreso: any) => {
          worksheet.getCell('K' + ingresosStartRow).value = ingreso.ventaId;
          worksheet.getCell('L' + ingresosStartRow).value = ingreso.producto;
          worksheet.getCell('M' + ingresosStartRow).value = ingreso.cantidad;
          worksheet.getCell('N' + ingresosStartRow).value = parseFloat(ingreso.precioUnitario);
          worksheet.getCell('O' + ingresosStartRow).value = parseFloat(ingreso.precioVenta);
          worksheet.getCell('P' + ingresosStartRow).value = parseFloat(ingreso.montoVenta);
          worksheet.getCell('Q' + ingresosStartRow).value = parseFloat((ingreso as any).pagoVenta ?? 0);
          worksheet.getCell('R' + ingresosStartRow).value = ingreso.ordencompraId;
          ['J','K','L','M','N','O','Q'].forEach((col) => {
            worksheet.getCell(col + ingresosStartRow).alignment = { horizontal: 'center', vertical: 'middle' };
          });

          worksheet.getCell('N' + ingresosStartRow).numFmt = '$#,##0.00';
          worksheet.getCell('O' + ingresosStartRow).numFmt = '$#,##0.00';
          worksheet.getCell('P' + ingresosStartRow).numFmt = '$#,##0.00';
          worksheet.getCell('Q' + ingresosStartRow).numFmt = '$#,##0.00';
          ingresosStartRow++;
        });



        worksheet.addRow([]);
        worksheet.addRow(['', 'Llantas Seminuevas: ', ventas.filter(ele => ele.tipo === 'Semi Nueva').length]);
        worksheet.addRow(['', 'Llantas Nuevas: ', ventas.filter(ele => ele.tipo === 'Nueva').length]);

        worksheet.getCell('C' + (ventas.length + 16)).numFmt = '0.00';
        worksheet.getCell('C' + (ventas.length + 17)).numFmt = '0.00';


        for(let i = 0; i < this.catalogoServicios.length; i++){
          const servicio = this.catalogoServicios[i];
          worksheet.addRow(['', servicio.nombre + ': ', ventas.filter(ele => ele.productoId === servicio.productoId).length * (ventas.find(ele => ele.productoId === servicio.productoId)?.cantidad ?? 1)]);
          worksheet.getCell('C' + (i + ventas.length + 18)).numFmt = '0.00';
        }
        

        const fileName = `corte_${(element as any).corteid ?? (element as any).fechacorte}.xlsx`;
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
        });
      })
      })
    });
  }
}
