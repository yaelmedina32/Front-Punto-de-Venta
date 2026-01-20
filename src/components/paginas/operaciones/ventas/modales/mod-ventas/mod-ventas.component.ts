import { Component, inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ApiService } from '../../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { TableVirtualScrollDataSource, TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { MatDialog } from '@angular/material/dialog';
import { ModAbonosDeudasComponent } from '../../../cuentas-x-cobrar/mod-abonos-deudas/mod-abonos-deudas.component';
import { ModArmarVentaComponent } from '../../mod-armar-venta/mod-armar-venta.component';
import { ModAutorizacionComponent } from '../mod-autorizacion/mod-autorizacion.component';
import { ModDevolucionComponent } from '../mod-devolucion/mod-devolucion.component';
import jsPDF from 'jspdf';
import moment from 'moment';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../services/notification.service';
import { TicketService } from '../../../../../services/ticket.service';

export class HistorialVenta{
  folioventa: number;
  montoventa: number;
  montoTotal: number;
  iva: number;
  productoid: number;
  producto: string;
  fechaventa: string;
  Vendedor:string;
  preciounitario: number;
  cantidadvendida: number;
  estatus: string;
  clienteid: number;
  cliente: string;
  tipoVenta: string;
  cantidadpagos: number;
  detalle: string;
}

@Component({
    selector: 'app-mod-ventas',
    imports: [CompartidosModule, ScrollingModule, TableVirtualScrollModule],
    templateUrl: './mod-ventas.component.html',
    styleUrl: './mod-ventas.component.css'
})
export class ModVentasComponent implements OnInit{
  columnasDesplegadas = ['folioventa','fechaventa', 'montoventa', 'detalle',  'cliente', 'numero', 'Vendedor', 'editar']
  dataSource = new TableVirtualScrollDataSource<HistorialVenta>();
  dataSourceAuxiliar: Array<HistorialVenta> = [];
  totalVentas = 0;
  dataSourceRegistradas: HistorialVenta[];
  filtrarRegistrados = false;

  private router = inject(Router);
  private ticketService = inject(TicketService);

  constructor( private api: ApiService, private dialog: MatDialog, private notificationService: NotificationService,
  ){ }
  ngOnInit(): void {
    this.obtenerHistorial();
    this.notificationService.warning('Historial de ventas obtenido exitosamente');
  }

  filtrarCXP(event: boolean){
    this.dataSource.data = event ? this.dataSource.data.filter(ele => ele.estatus == 'Registrado') : this.dataSourceAuxiliar;
    this.dataSource.filter = "";
  }
  
  getDetalle(index: number){
    return 'Detalles:\n' + this.dataSource.data[index].detalle;
  }

  cancelarVenta(folioventa: number){
    const response = this.dialog.open(ModAutorizacionComponent, 
      {
        data: "cancelar",
        maxWidth: '70vW',
      }
    )
    response.afterClosed().subscribe((aprobado) => {
      if(aprobado){
        const dialog = this.dialog.open(ModDevolucionComponent,
          {
            maxWidth: '100vW',
            width: '80%',
            data: folioventa
          }
        )
        dialog.afterClosed().subscribe((response) => {
          swal({title: `Folio Venta ${folioventa} cancelado`, text: "Se canceló la venta exitosamente", icon: "success", timer: 5000} );
          this.obtenerHistorial();
        })
        // this.api.modificarDatos('operaciones/devolucion', datos).subscribe((response) => {

        // })
      }else{
        swal({title: `Usuario y/o contraseña incorrecta`, text: "No se canceló la venta", icon: "error", timer: 5000}
        );
      }
    })
  }

  abonarPago(ventaid: number){
    let dialog = this.dialog.open(ModAbonosDeudasComponent,
      {
        maxWidth: "80vW",
        width: '60%',
        data:{
          ventaid: ventaid
        }
      }
    )
    dialog.afterClosed().subscribe((response) => {
      this.obtenerHistorial();
    })
  }

  async imprimirTicket(ventaid: number){
    console.log(this.ticketService)
    await this.ticketService.imprimirTicket(ventaid);
  }

