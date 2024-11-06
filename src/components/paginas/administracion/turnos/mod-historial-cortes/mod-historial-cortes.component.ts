import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { ApiService } from '../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';

export class Cortes{
  corteid: number;
  monto: number;
  fechacorte: string;
  nombre: string;
  fechainicio: string;
  fechacierre: string;
}

@Component({
  selector: 'app-mod-historial-cortes',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-historial-cortes.component.html',
  styleUrl: './mod-historial-cortes.component.css'
})
export class ModHistorialCortesComponent implements OnInit{
  dataSource = new MatTableDataSource<Cortes>();
  columnasDesplegadas = ['nombre', 'monto', 'fechacorte', 'fechainicio', 'fechafin', 'estatus', 'acciones'];
  constructor(private api: ApiService){}
  ngOnInit(): void {
    this.cargarHistorial();
  }

  cancelarCorte(corteid: number){
    const datos = {
      corteid: corteid
    }
    swal({title: 'Cancelar Corte', text: '¿Seguro que desea cancelar el corte realizado?', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        this.api.modificarDatos('administracion/cancelar/corte', datos).subscribe((response )=> {
          swal("Corte Cancelado", "Se canceló el corte seleccionado de manera exitosa", "success");
          this.cargarHistorial();
        })
      }
    })
  }

  cargarHistorial(){
    this.api.consultaDatos('administracion/historial/cortes').subscribe((cortes: Array<Cortes>) => {
      this.dataSource  = new MatTableDataSource<Cortes>(cortes);
    })
  }
}
