import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../../services/api.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'file-saver';

@Component({
    selector: 'app-mod-excel',
    imports: [CompartidosModule],
    templateUrl: './mod-excel.component.html',
    styleUrl: './mod-excel.component.css'
})
export class ModExcelComponent implements OnInit{
  columnasDesplegadasLetras = ['letra']
  columnasDesplegadasProductos = ['marca', 'modelo', 'ancho', 'alto', 'rin', 'roc', 'carga', 'letra']
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialogRef: MatDialogRef<any>){}

  ngOnInit(): void {
    console.log(this.data);
    if(this.data.productos.length == 0 && this.data.letras == 0 && this.data.marcas.length == 0){
      swal({title: 'Datos Validados', text: '¿Desea insertar el inventario?', buttons: ['No', 'Si'], icon: 'success'}).then((response) => {
        if(response){
          this.guardarExcel();
        }
      })
    }else{
      swal("Datos faltantes en la Base de datos", 
        "Se encontraron algunos datos faltantes dentro de la base de datos antes de insertarlos en el inventario", 
        "warning");
    }
  }

  descargarExcel(){
    const wb = new ExcelJS.Workbook();
    if(this.data.celdasLetras.length > 0){
      const ws = wb.addWorksheet('Letras');
      ws.addRow(['Letras no registradas dentro del sistema']);

      let fila = ws.getRow(1);
      fila.font = { size: 20, bold: true }
      fila.alignment = { horizontal: "center" };
      ws.mergeCells('A1:M1');
      
      ws.addRow(["Letra", "Celda"]);
      fila = ws.getRow(2);
      fila.font = { size: 15, bold: true };
      this.data.celdasLetras.forEach((element: any) => {
        ws.addRow([element.letra, element.celda])
      });
    }
    if(this.data.celdasMarcas.length > 0){
      const ws = wb.addWorksheet('Marcas');

      ws.addRow(['Marcas no registradas dentro del sistema']);
      let fila = ws.getRow(1);
      fila.font = { size: 20, bold: true }
      fila.alignment = { horizontal: "center" };
      ws.mergeCells('A1:M1');
      
      ws.addRow(["Marca", "Celda"]);
      fila = ws.getRow(2);
      fila.font = { size: 15, bold: true };
      let columna = ws.getColumn(1);
      columna.width = 26
      this.data.celdasMarcas.forEach((element: any) => {
        ws.addRow([element.marca, element.celda])
      });
    }
    wb.xlsx.writeBuffer().then((data: any) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'excelErrores.xlsx');
    })
  }

  guardarExcel(){
    swal({title: 'Guardar Datos', text: '¿Seguro de que desea guardar los datos al excel? \nSe insertarán los datos faltantes', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        this.api.insertarDatos('operaciones/inventario/excel/faltantes', this.data).subscribe((response) => {
          this.dialogRef.close();
        })
      }
    })
  }
}
