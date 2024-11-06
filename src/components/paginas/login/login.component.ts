import { Component } from '@angular/core';
import { CompartidosModule } from '../../modulos/compartidos.module';
import { FormControl } from '@angular/forms';
import * as crypt from 'bcryptjs';
import * as sjcl from 'sjcl';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import swal from 'sweetalert';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario = new FormControl();
  clave = new FormControl();

  constructor(private api: ApiService, private router: Router){}

  async login(){
    const bits = 256;
    const saltos = sjcl.random.randomWords(8,4);
    const key = sjcl.misc.pbkdf2(this.clave.value, saltos, bits);
    const iv = sjcl.random.randomWords(4,4);
    const cifrado: any = sjcl.encrypt(key, this.clave.value, {iv: iv, salt: saltos});
    
    const datosEnviar = {
      acceso: this.usuario.value,
      clave: cifrado,
      key: key,
    };

    console.log(datosEnviar);
    
    this.api.sesion(datosEnviar).subscribe((response: any) => {
      console.log(response);
      if(!response.usuarioid){
        swal("Usuario Incorrecto", "El usuario que intentó no existe o la contraseña es incorrecta.", "error");
        return;
      }
      if(response.estatus != 8){
        swal("Usuario Inactivo.", "El usuario que intentó se encuentra inactivo.", "warning");
        return;
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('usuarioid', response.usuarioid);
        sessionStorage.setItem('nombreusuario', response.nombre);
        this.router.navigate(['/inicio']);
      }
    })
  }

  
}
