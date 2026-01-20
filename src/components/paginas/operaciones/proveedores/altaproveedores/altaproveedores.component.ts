import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { Proveedor } from '../listaproveedores/listaproveedores.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'app-proveedores',
    imports: [CompartidosModule],
    templateUrl: './altaproveedores.component.html',
    styleUrl: './altaproveedores.component.css'
})
export class AltaProveedoresComponent implements OnInit{

  formGroup = new FormGroup ({
    nombreProveedor : new FormControl('', Validators.required),
    telefono : new FormControl('', [Validators.required, this.validarTelefono()]),
    email : new FormControl('', [Validators.required, Validators.email]),
    rfc : new FormControl('', [Validators.required, this.validarRFC()]),
    calle : new FormControl('', Validators.required),
    cp : new FormControl('', Validators.required),
    numeroexterior : new FormControl('', Validators.required),
    colonia : new FormControl('', Validators.required),
    ciudad : new FormControl('', Validators.required),
    municipio : new FormControl('', Validators.required),
    estado : new FormControl('', Validators.required),
    pais : new FormControl('', Validators.required),
    alias : new FormControl('', Validators.required),
  });
  
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

  validarRFC(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.parent) if(control.value.length > 15){
        return {rfcInvalido: true};
      }
      return null;
    }
  }


  validarTelefono(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.parent){
        if(control.value.length < 10){
          return {telefonoInvalido: true};
        }
      }
      return null;
    }
  }


  cargarProveedor(tipoVista: string, id: number){
    if(tipoVista != 'alta'){
      this.api.consultaDatos('operaciones/proveedor/' + id).subscribe((proveedor: Array<Proveedor>) => {
        this.formGroup.controls.nombreProveedor.setValue(proveedor[0] ? proveedor[0].nombre : '');
        this.formGroup.controls.telefono.setValue(proveedor[0] ? proveedor[0].telefono : '');
        this.formGroup.controls.rfc.setValue(proveedor[0] ? proveedor[0].rfc : ''); //proveedor[0].rfc
        this.formGroup.controls.calle.setValue(proveedor[0] ? proveedor[0].calle : ''); //proveedor[0].calle
        this.formGroup.controls.numeroexterior.setValue(proveedor[0] ? proveedor[0].noexterior : ''); //proveedor[0].noexterior
        this.formGroup.controls.colonia.setValue(proveedor[0] ? proveedor[0].colonia : ''); //proveedor[0].colonia
        this.formGroup.controls.ciudad.setValue(proveedor[0] ? proveedor[0].ciudad : ''); //proveedor[0].ciudad
        this.formGroup.controls.municipio.setValue(proveedor[0] ? proveedor[0].municipio : ''); //proveedor[0].municipio
        this.formGroup.controls.estado.setValue(proveedor[0] ? proveedor[0].estado : ''); //proveedor[0].estado
        this.formGroup.controls.pais.setValue(proveedor[0] ? proveedor[0].pais : ''); //proveedor[0].pais
        this.formGroup.controls.email.setValue(proveedor[0] ? proveedor[0].email : ''); //proveedor[0].email
        this.formGroup.controls.cp.setValue(proveedor[0] ? proveedor[0].cp : ''); //proveedor[0].cp
        this.formGroup.controls.alias.setValue(proveedor[0]?proveedor[0].alias: '')
        if(tipoVista == 'vista'){
          this.formGroup.disable();
        }
      })
    }
  }

  guardarProveedor(){
    console.log(this.formGroup.controls.rfc.errors);
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
          cp: this.formGroup.controls.cp.value,
          alias: this.formGroup.controls.alias.value
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
