import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';

export class DatosDetalles{
  ventaId: number;
  estatusVenta: string;
  pagoId: number;
  estatusPagoVenta: string;
  montoVenta: number;
  montoPago: number;
  fechaPago: string;
  nombre: string;
  estatusVentaId: number;
  estatusPagoId: number;
}
export class DatosDetallesOC{
    pagoId: number;
    monto: number;
    fechapago: string;
    estatusPagoOc: string;
    ordenCompraId: number;
    importeTotal: number;
    pendiente: number;
    solicitante: string;
    estatusOrdenCompra: string;
    estatusOcId: number;
  estatusPagoOcId: number;
  }


@Component({
  selector: 'app-detallespago',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './detallespago.component.html',
  styleUrl: './detallespago.component.css'
})

export class ModDetallespagoComponent implements OnInit {
columnasDesplegadas = ['ventaId', 'estatusVenta', 'pagoId','estatusPagoVenta','montoVenta','montoPago','fechaPago', 'nombre','eliminar'];
columnasDesplegadasOC = ['pagoId', 'monto', 'fechapago','estatusPagoOc','ordenCompraId','importeTotal', 'pendiente', 'solicitante', 'estatusOrdenCompra','eliminar'];
dataSource = new MatTableDataSource <DatosDetalles> ();
dataSourceOC = new MatTableDataSource <DatosDetallesOC> ();
dataSourceAuxiliar: Array <DatosDetalles> = [];
dataSourceAuxiliars: Array <DatosDetallesOC> = [];
totalVentas = 0;

filtrarRegistrados = false;

constructor(private api: ApiService, private dialog: MatDialog){}
ngOnInit(): void {
   this.ObtenerDatosVenta(); 
   console.log(this.ObtenerDatosVenta)
   this.ObtenerDatosOedenCompra();
  
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
    console.log(this.bufferCambios);
    //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
    this.dataSource.data = this.dataSourceAuxiliar.filter( (item: any) => {
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
    });
    //Y CUANDO EL FILTRO ESTÉ VACÍO, ENTONCES LO ELIMINO DEL BUFFER
    if(texto == ''){
        this.bufferCambios.splice(indiceCambios, 1);
    }

    //MANEJO EL BUFFER PORQUE EN CASO DE QUE APLIQUEN FILTROS EN DESORDEN, EL SISTEMA NO VA A SABER CUÁL FUE EL ANTERIOR
    //YA TENIENDO EL BUFFER, COMO RECORRE LOS FILTROS APLICADOS, ENTONCES NO IMPORTA EN QUÉ ORDEN LO MANEJES
}
bufferCambiosOc: Array<any> = []
filtrarDatosOc(texto: string, objeto: string){
  
  //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
  const indiceCambios = this.bufferCambiosOc.findIndex(ele => ele['objeto'] == objeto);
  if(indiceCambios == -1){
      this.bufferCambiosOc.push({ valor:  texto , objeto: objeto });
  }else{
      //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
      this.bufferCambiosOc[indiceCambios]['valor'] = texto;
  }
  console.log(this.bufferCambiosOc);
  //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
  this.dataSourceOC.data = this.dataSourceAuxiliars.filter( (item: any) => {
      let contador = 0;
      //USO UN CONTADOR PARA IR CONTANDO LAS VECES QUE EL FILTRO ES CORRECTO, SE SUMA UNO POR CADA FILTRO CORRECTO DENTRO DEL VECTOR DE BUFFS
      //EL REGISTRO ES CORRECTO SI EL OBJETO DE ESE REGISTRO ACTUAL ES IGUAL AL TEXTO 
      this.bufferCambiosOc.forEach( element=> {
          if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
              contador++;
          }
      })
      //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL BUFFER, ENTONCES LO DEVUELÑVE
      if (contador == this.bufferCambiosOc.length) return item;
  });
  //Y CUANDO EL FILTRO ESTÉ VACÍO, ENTONCES LO ELIMINO DEL BUFFER
  if(texto == ''){
      this.bufferCambiosOc.splice(indiceCambios, 1);
  }

}

ObtenerDatosVenta(){
this.api.consultaDatos('operaciones/detallePago').subscribe((detalles: Array<DatosDetalles>) =>{
    console.log(detalles);
  this.dataSource = new MatTableDataSource<DatosDetalles>(detalles);
  this.dataSourceAuxiliar = detalles;
  this.totalVentas = this.dataSource.data.length;
  console.log(this.dataSource)
})
};

ObtenerDatosOedenCompra(){
    this.api.consultaDatos('operaciones/detallespagoOc').subscribe((detallesoc: Array<DatosDetallesOC>) =>{
      this.dataSourceOC = new MatTableDataSource<DatosDetallesOC>(detallesoc);
      this.dataSourceAuxiliars = detallesoc;
      this.totalVentas = this.dataSourceOC.data.length;
      console.log(this.dataSourceOC)
    })
    };

    cambiarEstatusV(pagoId: number){
      console.log(pagoId)
     const indice = this.dataSource.data.findIndex(ele => ele.pagoId == pagoId) ;
     swal({title: 'Cancelar Pago', text: '¿Seguro que desea cancelar el pago?', buttons:['NO', 'SI'], icon: "warning"}).then((valor:any)=>{
        if(valor){
          console.log('datos enviados')
            this.dataSource.data[indice].estatusVentaId = 14 ;
            this.dataSource.data[indice].estatusPagoId = 3;
            
         this.api.modificarDatos('operaciones/cambiarEstatusV', this.dataSource.data[indice]).subscribe((response: any) => {
          if(response.mensaje){
            console.log('Respuesta de la API:', response);
            swal("Pagos de Venta modificados.", "Datos modificados correctamente", "success");
            this.ObtenerDatosVenta();
          }
          
        });
        }
     })
    }

    
    cambiarEstatusOC(pagoId: number){
      console.log(pagoId)
      const indice = this.dataSourceOC.data.findIndex(ele => ele.pagoId == pagoId) ;
      swal({title: 'Cancelar Pago', text: '¿Seguro que desea cancelar el pago?', buttons:['NO', 'SI'], icon: "warning"}).then((valor:any)=>{
         if(valor){
           console.log('datos enviados') 
             this.dataSourceOC.data[indice].estatusOcId = 1 ;
             this.dataSourceOC.data[indice].estatusPagoOcId = 3;
             
          this.api.modificarDatos('operaciones/cambiarEstatusOc', this.dataSourceOC.data[indice]).subscribe((response: any) => {
           if(response.mensaje){
             console.log('Respuesta de la API:', response);
             swal("Pagos de Venta modificados.", "Datos modificados correctamente", "success");
             this.ObtenerDatosOedenCompra();
           }
           
         });
         }
      })
    }

}

