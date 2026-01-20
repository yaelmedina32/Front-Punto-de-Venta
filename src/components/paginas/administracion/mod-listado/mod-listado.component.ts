import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { ApiService } from '../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ModClientesComponent } from '../clientes/clientes.component';
import { MatTableDataSource } from '@angular/material/table';
import { SessionService } from '../../../services/session.service';
export class Cliente{
  clienteId: number;
  nombre: string;
  fechaAlta: string;
  correo: string;
  telefono: number;
  estatusId: number;
  estatus: string;
}

@Component({
    selector: 'app-mod-listado',
    imports: [CompartidosModule],
    templateUrl: './mod-listado.component.html',
    styleUrl: './mod-listado.component.css'
})
export class ModListadoComponent implements OnInit{
  menuId = 10;
  dataSource = new MatTableDataSource<Cliente>(); 
   dataSourceAuxiliar: Array<Cliente> = [];
  columnasDesplegadas = ['nombre', 'fechaalta', 'correo', 'telefono', 'estatus', 'acciones']

  constructor(private api: ApiService, private dialog: MatDialog, private session: SessionService){}

  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
    this.cargarClientes();
  }

  guardarClientes(){
    swal({text: '¿Seguro que desea guardar cambios en los clientes?', title: 'Guardar Cambios', icon: "warning", buttons: ['No', 'Si']}).then((response) => {
      if(response){
        this.api.modificarDatos('administracion/clientes', this.dataSource.data.filter(ele => ele.estatusId == 9)).subscribe((response) => {
          this.cargarClientes();
        })
      }
    })
  }

  desactivarCliente(clienteid: number){
    const cliente = this.dataSource.data.find(ele => ele.clienteId == clienteid)?.nombre;
    const indice = this.dataSource.data.findIndex(ele => ele.clienteId == clienteid);
    swal({title: 'Desactivar Cliente', text: '¿Seguro que desea desactivar al cliente ' + cliente +  ' ?', buttons: ['No', 'Si'], icon: "warning"}).then((response )=> {
      if(response){
        this.dataSource.data[indice].estatusId = 9;
      }
    })
  }

  cargarClientes(){
    this.api.consultaDatos('administracion/clientes').subscribe((clientes: Array<Cliente>) => {
      this.dataSource = new MatTableDataSource<Cliente>(clientes);
      this.dataSourceAuxiliar= clientes;
    })
  }

  abrirAltaClientes(){
    const dialog = this.dialog.open(ModClientesComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      }
    )
    dialog.afterClosed().subscribe((response) => {
      if(response.estatus){
        this.cargarClientes();
      }
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
