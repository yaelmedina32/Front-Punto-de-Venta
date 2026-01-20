import { Component, Inject } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { FormControl } from '@angular/forms';
import sjcl from 'sjcl';
import { ApiService } from '../../../../../services/api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-mod-autorizacion',
    imports: [CompartidosModule],
    templateUrl: './mod-autorizacion.component.html',
    styleUrl: './mod-autorizacion.component.css'
})
export class ModAutorizacionComponent {
  usuarioId: number;
  constructor( @Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialogRef: MatDialogRef<any>,){ 
    if(typeof window !== 'undefined'){
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
    }
  }
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
      usuarioid: this.usuarioId
    }
    console.log(datos);
    this.api.consultaDatosPost('operaciones/autorizar', datos).subscribe({
      next: (response: any) => {
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        console.log(error);
        this.dialogRef.close(false);
      }
    })
  }
}
