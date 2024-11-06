import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';

@Component({
  selector: 'app-mod-categorias',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-categorias.component.html',
  styleUrl: './mod-categorias.component.css'
})
export class ModCategoriasComponent implements OnInit{
  columnasDesplegadas = ['nombre', 'acciones']
  dataSource = new MatTableDataSource<any>();
  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  marcarEliminado(categoriaId: number){
    const indice = this.dataSource.data.findIndex((ele: any) => ele.categoriaId == categoriaId);
    swal({ title: 'Marcar eliminado', text: '¿Desea guardar el marcado para eliminar?', buttons: ['No', 'Si'], icon: "warning" }).then((response) => {
      this.dataSource.data[indice].nuevo = 3;
      swal("Categoría marcada para eliminar", "Para eliminarla, presione en el botón 'Guardar'", "success");
    })
  }

  guardarCategorias(){
    swal( { title: 'Guardar datos', text: '¿Seguro que desea guardar las categorías modificadas?', buttons: ['No', 'Si'], icon: "warning" }).then((response) => {
      if(response){
        this.api.insertarDatos('operaciones/categorias', this.dataSource.data.filter((ele: any) => ele.nuevo != 0)).subscribe((response) => {
          swal("Categorias guardadas", "Se guardaron las categorías correctamente", "success");
          this.obtenerCategorias();
        })
      }
    })
  }

  agregarCategoria(){
    this.dataSource.data.push(
      {
        categoriaId: 0,
        nombre: '',
        nuevo: 1,
      }
    )
    this.dataSource.filter = "";
  }

  obtenerCategorias(){
    this.api.consultaDatos('operaciones/categorias').subscribe((categorias) => {
      this.dataSource.data = categorias
    })
  }
}
