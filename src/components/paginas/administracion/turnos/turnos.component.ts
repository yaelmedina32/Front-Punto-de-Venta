import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ModCortesComponent } from './mod-cortes/mod-cortes.component';
import { ModHistorialCortesComponent } from './mod-historial-cortes/mod-historial-cortes.component';
import { SessionService } from '../../../services/session.service';
export class Turno{
  nombre: string;
  fechainicio: string;
  usuarioid: string;
  turnoid: number;
  cortes: number;
  restante: number;
  cantidadinicial: number;
}

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.css'
})
export class TurnosComponent implements OnInit{
  menuId = 9;
  dataSource = new MatTableDataSource<Turno>();
  columnasDesplegadas = ['usuario', 'fecha', 'cortes', 'restante', 'acciones'];
  sucursalId = 0;

  constructor(private api: ApiService, private dialog: MatDialog, private session: SessionService){
    this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
  }
  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
    this.obtenerTurnos();
    if(this.sucursalId == 0){
      swal("Seleccione almacén para continuar.", "Para poder administrar los turnos, debe seleccionar un almacén", "warning");
    }
  }
  
  terminarTurno(turnoid: number){
    swal({title: 'Cerrar Turno', text: "¿Seguro que desea terminar el turno del usuario " + this.dataSource.data.find(ele => ele.turnoid == turnoid)?.nombre + " ?", buttons: ['No', 'Si'], icon: "warning"})
      .then((response) => {
        if(response){
          const datos = {
            turnoid: turnoid,
            usuarioid: this.dataSource.data.find(ele => ele.turnoid == turnoid)?.usuarioid,
          }
          this.api.modificarDatos('administracion/terminar/turno', datos).subscribe((response) => {
            swal("Turno terminado correctamente", "Se terminó el turno del usuario " + this.dataSource.data.find(ele => ele.turnoid == turnoid)?.nombre, "success");
            this.obtenerTurnos();
          })
        }
      })
  }

  abrirHistorialCortes(){
    this.dialog.open(ModHistorialCortesComponent,
      {
        maxWidth: '100vW',
        width: '90%'
      }
    );
  }

  obtenerTurnos(){
    this.api.consultaDatos('administracion/turnos/' + this.sucursalId).subscribe((turnos: Array<Turno>) => {
      this.dataSource = new MatTableDataSource<Turno>(turnos);
    })
  }

  hacerCorte(turnoid: number){
    const config = {
      id: "dialog1",
      data: {
        turnoid: turnoid,
        cantidadMax: this.dataSource.data.find(ele => ele.turnoid == turnoid)?.cantidadinicial,
        cantidadRestante: this.dataSource.data.find(ele => ele.turnoid == turnoid)?.restante
      }
    }
    const dialogRef = this.dialog.open(ModCortesComponent, config);
    dialogRef.afterClosed().subscribe((response) => {
      const nombreUsuario = this.dataSource.data.find(ele => ele.turnoid == turnoid)?.nombre || '';
      swal("Corte realizado exitosamente", "Se realizó registró el retiro del dinero de la caja del turno de " + nombreUsuario, "success");
      this.obtenerTurnos();
    })
  }
}