  verVenta(ventaId: number){
     const cantidadpagos = this.dataSource.data.find(ele => ele.folioventa == ventaId)?.cantidadpagos || 0;
      console.log("entra1")
      this.api.consultaDatos('operaciones/inventarios/ventas/' + ventaId).subscribe((inventario) => {
        inventario.map((element: any) => element.lectura = true);
        inventario.map((element: any) => element.folioventa = ventaId);
        const dialog = this.dialog.open(ModArmarVentaComponent,
          {
            maxWidth: '80vW',
            width: '90%',
            data: inventario
          }
        )
        dialog.afterClosed().subscribe((response) => {
          this.obtenerHistorial();
        })
      })


  }

  editarVenta(ventaid: number){
    const cantidadpagos = this.dataSource.data.find(ele => ele.folioventa == ventaid)?.cantidadpagos || 0;
    this.api.consultaDatos('operaciones/inventarios/ventas/' + ventaid).subscribe((inventario) => {
      inventario.map((element: any) => element.lectura = cantidadpagos > 0);
      inventario.map((element: any) => element.folioventa = ventaid);
      this.router.navigate(['/operaciones/ventas'], { queryParams: { folio: ventaid }, state: { inventario: inventario } });
    })
  }

  bufferCambios: Array<any> = []
  filtrarDatos(texto: string, objeto: string){
      //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
      const indiceCambios = this.bufferCambios.findIndex(ele => ele['objeto'] == objeto);
      if(indiceCambios == -1){
          this.bufferCambios.push({ valor:  texto , objeto: objeto });
      }else{
          //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
          this.bufferCambios[indiceCambios]['valor'] = texto;
      }
      //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
      this.dataSource.data = !this.filtrarRegistrados ? this.dataSourceAuxiliar.filter( (item: any) => {
          let contador = 0;
          //USO UN CONTADOR PARA IR CONTANDO LAS VECES QUE EL FILTRO ES CORRECTO, SE SUMA UNO POR CADA FILTRO CORRECTO DENTRO DEL VECTOR DE BUFFS
          //EL REGISTRO ES CORRECTO SI EL OBJETO DE ESE REGISTRO ACTUAL ES IGUAL AL TEXTO 
          this.bufferCambios.forEach( element=> {
              if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
                  contador++;
              }
          })
          //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL BUFFER, ENTONCES LO DEVUELÑVE
          if (contador == this.bufferCambios.length) return item;
      }) :
      this.dataSourceRegistradas.filter( (item: any) => {
          let contador = 0;
          //USO UN CONTADOR PARA IR CONTANDO LAS VECES QUE EL FILTRO ES CORRECTO, SE SUMA UNO POR CADA FILTRO CORRECTO DENTRO DEL VECTOR DE BUFFS
          //EL REGISTRO ES CORRECTO SI EL OBJETO DE ESE REGISTRO ACTUAL ES IGUAL AL TEXTO 
          this.bufferCambios.forEach( element=> {
              if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
                  contador++;
              }
          })
          //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL BUFFER, ENTONCES LO DEVUELÑVE
          if (contador == this.bufferCambios.length) return item;
      })
      //Y CUANDO EL FILTRO ESTÉ VACÍO, ENTONCES LO ELIMINO DEL BUFFER
      if(texto == ''){
          this.bufferCambios.splice(indiceCambios, 1);
      }
      this.totalVentas = this.dataSource.data.length;

      //MANEJO EL BUFFER PORQUE EN CASO DE QUE APLIQUEN FILTROS EN DESORDEN, EL SISTEMA NO VA A SABER CUÁL FUE EL ANTERIOR
      //YA TENIENDO EL BUFFER, COMO RECORRE LOS FILTROS APLICADOS, ENTONCES NO IMPORTA EN QUÉ ORDEN LO MANEJES
  }

  obtenerHistorial(){
    this.api.consultaDatos('operaciones/historial/ventas').subscribe((historial: Array<HistorialVenta>) => {
      historial.forEach((ele: any) => {
        ele.detalle = ele.detalle.split('*').join('\n* ');
      });
      console.log(historial);
      this.dataSource = new TableVirtualScrollDataSource<HistorialVenta>(historial);
      this.dataSourceAuxiliar = historial;
      this.dataSourceRegistradas = [...this.dataSourceAuxiliar.filter(ele => ele.estatus == 'Registrado')];
      this.totalVentas = this.dataSource.data.length;
      
    })
  }


}
