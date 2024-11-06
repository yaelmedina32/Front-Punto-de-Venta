import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../services/api.service';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../../services/session.service';

export class Marcas{
  marcaId: number;
  nombre: string;
  nuevo: number;
}

@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [CompartidosModule, RouterLink],
  templateUrl: './marcas.component.html',
  styleUrl: './marcas.component.css'
})


export class MarcasComponent implements OnInit{
  menuId = 7;
  dataSource = new MatTableDataSource<Marcas>();
  columnasDeplegadas = ['nombre', 'acciones'];

  constructor(private api: ApiService, private session: SessionService){}

  ngOnInit(): void {
    this.cargarMarcas();
    this.session.validarSesion(this.menuId);
  }

  cargarMarcas(){
    this.api.consultaDatos('marcas/marcas').subscribe((marcas: Array<Marcas>) => {
      this.dataSource = new MatTableDataSource<Marcas>(marcas);
    })
  }

  agregarMarca(){
    this.dataSource.data.push(
      {
        marcaId: 0,
        nombre: '',
        nuevo: 1,
      }
    )
    this.dataSource.filter = "";
  }

  guardarMarcas(){
    swal({title: 'Guardar Marcas', text: '¿Seguro que desea guardar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
      if(valor){
        this.api.insertarDatos('marcas/marcas', this.dataSource.data.filter(ele => ele.nuevo != 0)).subscribe((response: any) => {
          swal("Datos Insertados", "Se insertaron los datos correctamente", "success");
          this.cargarMarcas();
        })
      }
    })
  }
}
