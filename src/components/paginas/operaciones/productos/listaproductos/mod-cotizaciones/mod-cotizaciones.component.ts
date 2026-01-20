import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../../../services/api.service';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface Cotizacion {
  folioCotizacionId: number;
    nombreProducto: string;
    precio: number;
    fecha: string;
}
@Component({
  selector: 'app-mod-cotizaciones',
  imports: [CompartidosModule],
  templateUrl: './mod-cotizaciones.component.html',
  styleUrls: ['./mod-cotizaciones.component.css']
})
export class ModCotizacionesComponent {
dataSource = new MatTableDataSource<Cotizacion>();
dataSourceAuxiliar: Cotizacion[] = [];
filtroCambios: any[] = [];
  columnasDesplegadas: string[] = ['folioCotizacionId', 'nombreProducto', 'precio', 'fecha'];
constructor(private api: ApiService) { }
 
ngOnInit() {
    this.consultarCotizaciones();
  }


consultarCotizaciones() {
    this.api.consultaDatos('operaciones/cotizacion').subscribe({
        next: (response) => {
            this.dataSource.data = response;
            this.dataSourceAuxiliar = response;
            console.log('Cotizaciones consultadas', response);
        },
        error: (error) => {
            console.error('Error al consultar las cotizaciones', error);
        }
        });}

      async accionSegunTab(){
  
          const workbook = new ExcelJS.Workbook();
          const fechaHora = new Date();
      const fecha = fechaHora.getDate() + '-' + (fechaHora.getMonth() + 1) + '-' + fechaHora.getFullYear();
      const hora = fechaHora.getHours() + ':' + fechaHora.getMinutes() + ':' + fechaHora.getSeconds();
      const worksheet = workbook.addWorksheet('Cotizaciones',{headerFooter: {firstHeader: '&C&K0000FFHistorial de Ventas'}});
      worksheet.getRow(1).font = {bold: true};
      worksheet.getCell('B1').value = 'Historial de Cotizaciones';
      worksheet.getCell('B1').alignment = {horizontal: 'center', vertical: 'middle'};
      worksheet.getCell('D1').value = 'Fecha: ' + fecha + ' Hora: ' + hora;
      worksheet.getCell('D1').alignment = {horizontal: 'center', vertical: 'middle'}; 

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
      tl: { col: 0, row: 0 }, 
      ext: { width: 115, height: 115 }, 
    });
      worksheet.mergeCells('B1:C1');
      worksheet.getCell('A1').alignment = {horizontal: 'center', vertical: 'middle'};
      worksheet.getRow(1).height = 130;
      worksheet.columns=[
        {width: 20},
        {width: 20},
        {width: 10},  
        {width: 30},

      ]
            const headerRow = worksheet.addRow(['Folio Cotizacion', 'Nombre Producto', 'Precio', 'Fecha']);
            headerRow.font = { bold: true };
            this.dataSource.data.forEach((item) => {
                worksheet.addRow([item.folioCotizacionId, item.nombreProducto, item.precio, item.fecha]);
            });
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileName = 'Cotizaciones.xlsx';
            saveAs(blob, fileName);
            console.log('Excel generado y descargado', fileName);
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