import { Component, inject, ElementRef, ViewChild, OnInit, AfterViewInit, ViewChildren, QueryList, Query, Inject, HostListener, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompartidosModule } from '../../modulos/compartidos.module';
import { Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ModTurnoComponent } from './mod-turno/mod-turno.component';
import { ModListadoComponent } from '../administracion/mod-listado/mod-listado.component';
import { ModDevolucionesConsultaComponent } from '../operaciones/ventas/modales/mod-devoluciones-consulta/mod-devoluciones-consulta.component';
import { ModDetallespagoComponent } from '../operaciones/ventas/modales/mod-detallespago/detallespago.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AltaletrasComponent } from '../operaciones/productos/altaletras/altaletras/altaletras.component';
import { ModCategoriasComponent } from '../operaciones/productos/listaproductos/mod-categorias/mod-categorias.component';
import { ModServiciosComponent } from '../operaciones/productos/listaproductos/mod-servicios/mod-servicios.component';
import { MatBottomSheet,MatBottomSheetModule,} from '@angular/material/bottom-sheet';
import { BottomSheetOverviewExampleSheetComponent } from './bottom-sheet-overview-example-sheet/bottom-sheet-overview-example-sheet.component';
import { MouseEventService } from '../../services/MouseEventService.service';
import { isPlatformBrowser } from '@angular/common';
import { NotificationComponent } from '../../modulos/notifications/notification.component';

export class Sucursal{
  sucursalId: number;
  ubicacion: string;
  estado: string;
  nombre: string;
  municipio: string;
}

@Component({
    selector: 'app-full-layout',
    templateUrl: './full-layout.component.html',
    standalone: true,
    imports: [CompartidosModule, RouterOutlet, RouterLink,MatMenuModule,MatButtonModule,MatButtonModule, MatBottomSheetModule, NotificationComponent],
    styleUrl: './full-layout.component.css'
})
export class FullLayoutComponent implements OnInit, AfterViewInit{
  private _bottomSheet = inject(MatBottomSheet);
  @ViewChildren('divDinamico') element: QueryList<ElementRef>;
  @ViewChildren('menuPermiso') menuPermiso: QueryList<any>;
  @ViewChild('contenido') contenido: ElementRef;
  @ViewChild('menuCompras') menuCompras: ElementRef;

  @ViewChild('centrar') centrar!: ElementRef;
  @ViewChild('navegacion') navegacion!: ElementRef;
  @ViewChild('centrarUl') centrarUl!: ElementRef;

  @ViewChildren('ocultaLetra') ocultaLetra: QueryList<any>;
  @ViewChildren('Grande') Grande: QueryList<any>;
  @ViewChild('divUl') divUl :ElementRef;
  @ViewChild('divAdmin') divAdmin: ElementRef;
  @ViewChild('divOperaciones') divOperaciones: ElementRef;
  @ViewChild('divCatalo') divCatalo: ElementRef;
  @ViewChild('divconf') divconf: ElementRef;
  @ViewChild('btnModulo') btnAdmin: any;
  permisosMenu: Array<any> = []; 
  title = 'DCTires';
  sideBar = true;
  usuarioId = 0
  nombreUsuario = ''
  sucursales: Array<Sucursal> = [];
  sucursalId = 0;
  sucursalSeleccionada: Sucursal;
  estado: String = "";
  almacenId = 0;
  almacenes: Array<any> = [];
  permisos: Array<any> = [];
  turnoAbierto = false;
  clickAdmin = true;
  activeMenu: string = '';
  screenWidth: number;
  constructor(private renderer: Renderer2, @Inject(Router) public router: Router, private api: ApiService, private dialog: MatDialog, private mouseEventService: MouseEventService, @Inject(PLATFORM_ID) private platformId: Object){
    if (isPlatformBrowser(this.platformId)) {
      this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
      this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
      this.nombreUsuario = sessionStorage.getItem("nombreusuario") || '';
    }
  }

  ngAfterViewInit(): void {
    if(this.usuarioId && this.usuarioId !== 0){
      if(this.divAdmin){
      }
      if(this.btnAdmin){
      }
      if(this.element){
        this.comprobarTurno();
        setTimeout(() => {
          this.filtrarPermisos();
        }, 500);
      }
      if(this.menuPermiso){
        
      const datosAEnviar = {
        usuarioid: this.usuarioId
      }
      this.api.consultaDatosPost('configuraciones/permisos', datosAEnviar).subscribe((permisos: Array<any>) => {
        const stringPermiso = permisos.reduce((acum, actual) => acum += (actual.menuId + ','), "");
        this.permisosMenu = stringPermiso.substring(0, stringPermiso.length - 1).split(',') || [];
        this.menuPermiso.toArray().forEach((element: any) => {
          if(!this.permisosMenu.some(ele => ele == element._elementRef.nativeElement.id)){
            this.renderer.setStyle(element._elementRef.nativeElement, 'display', 'none');
          }
        })
      })
      }
      this.ocultarnav(this.screenWidth)
    }
  }
  
  

