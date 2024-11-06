import { Component, OnInit, ViewChild } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { OrdenesCompra } from '../compras.interface';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../../../services/api.service';
import { ModNofacturaComponent } from '../mod-nofactura/mod-nofactura.component';
import { MatDialog } from '@angular/material/dialog';
import { ModPagosComponent } from '../mod-pagos/mod-pagos.component';
import { ViewChildren } from '@angular/core';
import { ElementRef } from '@angular/core';
import { QueryList } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { AfterViewInit } from '@angular/core';
@Component({
  selector: 'app-mod-ordenes-compra',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-ordenes-compra.component.html',
  styleUrl: './mod-ordenes-compra.component.css'
})
export class ModOrdenesCompraComponent implements OnInit, AfterViewInit{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  menu: any[] = [];
  columnasDesplegadas = ['ordencompraid', 'solicitante', 'proveedor', 'fecha', 'importetotal', 'pendiente', 'nofactura', 'estatus', 'acciones']
  dataSource = new MatTableDataSource<OrdenesCompra>();
  @ViewChild(MatPaginator)  set paginator(value: MatPaginator) { this.dataSource.paginator = value; }
  almacenId = 0;
  usuarioId = 0;
  
  constructor(private api: ApiService, private router: Router, private dialog: MatDialog, private renderer: Renderer2){
    if (typeof window !== 'undefined') {
    this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
  }}
  ngAfterViewInit(): void {
    this.obtenerCatalogos();
    if(this.arregloElementos){
        this.obtenerPermisoBotones();
    }
  }

  ngOnInit(): void {
  }

  obtenerCatalogos(){
    this.api.consultaDatos('administracion/ordenescompra/' + this.almacenId  + '/compras').subscribe((ordenescompra: Array<OrdenesCompra>) => {
      console.log(ordenescompra);
      this.dataSource = new MatTableDataSource<OrdenesCompra>(ordenescompra);
    });
  }
  
   accionesOC(aceptado: number, ordencompraid: number){
    swal({
      title: `${aceptado == 1 ? 'Aceptación ' : aceptado == 2 ? 'Rechazo ' : 'Cancelación' }de OC con folio ${ordencompraid}`,
      text: `¿Seguro que desea ${aceptado == 1 ? 'aceptar' : aceptado == 2 ? 'rechazar' : 'cancelar'} la OC?`,
      buttons: ['No', 'Si'],
      icon: 'warning'
    }).then((response: any) => {
      if(response){
        const datosAEnviar = {
          aceptado: aceptado,
          ordencompraid: ordencompraid
        }
        this.api.modificarDatos('administracion/estatus/ordencompra', datosAEnviar).subscribe((response: any) => {
          if(response.mensaje){
            swal("Orden de compra modificada.", "Se modificó el estatus de la orden de compra correctamente", "success");
            this.obtenerCatalogos();
          }
        })
      }
    })
  }
  obtenerPermisoBotones() {
    this.api.consultaDatos('configuraciones/permisoBoton/' + this.usuarioId).subscribe({
      next: (permisos: any[]) => {
        console.log('permisos',permisos)
      const menu = permisos.map(permisos=> permisos.menuId);
      this.menu = menu;
      console.log(this.menu)
        console.log('Datos extraidos', permisos);
        this.permisosBotones = permisos;
        console.log('permiso Encontrado',this.compararPermisosConBotones());
        this.compararPermisosConBotones();
      },
      error: (error) => {
        console.error('Error al obtener permisos de botones:', error);
      }
    });
  }
  compararPermisosConBotones() {
    
    this.arregloElementos = this.elementosBotones.toArray();
    //console.log("ARREGLO ELEMENTOS", this.elementosBotones.toArray());
    this.arregloElementos.forEach((elemento) => {
      //console.log(elemento.nativeElement.id, elemento.nativeElement)
      const botonId = elemento.nativeElement.id; 
      console.log(this.permisosBotones);
      const permisoEncontrado = this.permisosBotones.find(permiso => permiso.nombre === botonId);
      if (permisoEncontrado) {
        this.renderer.setProperty(elemento.nativeElement, 'disabled', false); 
      } else {
        this.renderer.setStyle(elemento.nativeElement, 'display', 'none'); 
      }
    });
  }
  registrarAbono(ordencompraid: number){
    if(!this.dataSource.data.find(ele => ele.ordencompraid == ordencompraid)?.nofactura){
      swal("OC sin No. de Factura", "Para poder abonar a la orden de compra, debe adjuntar el número de factura", "warning");
      const dialog = this.dialog.open(ModNofacturaComponent,
        {
          maxWidth: '70vW',
          width: '100%',
          data: {
            ordencompraid: ordencompraid,
          },
        }
      )
      dialog.afterClosed().subscribe((response) => {
        if(!response){
          return;
        }else{
          this.obtenerCatalogos();
        }
      })
      return;
    }
    this.dialog.open(ModPagosComponent,
      {
        maxWidth: '100vW',
        width: '70%',
        data: {
          ordencompraid: ordencompraid,
        }
      }
    )
  }
  
  abrirOC(oc: number){
    this.router.navigate(['administracion/compras/vista/' + oc]);
  }
}
