import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../../../services/api.service';

export class Devolucion{
  ventaid: number;
  nombre: string;
  fechadevolucion: string;
  motivo: string;
  precioventa: number;
  descripcionMotivo : string;
}

@Component({
    selector: 'app-mod-devoluciones-consulta',
    imports: [CompartidosModule],
    templateUrl: './mod-devoluciones-consulta.component.html',
    styleUrl: './mod-devoluciones-consulta.component.css'
})
export class ModDevolucionesConsultaComponent implements OnInit{

  dataSource = new MatTableDataSource<Devolucion>();
  dataSourceAuxiliar: Array<Devolucion> = [];
  columnasDesplegadas = ['folioventa', 'nombre', 'fecha', 'descripcionMotivo', 'motivo', 'precioventa'];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.obtenerDevoluciones();
  }

  obtenerDevoluciones(){
    this.api.consultaDatos('operaciones/devoluciones').subscribe((devoluciones: Array<Devolucion>) => {
      this.dataSource = new MatTableDataSource<Devolucion>(devoluciones);
      this.dataSourceAuxiliar = devoluciones;
    })
  }

  bufferCambios: any[] = [];

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
}
