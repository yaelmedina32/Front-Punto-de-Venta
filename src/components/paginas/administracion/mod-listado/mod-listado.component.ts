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
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-listado.component.html',
  styleUrl: './mod-listado.component.css'
})
export class ModListadoComponent implements OnInit{
  menuId = 10;
  dataSource = new MatTableDataSource<Cliente>();
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
          swal("Datos modificados correctamente", "Se modificaron los clientes exitosamente", "success");
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
        swal("Cliente desactivado", "Para guardar los cambios, presione en el botón 'Guardar'", "success");
      }
    })
  }

  cargarClientes(){
    this.api.consultaDatos('administracion/clientes').subscribe((clientes: Array<Cliente>) => {
      this.dataSource = new MatTableDataSource<Cliente>(clientes);
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
}
