import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as sjcl from 'sjcl';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';

@Component({
    selector: 'app-mod-password',
    imports: [CompartidosModule],
    templateUrl: './mod-password.component.html',
    styleUrl: './mod-password.component.css'
})
export class ModPasswordComponent implements OnInit{
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialogRef: MatDialogRef<any>) { }
  
  formGroup = new FormGroup ({
    password : new FormControl('', [Validators.required, Validators.minLength(8)]),
    passwordConf : new FormControl('', [Validators.required, this.validarConfirmacion()]),
  })
  ngOnInit(): void {
    
  }

  validarConfirmacion(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.parent){
        if(control.parent.get('password')?.value != control.value){
          return {noCoincide: true};
        }
      }
      return null;
    }
  }

  cambiarPassword(){
    console.log(this.data.acceso);
    if(this.formGroup.controls['password'].errors){
      console.log(this.formGroup.controls['password'].errors);
      if(this.formGroup.controls['password'].errors['minlength']){
        swal("Contraseña muy corta", "La contraseña debe tener al menos 8 caracteres.", "error");
        return
      }
    }
    if(!this.formGroup.controls['password'].valid){
      swal("La contraseña no puede estar vacía", "Por favor, ingrese una contraseña.", "error");
      return;
    }
    if(!this.formGroup.controls['passwordConf'].valid){
      swal("Las contraseñas no coinciden", "Ingrese la misma contraseña.", "error");
      return;
    }
    
    const bits = 256;
    const saltos = sjcl.random.randomWords(8,4);
    const key = sjcl.misc.pbkdf2(this.formGroup.controls['password'].value || '', saltos, bits);
    const iv = sjcl.random.randomWords(4,4);
    const cifrado: any = sjcl.encrypt(key, this.formGroup.controls['password'].value || '', {iv: iv, salt: saltos});
    const datosEnviar = {
      usuarioid: this.data.usuarioid,
      clave: cifrado,
      key: key,
    };
    this.api.modificarDatos('configuraciones/password', datosEnviar).subscribe((response) => {
      swal("Contraseña cambiada", "La contraseña se cambió correctamente.", "success");
      this.dialogRef.close();
    })
  }

}
