import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef } from '@angular/core';
import { CompartidosModule } from '../../modulos/compartidos.module';
import { MatDialog } from '@angular/material/dialog';
import { ModClientesComponent } from '../administracion/clientes/clientes.component';
import { ModListadoComponent } from '../administracion/mod-listado/mod-listado.component';
import { ModVentasComponent } from '../operaciones/ventas/modales/mod-ventas/mod-ventas.component';
import { ModDevolucionesConsultaComponent } from '../operaciones/ventas/modales/mod-devoluciones-consulta/mod-devoluciones-consulta.component';
import { ModDetallespagoComponent } from '../operaciones/ventas/modales/mod-detallespago/detallespago.component';
import { Renderer2 } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { QueryList } from '@angular/core';
import { SessionService } from '../../services/session.service';
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit, AfterViewInit{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  usuarioId = 0;
  menus: string = ''; 
  permisosBotones: any[] = [];
  accesos: any[] = [];
  permisos: any[];
  constructor (private dialog: MatDialog,private api: ApiService, private renderer: Renderer2, private session: SessionService){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
      localStorage.setItem('navegacion', 'Inicio');
      console.log('el usuario que ingreso es el', this.usuarioId)
    }
  }
  ngOnInit(): void {
    
   
    this.comprobarPermisos();
    console.log(this.menus, 'menus en ngOnInit');
    
      console.log('Menús disponibles:', this.accesos);
     
    }
  ngAfterViewInit(): void {
    this.arregloElementos = this.elementosBotones.toArray();


  }
  
  

  abrirClientes(){
    this.dialog.open(ModListadoComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      }
    )
  }

  abrirVentas(){
    this.dialog.open(ModVentasComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      }
    )
  }
  abrirDetallesPago(){
    this.dialog.open(ModDetallespagoComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      }
    )
  }
  

  


  comprobarPermisos(){
    const datosAEnviar = {
      usuarioid: this.usuarioId
    }
    this.api.consultaDatosPost('configuraciones/permisos', datosAEnviar).subscribe((permisos: Array<any>) => {
      this.permisos = permisos;
      this.menus = this.permisos.reduce((acum, actual) => acum += (actual.menuId + ','), "");
      console.log(this.menus,'menus')
      sessionStorage.setItem('accesos', this.menus.substring(0, this.menus.length - 1));
      this.compararPermisosConBotones();
    })
  }
  

  
  compararPermisosConBotones() {
    console.log(this.menus,'menuarray')
    console.log(this.arregloElementos)
    // this.accesos = this.session.obtenermenu();
    // console.log(this.accesos, 'acesso');
    this.arregloElementos.forEach((elemento) => {
      
    const botonId = elemento.nativeElement.id; 
   
    const menuArray = this.menus.split(','); 
    
      const permisoEncontrado = menuArray.find(menu=> menu === botonId);
console.log(permisoEncontrado,'permiso encontrado ')
            if (permisoEncontrado !==undefined) {
        this.renderer.setProperty(elemento.nativeElement, 'disabled', false); 
      } else {
        this.renderer.setStyle(elemento.nativeElement, 'display', 'none'); 
      }
    
    });
  }

  abrirDevoluciones(){
    this.dialog.open(ModDevolucionesConsultaComponent, {
      maxWidth: '100vW',
      width: '70%',
    })
  }

  navegar(){
    console.log("se clickeo");
  }
}
