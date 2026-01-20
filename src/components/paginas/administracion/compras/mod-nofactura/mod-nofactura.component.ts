import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { CompartidosModule } from '../../../../modulos/compartidos.module';

@Component({
    selector: 'app-mod-nofactura',
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
    const datos = {
      ordencompraid: this.data.ordencompraid,
      factura: this.numeroFactura.value,
    }
    this.api.modificarDatos('administracion/numerofactura', datos).subscribe((response) => {
      this.dialogRef.close({response: 'ok'});
    })
  }

}
