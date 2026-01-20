import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';

@Component({
    selector: 'app-mod-cortes',
    imports: [CompartidosModule],
    templateUrl: './mod-cortes.component.html',
    styleUrl: './mod-cortes.component.css'
})
export class ModCortesComponent implements OnInit{
  motivo = new FormControl();
  cantidad = new FormControl();
  dondeRetirar = new FormControl('retiroCaja');

  cantidadRestante = 0;
  usuarioId = 0;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialogRef: MatDialogRef<any>){
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
  }
  ngOnInit(): void {
    this.cantidadRestante = this.data.cantidadRestante;
  }

  validarCantidad(cantidad: number){
    this.cantidadRestante = this.data.cantidadRestante;
    if(cantidad < 0){
      swal("Error en la cantidad a retirar", "La cantidad debe ser mayor que 0", "error");
      this.cantidad.setValue(0);
      return;
    }
    
    if(cantidad > parseFloat(this.data.cantidadRestante)){
      swal("Error en la cantidad a retirar", "La cantidad a retirar es mayor a la restante", "error");
      this.cantidad.setValue(0);
      return;
    }
    
    this.cantidadRestante = this.cantidadRestante - this.cantidad.value;
  }

  hacerCorte(){
    if(!this.motivo.value || this.motivo.value == ""){
      swal("Error en el motivo", "El motivo es requerido", "error");
      return;
    }
    swal({title: 'Relizar Corte', text: '¿Seguro que desea realizar el retiro de efectivo?', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        const datos = {
          turnoid: this.data.turnoid,
          monto: this.data.cantidadRestante - this.cantidadRestante,
          motivo: this.motivo.value,
          usuarioid: this.usuarioId,
          tipo: this.dondeRetirar.value,
        }
        console.log(this.motivo.value),
        this.api.insertarDatos('administracion/retiroEfectivoo', datos).subscribe((response) => {
          this.dialogRef.close();
        })
      }
    })
  }

}
