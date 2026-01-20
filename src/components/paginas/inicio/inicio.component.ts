import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef,ViewChild,HostListener, PLATFORM_ID, Inject } from '@angular/core';
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
import { ModCategoriasComponent } from '../operaciones/productos/listaproductos/mod-categorias/mod-categorias.component';
import { RouterLink, Router } from '@angular/router';
import { AltaletrasComponent } from '../operaciones/productos/altaletras/altaletras/altaletras.component';
import { ModServiciosComponent } from '../operaciones/productos/listaproductos/mod-servicios/mod-servicios.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-inicio',
    imports: [CompartidosModule, MatButtonModule, MatMenuModule],
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.css',
}) 
export class InicioComponent implements OnInit, AfterViewInit{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  usuarioId = 0;
  menus: string = ''; 
  permisosBotones: any[] = [];
  accesos: any[] = [];
  permisos: any[];
  screenWidth: number;
  constructor (private dialog: MatDialog,private api: ApiService, private renderer: Renderer2, private router: Router, @Inject(PLATFORM_ID) private platformId: Object){
    if (isPlatformBrowser(this.platformId)) {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
      localStorage.setItem('navegacion', 'Inicio');
      document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.altKey&&event.key === "x" ||event.altKey&&event.key === "X") {
        this.router.navigate([`administracion/compras`]);
  
      }
    });
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "F2") {
          this.router.navigate([`/operaciones/inventario/lista`]);
    
        }
      });
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "F4") {
          this.router.navigate([`/operaciones/productos/lista`]);
    
        }
      });
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.ctrlKey&&event.key === "q" || event.ctrlKey&&event.key === "Q") {
          this.router.navigate([`/operaciones/ventas`]);
    
        }
      });
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.altKey&&event.key === "a" ||event.altKey&&event.key === "A") {
          this.router.navigate([`/administracion/turnos`]);
    
        }
      });
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.altKey&&event.key === "C" || event.altKey&&event.key === "c" ) {
          this.router.navigate([`/configuraciones/usuarios`]);
    
        }
      });
    }
  }
   
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
    }
    this.comprobarPermisos();
    }
  ngAfterViewInit(): void {
    this.arregloElementos = this.elementosBotones.toArray();
  
  }
  
 

    abrirCategorias(){
      this.dialog.open(ModCategoriasComponent, 
        { 
          maxWidth: '30vW',
          width: '100%',
        }
      )
    }
      abirServicio(){
        this.dialog.open(ModServiciosComponent,
          {
            maxWidth: '70vW',
            width: '100%'
          }
        )
      }
    abrirProducto(productoid: number, accion: string){
      this.router.navigate([`/operaciones/productos/alta/${productoid}/${accion}`]);
    }
  abrirAltasLetras(){
    this.dialog.open( AltaletrasComponent, {
      width: '120%',
    })
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
    this.router.navigate(['/operaciones/historial']);
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
    if(this.usuarioId && this.usuarioId !== 0){
      const datosAEnviar = {
        usuarioid: this.usuarioId
      }
      this.api.consultaDatosPost('configuraciones/permisos', datosAEnviar).subscribe((permisos: Array<any>) => {
        this.permisos = permisos;
        this.menus = this.permisos.reduce((acum, actual) => acum += (actual.menuId + ','), "");
        sessionStorage.setItem('accesos', this.menus.substring(0, this.menus.length - 1));
        this.compararPermisosConBotones();
      })
    }
  }
  

  
  compararPermisosConBotones() {
    this.arregloElementos.forEach((elemento) => {
    const botonId = elemento.nativeElement.id; 
    const menuArray = this.menus.split(','); 
    const permisoEncontrado = menuArray.find(menu=> menu === botonId);
    if (permisoEncontrado !==undefined) {
      this.renderer.setProperty(elemento.nativeElement, 'disabled', false); 
    } else {
      this.renderer.setStyle(elemento.nativeElement, 'display', 'none'); 
    }
    
    });
  }

  abrirDevoluciones(){
    this.dialog.open(ModDevolucionesConsultaComponent, {
      maxWidth: '100vw',
      width: '80%',
    })
  }

  navegar(){
    console.log("se clickeo");
  }
}
