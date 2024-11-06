import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { Proveedor } from '../listaproveedores/listaproveedores.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './altaproveedores.component.html',
  styleUrl: './altaproveedores.component.css'
})
export class AltaProveedoresComponent implements OnInit{

  formGroup = new FormGroup ({
    nombreProveedor : new FormControl('', Validators.required),
    telefono : new FormControl('', [Validators.required]),
    email : new FormControl('', [Validators.required, Validators.email]),
    rfc : new FormControl('', Validators.required),
    calle : new FormControl('', Validators.required),
    cp : new FormControl('', Validators.required),
    numeroexterior : new FormControl('', Validators.required),
    colonia : new FormControl('', Validators.required),
    ciudad : new FormControl('', Validators.required),
    municipio : new FormControl('', Validators.required),
    estado : new FormControl('', Validators.required),
    pais : new FormControl('', Validators.required),
  })
  vista = "";
  proveedorId = 0;
  constructor(private api: ApiService, private router: Router, private params: ActivatedRoute){ }

  ngOnInit(): void {
    this.params.params.subscribe((parametros: any) => {
      this.vista = parametros['tipo'];
      this.proveedorId = parametros['id'];
      this.cargarProveedor(parametros['tipo'], parametros['id']);
    })
  }

  cargarProveedor(tipoVista: string, id: number){
    if(tipoVista != 'alta'){
      this.api.consultaDatos('operaciones/proveedor/' + id).subscribe((proveedor: Array<Proveedor>) => {
        this.formGroup.controls.nombreProveedor.setValue(proveedor[0].nombre);
        this.formGroup.controls.telefono.setValue(proveedor[0].telefono);
        this.formGroup.controls.rfc.setValue(proveedor[0].rfc);
        this.formGroup.controls.calle.setValue(proveedor[0].calle);
        this.formGroup.controls.numeroexterior.setValue(proveedor[0].noexterior);
        this.formGroup.controls.colonia.setValue(proveedor[0].colonia);
        this.formGroup.controls.ciudad.setValue(proveedor[0].ciudad);
        this.formGroup.controls.municipio.setValue(proveedor[0].municipio);
        this.formGroup.controls.estado.setValue(proveedor[0].estado);
        this.formGroup.controls.pais.setValue(proveedor[0].pais);
        this.formGroup.controls.email.setValue(proveedor[0].email);
        this.formGroup.controls.cp.setValue(proveedor[0].cp);
        if(tipoVista == 'vista'){
          this.formGroup.disable();
        }
      })
    }
  }

  guardarProveedor(){
    if(!this.formGroup.valid){
      swal("Campos inválidos", "Hay campos que no se han llenado", "error");
      return;
    }
    swal({title: 'Guardar Datos', text: '¿Seguro de que quiere guardar los datos del proveedor?', buttons:['No', 'Si'], icon: "warning"}).then((response: any)=> {
      if(response){
        const datos = {
          proveedorid: this.proveedorId,
          tipo: this.vista,
          nombre: this.formGroup.controls.nombreProveedor.value,
          telefono: this.formGroup.controls.telefono.value,
          rfc: this.formGroup.controls.rfc.value,
          calle: this.formGroup.controls.calle.value,
          noexterior: this.formGroup.controls.numeroexterior.value,
          colonia: this.formGroup.controls.colonia.value,
          ciudad: this.formGroup.controls.ciudad.value,
          municipio: this.formGroup.controls.municipio.value,
          estado: this.formGroup.controls.estado.value,
          pais: this.formGroup.controls.pais.value,
          email: this.formGroup.controls.email.value,
          cp: this.formGroup.controls.cp.value
        };
        this.api.insertarDatos('operaciones/proveedor', datos).subscribe((response) => {
          if(response.error){
            swal("Error en el servidor", "Hubo un problema dentro del servidor, contácte a las personas autorizadas", "error");
            return;
          }
          swal("Datos insertados", "Se insertaron los datos correctamente", "success");
          this.router.navigate(['operaciones/proveedores/lista']);
        })
      }
    })
  }
}
