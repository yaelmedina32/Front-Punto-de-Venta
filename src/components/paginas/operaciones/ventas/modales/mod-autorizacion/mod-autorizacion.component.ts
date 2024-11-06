import { Component } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { FormControl } from '@angular/forms';
import sjcl from 'sjcl';
import { ApiService } from '../../../../../services/api.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mod-autorizacion',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-autorizacion.component.html',
  styleUrl: './mod-autorizacion.component.css'
})
export class ModAutorizacionComponent {
  constructor(private api: ApiService, private dialogRef: MatDialogRef<any>){ }
  clave = new FormControl();
  comprobarAutorizacion(){
    
    const bits = 256;
    const saltos = sjcl.random.randomWords(8,4);
    const key = sjcl.misc.pbkdf2(this.clave.value, saltos, bits);
    const iv = sjcl.random.randomWords(4,4);
    const cifrado: any = sjcl.encrypt(key, this.clave.value, {iv: iv, salt: saltos});
    const datos = {
      clave: cifrado,
      key: key,
    }
    this.api.consultaDatosPost('operaciones/autorizar', datos).subscribe((response) => {
      if(response.error){
        swal("Clave Incorrecta", "La clave del administrador es incorrecta", "error");
        this.dialogRef.close(false);
      }
      swal("Clave Correcta", "Se habilitará el módulo de descuentos", "success");
      this.dialogRef.close(true);
    })
  }
}
