import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { ApiService } from '../../../services/api.service';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ModClientesComponent implements OnInit{
  nombre = new FormControl();
  correo = new FormControl();
  telefono = new FormControl();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService,
    private dialogref: MatDialogRef<any>) { }

  ngOnInit(): void {
    this.nombre.setValue('');
    this.correo.setValue('');
    this.telefono.setValue('');
  }

  validarTelefono(){
    if(this.telefono.value.toString().length > 10){
      swal("Teléfono no válido", "El teléfono debe ser de 10 dígitos", "error")
      return;
    }
  }

  guardarCliente(){
    console.log(this.telefono.value.toString());
    if(this.telefono.value.toString().length != 10){
      swal("Teléfono no válido", "El teléfono debe ser de 10 dígitos", "error")
      return;
    }
    swal({title: 'Alta de Cliente', text: '¿Seguro que desea dar de alta al cliente ' + this.nombre.value +  ' ?', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        const datos = {
          nombre: this.nombre.value,
          correo: this.correo.value,
          telefono: this.telefono.value,
        }
        this.api.insertarDatos('administracion/clientes', datos).subscribe((response ) => {
          swal("Datos insertados", "Se agregó el cliente correctamente");
          if(this.data.seleccion == true){
            this.api.consultaDatos('administracion/cliente/max').subscribe((ultimocliente) => {
              this.dialogref.close({clienteid: ultimocliente[0].clienteid});
            })
          }else{
            this.dialogref.close({estatus: 'ok'});
          }
        })
      }
    })
  }
}
