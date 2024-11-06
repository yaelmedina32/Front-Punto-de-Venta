import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { ApiService } from '../../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ModEdicionVentasComponent } from '../mod-edicion-ventas/mod-edicion-ventas.component';
import { ModAbonosDeudasComponent } from '../../../cuentas-x-cobrar/mod-abonos-deudas/mod-abonos-deudas.component';
import { ModArmarVentaComponent } from '../../mod-armar-venta/mod-armar-venta.component';

export class HistorialVenta{
  folioventa: number;
  montoventa: number;
  productoid: number;
  producto: string;
  tipopago: string;
  fechaventa: string;
  preciounitario: number;
  cantidadvendida: number;
  estatus: string;
  clienteid: number;
  cliente: string;
  tipoVenta: string;
  cantidadpagos: number;
}

@Component({
  selector: 'app-mod-ventas',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-ventas.component.html',
  styleUrl: './mod-ventas.component.css'
})
export class ModVentasComponent implements OnInit{
  columnasDesplegadas = ['folioventa','fechaventa',  'montoventa', 'cliente',  'tipopago', 'tipoventa', 'estatus', 'editar']
  dataSource = new MatTableDataSource<HistorialVenta>();
  dataSourceAuxiliar: Array<HistorialVenta> = [];
  totalVentas = 0;
  dataSourceRegistradas: HistorialVenta[];
  filtrarRegistrados = false;

  constructor( private api: ApiService, private dialog: MatDialog){ }
  ngOnInit(): void {
    this.obtenerHistorial();
  }

  filtrarCXP(event: boolean){
    this.dataSource.data = event ? this.dataSource.data.filter(ele => ele.estatus == 'Registrado') : this.dataSourceAuxiliar;
    this.dataSource.filter = "";
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

  editarVenta(ventaid: number){
    const cantidadpagos = this.dataSource.data.find(ele => ele.folioventa == ventaid)?.cantidadpagos || 0;
    this.api.consultaDatos('operaciones/inventario/venta/' + ventaid).subscribe((inventario) => {
      inventario.map((element: any) => element.lectura = cantidadpagos > 0);
      inventario.map((element: any) => element.folioventa = ventaid);
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
    console.log("entra");
    this.api.consultaDatos('operaciones/historial/ventas').subscribe((historial: Array<HistorialVenta>) => {
      this.dataSource = new MatTableDataSource<HistorialVenta>(historial);
      this.dataSourceAuxiliar = historial;
      this.dataSourceRegistradas = [...this.dataSourceAuxiliar.filter(ele => ele.estatus == 'Registrado')];
      this.totalVentas = this.dataSource.data.length;
    })
  }


}
