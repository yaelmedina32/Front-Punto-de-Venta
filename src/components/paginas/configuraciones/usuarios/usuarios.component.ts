import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { map, Observable, startWith } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { FormControl, Validators } from '@angular/forms';
import * as sjcl from 'sjcl';
import { MatTableDataSource } from '@angular/material/table';
import { SessionService } from '../../../services/session.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { ModPasswordComponent } from './mod-password/mod-password.component';
import { AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';


export class Usuario{
  usuarioid: number;
  nombre: string;
  acceso: string;
  email: string;
  direccion: string;
  estatusid: number;
}

export class Permiso{
  menuid: number;
  nombre: string;
  asignado: number;
  usuarioid: number;
  permiso?: string; 
  usuario?: number;
  boton?: number;
}
export class Boton{
  asignado: number;
  nombre: string;
  botonId:number;
  nombreBoton:string;
  menuId: number;
  descripcion: string;
  usuarioId: number;
  seleccionado: boolean;
  preseleccionado: boolean;
}
export class MenuConBotones {
  nombreMenu: string;
  asignado: number;
  menuId: number;
  usuarioId:number;
  botones: Boton[];
}
// interface Botones {
//   botonId: number;
//   nombreBoton: string;
// }

// interface Menu {
//   menuId: number;
//   nombre: string;
//   asignado: number;
//   botones: Botones[];
// }

@Component({
    selector: 'app-usuarios',
    imports: [CompartidosModule, MatExpansionModule],
    templateUrl: './usuarios.component.html',
    styleUrl: './usuarios.component.css'
})

export class UsuariosComponent implements OnInit {
  menuId = 8;
  botonesSeleccionados: any[] = [];  
  botonesDesmarcados: any[] = [];  
  botonesfiltrados: any[]=[];
  botones: any[] = [];
  permisoData : Array<Permiso> = [];
  altaUsuario = true;
  usuariosFiltrados: Observable<any>;
  usuario = new FormControl();
  email = new FormControl();
  direccion = new FormControl();
  acceso = new FormControl('', Validators.required);
  usuarios: Array<Usuario> = [];
  estatusTabla: Array<any> = [];
  usuarioSeleccionado: Usuario = {
    nombre: "",
    usuarioid: 0,
    acceso: "",
    email: "",
    direccion: '',
    estatusid: 9,
  };
  nombreUsuario = new FormControl('', Validators.required);
  clave = new FormControl('', Validators.required);
  dataSource = new MatTableDataSource<Permiso>();
  dataSourceBotones = new MatTableDataSource<Boton>();
  asignaciones = [];
  columnasDesplegadas = ['nombre', 'asignado']
  @ViewChild('tabGroup') tabGroup: MatTabGroup;

  constructor(private api: ApiService, private session: SessionService, private dialog: MatDialog){}

  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
    this.usuario.setValue('');
    this.email.setValue('');
    this.direccion.setValue('');
    this.usuario.setValue('');
    this.obtenerUsuarios();
    this.obtenerEstatus();
  }
  ngAfterViewInit(): void {
    this.updateTabStretch();
  }
  actualizarUsuario(){
    const datosEnviar = {
      nombre: this.usuarioSeleccionado.nombre,
      acceso: this.acceso.value,
      email: this.email.value,
      direccion: this.direccion.value,
      estatusid: this.usuarioSeleccionado.estatusid,
      usuarioid: this.usuarioSeleccionado.usuarioid,
    }
    this.api.modificarDatos('configuraciones/usuario', datosEnviar).subscribe((response) => {
      this.obtenerUsuarios();
    });
  }

  cambiarPassword(){
    this.dialog.open(ModPasswordComponent, {
      maxWidth: '40vW',
      width: '100%',
      data: {usuarioid: this.usuarioSeleccionado.usuarioid}
    })
  }

  guardarPermisos(){
    swal({title: 'Guardar Permisos', text: '¿Seguro que desea asignarle los permisos al usuario ' + this.usuario.value + '?', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        this.dataSource.data.map((ele) => ele.usuarioid = this.usuarioSeleccionado.usuarioid);
        console.log('experimentando', this.dataSource.data)
        this.api.modificarDatos('configuraciones/permisos', this.dataSource.data).subscribe((response )=> {
          if(localStorage.getItem('usuarioId') || 0 == this.usuarioSeleccionado['usuarioid']){
            window.location.reload();
          }    window.location.reload();
        })
      }
    })
  }

  obtenerAsignaciones(){
    this.api.consultaDatos('configuraciones/asignaciones/' + this.usuarioSeleccionado.usuarioid).subscribe((permisos: Array<Permiso>) => {
      this.permisoData = permisos;
      this.dataSource = new MatTableDataSource<Permiso>(permisos);
    })
  }

  guardarUsuario(){
    if(!this.nombreUsuario.valid || !this.clave.valid || !this.acceso.valid){
      swal("Error en el alta de usuario", "Debe rellenar los campos solicitados", "error");
      return;
    }

    
    const bits = 256;
    const saltos = sjcl.random.randomWords(8,4);
    const key = sjcl.misc.pbkdf2(this.clave.value || '', saltos, bits);
    const iv = sjcl.random.randomWords(4,4);
    const cifrado: any = sjcl.encrypt(key, this.clave.value || '', {iv: iv, salt: saltos});

    swal({title: "Guardar Usuario", text: '¿Seguro que desea dar de alta al usaurio ' + this.nombreUsuario.value + '?', buttons: ['No', 'Si'], icon: 'warning'}).then((response) => {
      if(response){
        const datosEnviar = {
          nombre: this.nombreUsuario.value,
          acceso : this.acceso.value,
          clave: cifrado,
          key: key,
          email: this.email.value,
          direccion: this.direccion.value,
        }
        this.api.insertarDatos('configuraciones/usuario', datosEnviar).subscribe((response) => {
          this.obtenerUsuarios();
        })
      }
    })
  }

  obtenerEstatus(){
    this.api.consultaDatos('configuraciones/estatus').subscribe((estatus: Array<any>) => {
      this.estatusTabla = estatus;
    })
  }

  obtenerUsuarios(){
    this.api.consultaDatos('configuraciones/usuarios').subscribe((usuarios: Array<Usuario>) => {
      this.usuarios = usuarios;
      this.usuariosFiltrados = this.usuario.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrarUsuarios(value))
      )
    })
  }

  seleccionarUsuario(){
    this.usuarioSeleccionado = this.usuarios.find(ele => ele.nombre == this.usuario.value) || {
      nombre: "",
      usuarioid: 0,
      acceso: "",
      email: "",
      direccion: '',
      estatusid: 8
    };
    console.log(this.usuarioSeleccionado);
    this.email.setValue(this.usuarioSeleccionado.email);
    this.direccion.setValue(this.usuarioSeleccionado.direccion);
    this.acceso.setValue(this.usuarioSeleccionado.acceso);
    this.obtenerAsignaciones();
    this.obtenerBotones();
   
  }

  filtrarUsuarios(valor: string){
    return this.usuarios.filter((value) => value.nombre.toLowerCase().includes(valor.toLowerCase()));
  }