  onMouseEnter(event:MouseEvent):void{
  //   setTimeout(() => {
  //     this.renderer.addClass(this.contenido.nativeElement,'contentMediomax')
  //     this.renderer.addClass(this.divUl.nativeElement,'navegacion')
  //     this.renderer.addClass(this.centrarUl.nativeElement,'mb-auto')
  //     this.ocultaLetra.toArray().forEach((element:any)=>{
  //       this.renderer.addClass(element.nativeElement,'spanItemAgregar')
  //     })
  //     this.Grande.toArray().forEach((element:any)=>{
  //       this.renderer.addClass(element.nativeElement,'iconomin')
  //     })
  //     this.Grande.toArray().forEach((element:any)=>{
  //       this.renderer.removeClass(element.nativeElement,'icono')
  //     })
  //     this.ocultaLetra.toArray().forEach((element:any)=>{
  //       this.renderer.removeClass(element.nativeElement,'spanItem')
  //     })
  //     this.renderer.removeClass(this.centrarUl.nativeElement,'mb-autoGr')
  //     this.renderer.removeClass(this.contenido.nativeElement,'contentMedio')
  //     this.renderer.removeClass(this.divUl.nativeElement,'navegacionmin')
  //     this.mouseEventService.emitirMouseEnter(true);
  // }, 150);
 
  }
  onMouseLeave(event:MouseEvent):void{
    setTimeout(() => {
      this.renderer.addClass(this.centrarUl.nativeElement,'mb-autoGr')
    this.renderer.addClass(this.divUl.nativeElement,'navegacionmin');
    this.renderer.addClass(this.contenido.nativeElement,'contentMedio')
    this.ocultaLetra.toArray().forEach((element:any)=>{
      this.renderer.addClass(element.nativeElement,'spanItem')
    });
    this.Grande.toArray().forEach((element:any)=>{
      this.renderer.addClass(element.nativeElement,'icono')
    });
    this.renderer.removeClass(this.divUl.nativeElement,'navegacion');
    this.ocultaLetra.toArray().forEach((element:any)=>{
      this.renderer.removeClass(element.nativeElement,'spanItemAgregar')
    });
    this.Grande.toArray().forEach((element:any)=>{
      this.renderer.removeClass(element.nativeElement,'iconomin')
    });
    this.renderer.removeClass(this.centrarUl.nativeElement,'mb-auto')
    this.renderer.removeClass(this.contenido.nativeElement,'contentMediomax');
    // this.renderer.setStyle(this.divAdmin.nativeElement, 'display', 'none');
    // this.renderer.setStyle(this.divCatalo.nativeElement, 'display', 'none');
    // this.renderer.setStyle(this.divconf.nativeElement, 'display', 'none');
    // this.renderer.setStyle(this.divOperaciones.nativeElement, 'display', 'none');
    this.mouseEventService.emitirMouseEnter(false);
  },150);
  }
  abrirAltaClientes(){
    this.dialog.open(ModListadoComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      }
    )
  }
  ocultarnav(width:number){
    if(width<= 1380 ) {
      this.renderer.addClass(this.navegacion.nativeElement, 'hide-important');
      this.renderer.removeClass(this.centrar.nativeElement,'d-flex');
      this.renderer.addClass(this.contenido.nativeElement,'contentmedio-important')
    } else {
      this.renderer.removeClass(this.navegacion.nativeElement, 'hide-important');
      this.renderer.addClass(this.centrar.nativeElement,'d-flex');
      this.renderer.removeClass(this.contenido.nativeElement, 'contentmedio-important');
    }

  }

  abrirMenu(menu: string){
    this.activeMenu = this.activeMenu === menu ? '' : menu;
  }

  abrirConsultaVentas(){
    this.router.navigate(['/operaciones/historial']);
  }

  abrirDevoluciones(){
    this.dialog.open(ModDevolucionesConsultaComponent,
      {
        maxWidth: '100vW',
        width: '90%',
        data: "devolucion"
      })
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
              maxWidth: '60vW',
              width: '80%'
            }
          )
        }

    abrirAltasLetras(){
      this.dialog.open( AltaletrasComponent, {
        width: '120%',
      })
    }
  abrirPagos(){
    this.dialog.open(ModDetallespagoComponent,
      {
        maxWidth: '100vW',
        width: '90%',
        data: "pago"
      })

  }


  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetOverviewExampleSheetComponent);
  }



 togglesubmenu(){
  localStorage.setItem('isVisible', 'true');  // Almacena el valor en localStorage
  }
  comprobarTurno(){
    this.api.consultaDatos(`administracion/turno/${this.usuarioId}/${this.sucursalId}`).subscribe((turno: Array<any>) => {
      this.turnoAbierto = turno.length > 0;

    })
  }


  abrirTurno(){
    swal({title: 'Abrir Turno', text: '¿Seguro que desea abrir turno? Tendrá que especificar la cantidad con la que abre el turno', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
     if(response){
      const config = {
        id: "dialog1",
        data: {
          abierto: this.turnoAbierto,
          sucursalid: this.sucursalId
        },
        disableClose: true,
      }
      const dialog = this.dialog.open(ModTurnoComponent, config);
      dialog.afterClosed().subscribe((response) => {
        window.location.reload();
      })
    }})
  }

  ngOnInit(){
    this.cargarSucursales();
    if(isPlatformBrowser(this.platformId)){
      this.screenWidth = window.innerWidth;
    }
  }
  // Este decorador escucha el evento de cambio de tamaño de la ventana (resize).
  // Cada vez que la pantalla cambia de tamaño, se ejecuta el método onResize.
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    let width = (event.target as Window).innerWidth;
    if( width<= 1380 ) {
      this.renderer.addClass(this.navegacion.nativeElement, 'hide-important');
      this.renderer.addClass(this.contenido.nativeElement,'contentmedio-important')
      this.renderer.removeClass(this.centrar.nativeElement,'d-flex');
    } else {
      this.renderer.removeClass(this.navegacion.nativeElement, 'hide-important');
      this.renderer.addClass(this.centrar.nativeElement,'d-flex');
      this.renderer.removeClass(this.contenido.nativeElement, 'contentmedio-important');
    }
  }

  logout(){
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('usuarioid');
      sessionStorage.removeItem('nombre');
      localStorage.removeItem('sucursalId');
      localStorage.removeItem('almacenId');
      localStorage.removeItem('navegacion');
      sessionStorage.removeItem('accesos');
      localStorage.removeItem('actual');
      this.router.navigate(['/login/iniciosesion']);
    }
  }

  cargarSucursales(){
    this.api.consultaDatos('catalogos/sucursales/' + this.usuarioId).subscribe((sucursal: Array<Sucursal>) => {
      this.sucursales = sucursal;
      const indice = this.sucursales.findIndex(ele => ele.sucursalId == this.sucursalId);
      if(indice != -1){
        this.sucursalSeleccionada = this.sucursales[indice];
        this.estado = this.sucursalSeleccionada.estado;
        this.api.consultaDatos('catalogos/almacenes/' + this.sucursalId).subscribe((almacen: Array<any>) => {
          this.almacenes = almacen;
        })
      }
    })
  }

  setSucursal(){
    if (typeof window !== 'undefined') {  
      localStorage.setItem('sucursalId', this.sucursalId.toString());
      localStorage.removeItem('almacenId');
      this.sucursalSeleccionada = this.sucursales.filter(ele => ele.sucursalId == this.sucursalId)[0];
      this.estado = this.sucursalSeleccionada.estado;
    }
    
    window.location.reload();
  }

  setAlmacen(){
    if (typeof window !== 'undefined') {
      localStorage.setItem('almacenId', this.almacenId.toString());
    }
    window.location.reload();
  }
  abrirClientes(){
    this.dialog.open(ModListadoComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      }
    )
  }
  filtrarPermisos(){
    this.element.forEach((element: ElementRef, indice) => {
      /**
       * El punto es que dentro del html, se renderice algo así: (como ejemplo)
       *  <br>
          <li class="nav-item">
            <a href="operaciones/proveedores/lista" class="nav-link link-warning text-white" matTooltip = "Proveedores">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
                <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
              </svg>&nbsp;
              <span>Proveedores</span>
            </a>
          </li>
          <br>
       */
      const li = this.renderer.createElement('li');
      this.renderer.addClass(li, 'nav-item');

      const a = this.renderer.createElement('a');
      this.renderer.setProperty(a, 'href', this.permisos[indice].URL);
      this.renderer.setAttribute(a, 'matToolTip', this.permisos[indice].nombre);
      this.renderer.addClass(a, 'nav-link');
      this.renderer.addClass(a, 'link-warning');
      this.renderer.addClass(a, 'text-white');

      const div = this.renderer.createElement('div');
      this.renderer.addClass(div, 'd-flex');
      const p = this.renderer.createElement('p');
      this.renderer.setProperty(p, 'innerHTML', this.permisos[indice].icono + '&nbsp;&nbsp;');

      const span = this.renderer.createElement('span');
      const texto =  this.permisos[indice].nombre
      this.renderer.setProperty(span, 'textContent', texto);

      this.renderer.appendChild(div, p);
      this.renderer.appendChild(div, span);
      
      this.renderer.appendChild(a, div);

      this.renderer.appendChild(li, a);
      this.renderer.appendChild(element.nativeElement, li);
    });
  }

}

