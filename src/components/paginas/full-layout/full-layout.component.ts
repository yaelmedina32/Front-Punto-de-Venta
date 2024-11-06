import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompartidosModule } from '../../modulos/compartidos.module';
import { Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ModTurnoComponent } from './mod-turno/mod-turno.component';

export class Sucursal{
  sucursalId: number;
  ubicacion: string;
  estado: string;
  nombre: string;
  municipio: string;
}

@Component({
  selector: 'app-full-layout',
  standalone: true,
  imports: [RouterOutlet, CompartidosModule, RouterLink],
  templateUrl: './full-layout.component.html',
  styleUrl: './full-layout.component.css'
})
export class FullLayoutComponent implements OnInit, AfterViewInit{
  @ViewChildren('divDinamico') element: QueryList<ElementRef>;
  @ViewChild('contenido') contenido: ElementRef;
  @ViewChild('menuCompras') menuCompras: ElementRef;

  @ViewChild('divAdmin') divAdmin: ElementRef;
  @ViewChild('btnModulo') btnAdmin: ElementRef;
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
  clickAdmin = false;

  constructor(private renderer: Renderer2, private router: Router, private api: ApiService, private dialog: MatDialog){
    if (typeof window !== 'undefined') {
      this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
      this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
      this.nombreUsuario = sessionStorage.getItem("nombreusuario") || '';
  }
  }

  ngAfterViewInit(): void {
    if(this.divAdmin){
      console.log(this.divAdmin);
    }
    if(this.btnAdmin){
      console.log(this.btnAdmin);
    }
    if(this.element){
      this.comprobarTurno();
      setTimeout(() => {
        this.filtrarPermisos();
      }, 500);
    }
  }

  abrirMenu(menu: string){
    if(menu == 'admin'){
      this.renderer.setStyle(this.divAdmin.nativeElement, 'display', !this.clickAdmin ? 'flex' : 'none');
      !this.clickAdmin ? this.renderer.setStyle(this.divAdmin.nativeElement, 'justify-content', 'end') : null;
      this.renderer.setStyle(this.divAdmin.nativeElement, 'margin-bottom', !this.clickAdmin ? '20%' : '0');
      this.renderer.setStyle(this.btnAdmin.nativeElement, 'margin-bottom', this.clickAdmin ? '0' : '20%');
      this.clickAdmin = !this.clickAdmin;
    }

  }

  comprobarTurno(){
    this.api.consultaDatos(`administracion/turno/${this.usuarioId}/${this.sucursalId}`).subscribe((turno: Array<any>) => {
      this.turnoAbierto = turno.length > 0;
    })
  }

  abrirTurno(){
    swal({title: 'Abrir Turno', text: '¿Seguro que desea abrir turno? Tendrá que especificar la cantidad con la que abre el turno', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      const config = {
        id: "dialog1",
        data: {
          abierto: this.turnoAbierto,
          sucursalid: this.sucursalId
        },
        disableClose: true,
      }
      this.dialog.open(ModTurnoComponent, config);
    })
  }

  ngOnInit(){
    this.cargarSucursales();
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

