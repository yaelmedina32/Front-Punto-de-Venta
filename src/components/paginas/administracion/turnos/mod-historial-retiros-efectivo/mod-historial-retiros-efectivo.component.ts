import { Component } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MatDialog } from '@angular/material/dialog';``
import * as ExcelJS from 'exceljs';
import { Renderer2 } from '@angular/core';
import { saveAs } from 'file-saver';
import { ViewChildren, QueryList, ElementRef } from '@angular/core';
export interface RetiroEfectivo {
  corteId:number;
  folioTurno: number;
  fechaCorte: string;
  monto: number;
  nombre: string;
  estatus: string;
  motivo: string;

}

@Component({
  selector: 'app-mod-historial-retiros-efectivo',
  imports: [CompartidosModule],
  templateUrl: './mod-historial-retiros-efectivo.component.html',
  styleUrl: './mod-historial-retiros-efectivo.component.css'
})
export class ModHistorialRetirosEfectivoComponent {
  @ViewChildren('mostrarAlta', { read: ElementRef }) elementosBotones!: QueryList<ElementRef>;
  filtroCambios: any [] = [];
  menu: any[] = [];
  usuarioId = 0;
  permisosBotones: any[] = [];
  arregloElementos: ElementRef[] = [];
dataSource = new MatTableDataSource<RetiroEfectivo>();
dataSourceAuxiliar: RetiroEfectivo[] = [];
displayedColumns: string[] = ['corteId','folioTurno', 'fechaCorte', 'monto', 'nombre', 'estatus', 'motivo', 'acciones'];

constructor( private api: ApiService, private dialog: MatDialog,  private renderer: Renderer2) { 
  if (typeof window !== 'undefined') {
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
  }
}
ngOnInit() {
  
 
}
ngAfterViewInit() {
  this.consultarRetirosEfectivo();
}

imprimirSeleccionados() {
  console.log('Elementos seleccionados:');

  this.elementosBotones.forEach((elemento, index) => {
    const nativeEl = (elemento as any)?._elementRef?.nativeElement;
    if (nativeEl) {
      console.log(`Elemento #${index} seleccionado:`, nativeEl.id);
    } else {
      console.warn(`Elemento #${index} no tiene nativeElement definido`, elemento);
    }
  });
}




consultarRetirosEfectivo(){
  this.api.consultaDatos('administracion/consultarRetiros').subscribe({
    next: (response) => {
      this.dataSource.data = response;
      this.dataSourceAuxiliar = response;
      
      console.log('Retiros de efectivo consultados', response);

      this.obtenerPermisoBotones();

    },
    error: (error) => {
      console.error('Error al consultar los retiros de efectivo', error);
    }
  })
}
cambiarEstatus(aprobar:number, corteId: number ){
  console.log(aprobar, corteId);
  swal({
    title: `${aprobar == 1 ? 'Aceptación ' : aprobar == 2 ? 'Rechazo ' : 'Pendiente' }de Retiro con folio ${corteId}`,
    text: `¿Seguro que desea ${aprobar == 1 ? 'aceptar' : aprobar == 2 ? 'rechazar' : 'pendiente'} el Retiro?`,
    buttons: ['No', 'Si'],
    icon: 'warning'
  }).then((response: any) => {
    if(response){
  const datos ={
    corteId: corteId,
    estatus: aprobar
  }
  this.api.consultaDatosPost('administracion/cambiarEstatusRetiro', datos).subscribe({
next: (response) => {
  console.log('Estatus cambiado', response); 
  this.consultarRetirosEfectivo();
  
},
error: (error) => {
  console.error('Error al cambiar el estatus', error);
}
  })}})}

  cerrarModal(){
    this.dialog.closeAll();
  }


    async accionSegunTab(){

        const workbook = new ExcelJS.Workbook();
        const fechaHora = new Date();
        const fecha = fechaHora.getDate() + '-' + (fechaHora.getMonth() + 1) + '-' + fechaHora.getFullYear();
        const hora = fechaHora.getHours() + ':' + fechaHora.getMinutes() + ':' + fechaHora.getSeconds();
        const worksheet = workbook.addWorksheet('Retiros',{headerFooter: {firstHeader: '&C&K0000FFHistorial de Retiros'}});
        worksheet.getRow(1).font = {bold: true};
        worksheet.getCell('D1').value = 'Historial de Retiros';
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
        const header = ['corteId','folioTurno', 'fechaCorte', 'monto', 'nombre', 'estatus', 'motivo'];
        const headerRow =worksheet.addRow(header);
        headerRow.eachCell((cell:any) => {
          cell.font = {bold: true};
          cell.alignment = {horizontal: 'center', vertical: 'middle'}})
          worksheet.getRow(headerRow.number).height = 30;
        this.dataSource.data.forEach( (element: any) => {
          worksheet.addRow([element.corteId, element.folioTurno, element.fechaCorte, element.monto, element.nombre, element.estatus, element.motivo]);
        });
         workbook.xlsx.writeBuffer().then((buffer:any) => {
            const blob = new Blob([buffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, 'Reporte_Retiros.xlsx');
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
  this.arregloElementos.forEach((elemento) => {
    
    const botonId = elemento.nativeElement.id; 
    const permisoEncontrado = this.permisosBotones.find(permiso => permiso.nombre === botonId);
    console.log('permisoencontrado',permisoEncontrado);
    if (permisoEncontrado) {
      console.log(`Permiso encontrado para el botón con id: ${botonId}`);
      this.renderer.setProperty(elemento.nativeElement, 'disabled', false); 
    } else {
      console.log(`No hay permiso para el botón con id: ${botonId}`);
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

}