/*------------------------------------------------------Permiso Botones-------------------------------------------------------*/
obtenerBotones(){
  console.log(this.dataSource.data);
  this.api.consultaDatos('configuraciones/botonesPermiso/' + this.usuarioSeleccionado.usuarioid).subscribe((Botones: Array<Boton>) => {
    console.log(" Estos son todos los botones que hay con todo",Botones);
    Botones.map(ele => ele.seleccionado = ele.usuarioId != 0);
    Botones.map(ele => ele.preseleccionado = ele.usuarioId != 0);
    const agrupadoPorMenuId = Botones.reduce((acumulador, boton) => {
      /*Nos traemos el arreglo [{menuId=1,botonId=2},{menuId=2,botonId=3}],[] */
      const menuId = boton.menuId;
      /*Si el menuId no existe en el acumulador, eso indica que es la primera vez que encontramos un botón con ese menuId.
       Entonces, debemos crear una nueva entrada para agrupar los botones que compartan ese menuId.*/
      if (!acumulador[menuId]) {
        acumulador[menuId] = {   /*<= Nueva entrada*/
          nombreMenu: boton.nombre, 
          menuId: menuId,
          usuarioId:boton.usuarioId,
          asignado:boton.asignado,
          botones: []
        };
      // console.log(acumulador, 'este es el acomulador' );
        /**
          {
            1:{
              asignado: 0,
              nombreMenu: 'x',
              menuId: 1,

            }
          }
         */
      }
      //En el nuevo arreglo (agrupadoPorMenuId) no se van a usar los atributos "menuId, asignado, nombreMenu"
      /*Si el menuId ya está presente en el acumulador, significa que ya hemos creado un grupo para ese menú, 
      y simplemente añadimos el botón al array correspondiente.*/
      acumulador[menuId].botones.push(boton);
      return acumulador;
    }, {} as { [key: number]: MenuConBotones });
    this.botones = Object.values(agrupadoPorMenuId);
    console.log(this.botones,'botones')
    this.dataSourceBotones = new MatTableDataSource(this.botones);
    console.log("Todos los botones",Botones)
    console.log("Datos agrupados del dataSource btn:", this.dataSourceBotones.data);
    
  });
}


checarBotonSeleccionado(botonId:number): boolean{
  return this.botonesfiltrados.some(item=>item.botonId == botonId)
  // console.log('Grupo de botones por menu filtrado por UsuarioId, this.dataSourceBotones.data.find(ele=> ele.usuarioId ==this.usuarioSeleccionado.usuarioid))
}

/**
 * 
 * 1. ITERAR LOS MENUS
 * 2. FILTRAR BOTONES NO SELECCIONADOS
 * 2.1 ELIMINAR LOS BOTONES NO SELECCIONADOS JUNTO CON EL USUARIOID (SI EL USUARIOID Y EL BOTONID NO EXISTEN ENTONCES NO SE VA A ELIMINAR NADA)
 * 3. FILTRAR BOTONES SELECCIONADOS
 * 3.1 INSERTAR LOS BOTONES SELECCIONADOS
 */

guardarCambiosbtn(){
  swal({title:"Guardar Cambios", text:"Seguro que desea guardar los cambios?", buttons:['NO', 'SI'], icon: 'warning'})
  .then((response)=>{
   if(response){ 
    this.botones.forEach((row) => {
      row.botones.map((ele: any) => ele.usuarioId = this.usuarioSeleccionado['usuarioid'])
    })
    console.log(this.botones);
   this.api.modificarDatos('configuraciones/permisosbtn', this.botones).subscribe((response) => {
     this.obtenerAsignaciones();
     console.log("Recargando página...");
     window.location.reload();

   })
   }
  })
 }



 @HostListener('window:resize')
  onResize() {
    this.updateTabStretch();
  }

  updateTabStretch(): void {
    if (window.innerWidth <= 1400) {
      this.tabGroup.stretchTabs = false;  // Desactivar el estiramiento de los tabs
    } else {
      this.tabGroup.stretchTabs = true;   // Activar el estiramiento de los tabs
    }
  }
}

