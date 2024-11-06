import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { CompartidosModule } from '../../../../modulos/compartidos.module';

@Component({
  selector: 'app-mod-nofactura',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-nofactura.component.html',
  styleUrl: './mod-nofactura.component.css'
})
export class ModNofacturaComponent implements OnInit{

  numeroFactura = new FormControl('', Validators.required);

  constructor(private api: ApiService, private dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data:any){ }

  ngOnInit(): void { }
  
  guardarFactura(){
    if(!this.numeroFactura.valid){
      swal("Número de factura requerido", "Se requiere el número de factura para poder continuar", "error");
      return;
    }
    swal({title: 'Guardar Factura', text: '¿Desea guardar el número de factura para la orden de compra ' + this.data.ordencompraid +  ' ?',
      buttons: ['No', 'Si'], icon: "warning"
    }).then((response) => {
      if(response){
        const datos = {
          ordencompraid: this.data.ordencompraid,
          factura: this.numeroFactura.value,
        }
        this.api.modificarDatos('administracion/numerofactura', datos).subscribe((response) => {
          swal("Datos Insertados", "Se insertó correctamente el número de factura", "success");
          this.dialogRef.close({response: 'ok'});
        })
      }
    })
  }

}
