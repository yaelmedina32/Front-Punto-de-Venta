import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mod-turno',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-turno.component.html',
  styleUrl: './mod-turno.component.css'
})
export class ModTurnoComponent implements OnInit{
  monto = new FormControl();
  usuarioId = 0;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialog: MatDialogRef<any>){
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
  }

  ngOnInit(): void {
    console.log(this.data.abierto);
  }

  validarInput(){
    if(this.monto.value < 0){
      swal("Error en la cantidad", "No puede abrir con una cantidad menor o igual a 0", "error");
      this.monto.setValue('0');
    }
  }

  guardarTurno(){
    const currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
    swal({title: 'Inicio de turno', 
      text: `¿Seguro que desea abrir el turno con ${currency.format(this.monto.value)}?`,
      buttons: ['No', 'Si'], 
      icon: "warning"}).then((response) => {
        if(response) {
          const datos = {
            usuarioid: this.usuarioId,
            cantidad: this.monto.value,
            sucursalid: this.data.sucursalid,
          }
          this.api.insertarDatos('administracion/turno', datos).subscribe((response: any) => {
            swal("Turno inicializado", "Se inició el turno correctamente\n Para Iniciar un nuevo turno deberá finalizar el actual", "success");
            this.dialog.close();
          })
        }
    })
  }
}
