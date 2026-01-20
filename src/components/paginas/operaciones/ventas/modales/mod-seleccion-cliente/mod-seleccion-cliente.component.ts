import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { ApiService } from '../../../../../services/api.service';
import { map, Observable, startWith } from 'rxjs';
import { Cliente } from '../../../../administracion/mod-listado/mod-listado.component';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModClientesComponent } from '../../../../administracion/clientes/clientes.component';

@Component({
    selector: 'app-mod-seleccion-cliente',
    imports: [CompartidosModule],
    templateUrl: './mod-seleccion-cliente.component.html',
    styleUrl: './mod-seleccion-cliente.component.css'
})
export class ModSeleccionClienteComponent implements OnInit{

  clientesFiltrados: Observable<any>;
  clientes: Array<Cliente> = [];
  cliente = new FormControl();

  constructor(private api: ApiService, private dialog: MatDialog, private dialogRef: MatDialogRef<any>){}

  ngOnInit(): void {
    this.cargarClientes();
  }

  devolverCliente(){
    swal({text: '¿Seguro que desea regresar el cliente ' + this.cliente.value + '?', title: 'Seleccionar Cliente', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        this.dialogRef.close({clienteid: this.clientes.find(ele => ele.nombre == this.cliente.value)?.clienteId})
      }
    })
  }

  abrirAltaClientes(){
    const dialog = this.dialog.open(ModClientesComponent, {
      maxWidth: '100vW',
      width: '90%',
      data: {seleccion: true},
    })
    dialog.afterClosed().subscribe((cliente) => {
      if(cliente.clienteid){
        this.dialogRef.close({clienteid: cliente.clienteid});
      }
    })
  }

  cargarClientes(){
    this.api.consultaDatos('administracion/clientes').subscribe((clientes: Array<Cliente>) => {
      this.clientes = clientes;
      this.clientesFiltrados = this.cliente.valueChanges.pipe(
        startWith(''),
        map(valor => this.filtrarClientes(valor))
      )
    })
  }

  filtrarClientes(valor: string){
    return this.clientes.filter(ele => ele.nombre.toLowerCase().includes(valor.toLowerCase()))
  }
}
