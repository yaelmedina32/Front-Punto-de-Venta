import { AfterViewInit, Component, Renderer2, ViewChild, viewChild } from '@angular/core';
import { CompartidosModule } from '../../modulos/compartidos.module';
import { FormControl } from '@angular/forms';
import * as sjcl from 'sjcl';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import swal from 'sweetalert';

@Component({
    selector: 'app-login',
    imports: [CompartidosModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit{
  usuario = new FormControl();
  clave = new FormControl();
  @ViewChild('input') input: any;
  @ViewChild('form') form: any;

  constructor(private api: ApiService, private router: Router, private renderer: Renderer2){}

  ngAfterViewInit(): void {
    this.renderer.listen(this.input.nativeElement, 'focus', () => {
      this.renderer.addClass(this.form.nativeElement, 'focus');
    });
    this.renderer.listen(this.input.nativeElement, 'blur', () => {
      this.renderer.removeClass(this.form.nativeElement, 'focus');
    });
  }

  cambiarInput(){
    this.input.nativeElement.type == 'text' ? this.renderer.setAttribute(this.input.nativeElement, 'type', 'password') : this.renderer.setAttribute(this.input.nativeElement, 'type', 'text');
  }

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
    
    this.api.sesion(datosEnviar).subscribe((response: any) => {
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
        sessionStorage.setItem('token', response.token);
        console.log("token", response.token);
        this.router.navigate(['/inicio']);
      }
    })
  }

  
}
