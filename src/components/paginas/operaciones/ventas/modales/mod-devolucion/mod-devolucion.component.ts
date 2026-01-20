import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../../services/api.service'; 
import { FormControl, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Observable, startWith, map  } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-mod-devolucion',
    imports: [FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        AsyncPipe,
        CommonModule],
    templateUrl: './mod-devolucion.component.html',
    styleUrl: './mod-devolucion.component.css'
})
export class ModDevolucionComponent implements OnInit{
  myControl = new FormControl('');
  motivo = new FormControl('', Validators.required);
  rechazos: any[] = [];
  filteredRechazos!: Observable<string[]>; // Usar el tipo correcto
  motivoId = 1;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialogRef: MatDialogRef<any>) {}

  ngOnInit(): void {
    this.cargarRechazos();
  }
  cargarRechazos() {
    this.api.consultaDatos('operaciones/rechazos').subscribe(
      (rechazos: any[]) => {
        console.log('Rechazos recibidos:', rechazos);
        if (Array.isArray(rechazos)) {
          this.rechazos = rechazos;
          this.filteredRechazos = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || ''))
          );
        }
      }
    );
  }
  
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.rechazos
      .filter(
        (rechazo: any) =>
          rechazo.motivo && rechazo.motivo.toLowerCase().includes(filterValue)
      )
      .map((rechazo: any) => rechazo.motivo);
  }
  
  guardarDevolucion() {
    if (!this.motivo.valid) {
      swal('Campo vacío', 'Debe especificar el motivo del rechazo', 'error');
      return;
    }
    const motivoSeleccionado = this.rechazos.find(rechazo => rechazo.motivo === this.myControl.value);
  
   
    const motivoId = motivoSeleccionado ? motivoSeleccionado.motivoId : null;
  
  
    if (!motivoId) {
      swal('Motivo no válido', 'Debe seleccionar un motivo de rechazo válido', 'error');
      return;
    }
  
    const datos = {
      ventaid: this.data,
      motivo: this.motivo.value,
      motivoId: motivoId
    };
  
    // Llamada a la API para enviar los datos
    this.api.modificarDatos('operaciones/devolucion', datos).subscribe((response) => {
      this.dialogRef.close();
    });
  }}
