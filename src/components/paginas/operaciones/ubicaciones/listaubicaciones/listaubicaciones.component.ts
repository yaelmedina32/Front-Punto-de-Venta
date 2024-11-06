import { Component, OnInit, ViewChild } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../../services/api.service';
import { ListaUbicaciones } from './listaubicaciones.interface';
import { MatPaginator } from '@angular/material/paginator';
import { SessionService } from '../../../../services/session.service';
declare const $: any;

@Component({
  selector: 'app-listaubicaciones',
  standalone: true,
  imports: [CompartidosModule, RouterLink],
  templateUrl: './listaubicaciones.component.html',
  styleUrl: './listaubicaciones.component.css'
})
export class ListaubicacionesComponent implements OnInit{
  menuId=6;
  @ViewChild(MatPaginator)  set paginator(value: MatPaginator) { this.dataSource.paginator = value; }
  columnasDesplegadas = ['pasillo', 'anaquel', 'nivel', 'capacidad', 'acciones'];
  dataSource = new MatTableDataSource<ListaUbicaciones>();
  dataSourceAuxiliar: any[] = [];
  almacenId = 0;

  constructor(private api: ApiService, private session: SessionService){
    if (typeof window !== 'undefined') {
      this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
    }
  }
  ngOnInit(){
    this.session.validarSesion(this.menuId);
    if(this.almacenId != 0){
      this.consultarUbicaciones();
      this.dataSourceAuxiliar = this.dataSource.data;
    }
  }

  consultarUbicaciones(){
    console.log(this.almacenId);
    this.api.consultaDatos('operaciones/ubicaciones/' + this.almacenId).subscribe((ubicaciones: Array<ListaUbicaciones>) => {
      this.dataSource = new MatTableDataSource(ubicaciones)
      this.dataSource.paginator = this.paginator
    })
  }

  guardarUbicacion(){
    swal({text: "¿Seguro que desea guardar el catálogo de ubicaciones?", buttons:['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){    
        this.api.insertarDatos('operaciones/ubicaciones', this.dataSource.data).subscribe((reponse: any) =>{
          this.consultarUbicaciones();
          swal("Datos guardados correctamente.", "Se guardaron las ubicaciones correctamente", "success");
        })
      }
    })
  }

  agregarUbicacion(){
    this.dataSource.data.push({
      ubicacionId: 0,
      pasillo: "0",
      anaquel: "0",
      nivel: "0",
      nuevo: 1,
      almacenid: this.almacenId,
      capacidad: 0
    });
    this.dataSource.filter = "";
  }

  eliminarUbicacion(ubicacionid: number, pasillo: number, anaquel:number, nivel: number){
    swal({text: `¿Seguro que desea eliminar la ubicación ${pasillo + '-' + anaquel + '-' + nivel}?`, buttons:['No', 'Si']}).then((response) => {
      if(response){
        const indice = this.dataSource.data.findIndex(ele => ele.ubicacionId == ubicacionid);
        this.dataSource.data[indice].nuevo = -1;
        console.log(indice);
        swal("Producto marcado para eliminar", "Presione en 'Guardar' para que se elimine la ubicación", "success");
      }
    })
  }

  bufferCambios: any[] = [];

    filtrarDatos(texto: string, objeto: string){
        //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
        const indiceCambios = this.bufferCambios.findIndex(ele => ele['objeto'] == objeto);
        if(indiceCambios == -1){
            this.bufferCambios.push({ valor: texto, objeto: objeto });
        }else{
            //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
            this.bufferCambios[indiceCambios]['valor'] = texto;
        }
        //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
        this.dataSource.data = this.dataSourceAuxiliar.filter( (item) => {
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
