import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { ElementRef } from '@angular/core';
import { MatTab, MatTabChangeEvent } from '@angular/material/tabs';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { backgroundImage } from 'html2canvas/dist/types/css/property-descriptors/background-image';

export class DatosDetalles{
  ventaId: number;
  estatusVenta: string;
  pagoId: number;
  estatusPagoVenta: string;
  montoVenta: number;
  montoPago: number;
  fechaPago: string;
  nombre: string;
  estatusVentaId: number;
  estatusPagoId: number;
}
export class DatosDetallesOC{
    pagoId: number;
    monto: number;
    fechapago: string;
    estatusPagoOc: string;
    ordenCompraId: number;
    importeTotal: number;
    pendiente: number;
    solicitante: string;
    estatusOrdenCompra: string;
    estatusOcId: number;
  estatusPagoOcId: number;
  }


@Component({
    selector: 'app-detallespago',
    imports: [CompartidosModule],
    templateUrl: './detallespago.component.html',
    styleUrl: './detallespago.component.css'
}) 

export class ModDetallespagoComponent implements OnInit {
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  usuarioId = 0;
  menu: any[] = [];
columnasDesplegadas = ['ventaId', 'estatusVenta', 'pagoId','estatusPagoVenta','montoVenta','montoPago','fechaPago', 'nombre','eliminar'];
columnasDesplegadasOC = ['pagoId', 'monto', 'fechapago','estatusPagoOc','ordenCompraId','importeTotal', 'pendiente', 'solicitante', 'estatusOrdenCompra','eliminar'];
dataSource = new MatTableDataSource <DatosDetalles> ();
dataSourceOC = new MatTableDataSource <DatosDetallesOC> ();
dataSourceAuxiliar: Array <DatosDetalles> = [];
dataSourceAuxiliars: Array <DatosDetallesOC> = [];
totalVentas = 0;
botonEliminarDp:boolean=false;
filtrarRegistrados = false;
selectedTab = 0;

constructor(private api: ApiService, private dialog: MatDialog, private renderer: Renderer2){
  if (typeof window !== 'undefined') {
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');}
}
toggleBotonTerminarTurno (){
  this.botonEliminarDp = !this.botonEliminarDp
 }
ngOnInit(): void {
  
}
ngAfterViewInit(): void {
  this.ObtenerDatosVenta(); 
  this.ObtenerDatosOedenCompra();
 
  }
  cambiarTab(event :MatTabChangeEvent) {
    this.selectedTab = event.index;
  }

  async accionSegunTab(){
    if(this.selectedTab == 0){
      //Logica para la tabla de ventas
      const workbook = new ExcelJS.Workbook();
      const fechaHora = new Date();
      const fecha = fechaHora.getDate() + '-' + (fechaHora.getMonth() + 1) + '-' + fechaHora.getFullYear();
      const hora = fechaHora.getHours() + ':' + fechaHora.getMinutes() + ':' + fechaHora.getSeconds();
      const worksheet = workbook.addWorksheet('Ventas',{headerFooter: {firstHeader: '&C&K0000FFHistorial de Ventas'}});
      worksheet.getRow(1).font = {bold: true};
      worksheet.getCell('D1').value = 'Historial de Pagos de Ventas';
      worksheet.getCell('D1').alignment = {horizontal: 'center', vertical: 'middle'};
      worksheet.getCell('G1').value = 'Fecha: ' + fecha + ' Hora: ' + hora;
      worksheet.getCell('G1').alignment = {horizontal: 'center', vertical: 'middle'}; 

      // Lee la imagen como un buffer
      const imagePath = 'logo.jpg';  
      const imageBuffer = await fetch(imagePath).then(res => res.arrayBuffer());
  
      // Se grega la imagen al archivo Excel
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'jpeg'
      });
  
          // Se inserta la imagen en la celda específica
    worksheet.addImage(imageId, {
      tl: { col: 1, row: 0 }, 
      ext: { width: 115, height: 115 }, 
    });
      worksheet.mergeCells('G1:H1');
      worksheet.mergeCells('A1:B1');
      worksheet.mergeCells('D1:F1');
      worksheet.getCell('A1').alignment = {horizontal: 'center', vertical: 'middle'};
      worksheet.getRow(1).height = 130;
      worksheet.columns=[
        {width: 10},
        {width: 20},
        {width: 10},  
        {width: 30},
        {width: 30},
        {width: 30},
        {width: 20},
        {width: 20}
      ]
      const header = ['Folio Venta', 'Estatus Venta', 'Pago Id', 'Estatus Pago', 'Monto Venta', 'Monto Pago', 'Fecha Pago', 'Nombre'];
      const headerRow =worksheet.addRow(header);
      headerRow.eachCell((cell:any) => {
        cell.font = {bold: true};
        cell.alignment = {horizontal: 'center', vertical: 'middle'}})
        worksheet.getRow(headerRow.number).height = 30;
      this.dataSource.data.forEach( (element: any) => {
        worksheet.addRow([element.ventaId, element.estatusVenta, element.pagoId, element.estatusPagoVenta, element.montoVenta, element.montoPago, element.fechaPago, element.nombre]);
      });
       workbook.xlsx.writeBuffer().then((buffer:any) => {
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          saveAs(blob, 'Reporte_Pago_Ventas.xlsx');
        });
    }else{
      //Logica para la tabla de ordenes de compra
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ordenes de Compra',{headerFooter: {firstHeader: '&C&K0000FFHistorial de Ordenes de Compra'}});
      const fechaHora = new Date();
      const fecha = fechaHora.getDate() + '-' + (fechaHora.getMonth() + 1) + '-' + fechaHora.getFullYear();
      const hora = fechaHora.getHours() + ':' + fechaHora.getMinutes() + ':' + fechaHora.getSeconds();
      worksheet.getRow(1).font = {bold: true};
      worksheet.getCell('D1').value = 'Historial de Pagos de Ordenes de Compra';
      worksheet.getCell('D1').alignment = {horizontal: 'center', vertical: 'middle'};
      worksheet.getCell('H1').value = 'Fecha: ' + fecha + ' Hora: ' + hora;
      worksheet.getCell('H1').alignment = {horizontal: 'center', vertical: 'middle'}; 
      const imagePath = 'logo.jpg';  
      const imageBuffer = await fetch(imagePath).then(res => res.arrayBuffer());

      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'jpeg'
      });
    worksheet.addImage(imageId, {
      tl: { col: 1, row: 0 }, 
      ext: { width: 115, height: 115 }, 
    });
      worksheet.mergeCells('H1:I1');
      worksheet.mergeCells('A1:B1');
      worksheet.mergeCells('D1:G1');
      worksheet.getCell('A1').alignment = {horizontal: 'center', vertical: 'middle'};
      worksheet.getRow(1).height = 130;
      worksheet.columns=[
        {width: 15},
        {width: 15},
        {width: 15},  
        {width: 20},
        {width: 17},
        {width: 25},
        {width: 20},
        {width: 20},
        {width: 20}
      ]
      const header = ['Pago Id', 'Monto', 'Fecha Pago', 'Estatus Pago', 'Orden Compra Id', 'Importe Total', 'Pendiente', 'Solicitante', 'Estatus Orden Compra'];
      const headerRow =worksheet.addRow(header);
      headerRow.eachCell((cell:any) => {
        cell.font = {bold: true}
        cell.alignment = {horizontal: 'center', vertical: 'middle'}})
        worksheet.getRow(headerRow.number).height = 30;
      this.dataSourceOC.data.forEach( (element: any) => {
        worksheet.addRow([element.pagoId, element.monto, element.fechapago, element.estatusPagoOc, element.ordenCompraId, element.importeTotal, element.pendiente, element.solicitante, element.estatusOrdenCompra]);
      });
       workbook.xlsx.writeBuffer().then((buffer:any) => {
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          saveAs(blob, 'Reporte_Pagos_OrdenesCompra.xlsx');
        });
    }
  }
 
