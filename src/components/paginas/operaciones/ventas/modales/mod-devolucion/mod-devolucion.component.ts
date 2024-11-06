import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../../services/api.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-mod-devolucion',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-devolucion.component.html',
  styleUrl: './mod-devolucion.component.css'
})
export class ModDevolucionComponent implements OnInit{

  motivo = new FormControl('', Validators.required);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialogRef: MatDialogRef<any>) {}

  ngOnInit(): void {
    
  }

  guardarDevolucion(){
    if(!this.motivo.valid){
      swal("Campo vacío", "Debe especificar el motivo del rechazo", "error");
      return;
    }
    const datos = {
      inventarioid: this.data.inventarioid,
      motivo: this.motivo.value,
      preciounitario: this.data.preciounitario,
      cancelada: this.data.cancelada
    }
    console.log(datos);
    this.api.modificarDatos('operaciones/devolucion', datos).subscribe((response )=> {
      this.dialogRef.close();
    })
  }
}