bufferCambios: Array<any> = []
filtrarDatos(texto: string, objeto: string){
  console.log(this.dataSourceAuxiliar.map(ele => ele.montoVenta ? ele.montoVenta.toString() : ''));
    //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
    const indiceCambios = this.bufferCambios.findIndex(ele => ele['objeto'] == objeto);
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

        this.bufferCambios.forEach(element => {
          const valor = item[element.objeto] ? item[element.objeto].toString().trim().toLowerCase() : '';  
          if (valor.includes(element.valor.toLowerCase())) {
              contador++;
          }
      });
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
bufferCambiosOc: Array<any> = []
filtrarDatosOc(texto: string, objeto: string){
  
  //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
  const indiceCambios = this.bufferCambiosOc.findIndex(ele => ele['objeto'] == objeto);
  if(indiceCambios == -1){
      this.bufferCambiosOc.push({ valor:  texto , objeto: objeto });
  }else{
      //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
      this.bufferCambiosOc[indiceCambios]['valor'] = texto;
  }
  //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
  this.dataSourceOC.data = this.dataSourceAuxiliars.filter( (item: any) => {
      let contador = 0;
      //USO UN CONTADOR PARA IR CONTANDO LAS VECES QUE EL FILTRO ES CORRECTO, SE SUMA UNO POR CADA FILTRO CORRECTO DENTRO DEL VECTOR DE BUFFS
      //EL REGISTRO ES CORRECTO SI EL OBJETO DE ESE REGISTRO ACTUAL ES IGUAL AL TEXTO 
      this.bufferCambiosOc.forEach( element=> {
          if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
              contador++;
          }
      })
      //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL BUFFER, ENTONCES LO DEVUELÑVE
      if (contador == this.bufferCambiosOc.length) return item;
  });
  //Y CUANDO EL FILTRO ESTÉ VACÍO, ENTONCES LO ELIMINO DEL BUFFER
  if(texto == ''){
      this.bufferCambiosOc.splice(indiceCambios, 1);
  }

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

ObtenerDatosVenta(){
this.api.consultaDatos('operaciones/detallePago').subscribe((detalles: Array<DatosDetalles>) =>{
  this.dataSource = new MatTableDataSource<DatosDetalles>(detalles);
  this.dataSourceAuxiliar = detalles;
  this.totalVentas = this.dataSource.data.length;
  this.obtenerPermisoBotones();
})
};

ObtenerDatosOedenCompra(){
    this.api.consultaDatos('operaciones/detallespagoOc').subscribe((detallesoc: Array<DatosDetallesOC>) =>{
      this.dataSourceOC = new MatTableDataSource<DatosDetallesOC>(detallesoc);
      this.dataSourceAuxiliars = detallesoc;
      this.totalVentas = this.dataSourceOC.data.length;
      this.obtenerPermisoBotones();
    })
    };

    cambiarEstatusV(pagoId: number){
     const indice = this.dataSource.data.findIndex(ele => ele.pagoId == pagoId) ;
     swal({title: 'Cancelar Pago', text: '¿Seguro que desea cancelar el pago?', buttons:['NO', 'SI'], icon: "warning"}).then((valor:any)=>{
        if(valor){
            this.dataSource.data[indice].estatusVentaId = 14 ;
            this.dataSource.data[indice].estatusPagoId = 3;
            
         this.api.modificarDatos('operaciones/cambiarEstatusV', this.dataSource.data[indice]).subscribe((response: any) => {
          if(response.mensaje){
            this.ObtenerDatosVenta();
          }
          
        });
        }
     })
    }

    
    cambiarEstatusOC(pagoId: number){
      const indice = this.dataSourceOC.data.findIndex(ele => ele.pagoId == pagoId) ;
      swal({title: 'Cancelar Pago', text: '¿Seguro que desea cancelar el pago?', buttons:['NO', 'SI'], icon: "warning"}).then((valor:any)=>{
         if(valor){
             this.dataSourceOC.data[indice].estatusOcId = 1 ;
             this.dataSourceOC.data[indice].estatusPagoOcId = 3;
             
          this.api.modificarDatos('operaciones/cambiarEstatusOc', this.dataSourceOC.data[indice]).subscribe((response: any) => {
           if(response.mensaje){
             this.ObtenerDatosOedenCompra();
           }
           
         });
         }
      })
    }

}

