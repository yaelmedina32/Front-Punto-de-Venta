import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../../../services/api.service';
export class formasPago{
letraVelocidadId: number;
  letra: string;
  nuevo: number = 0;
}
@Component({
    selector: 'app-altaletras',
    imports: [CompartidosModule],
    templateUrl: './altaletras.component.html',
    styleUrl: './altaletras.component.css'
})
export class AltaletrasComponent implements OnInit {
  dataSource = new MatTableDataSource<formasPago>();
  tipoPagos: Array<any> = [];
  columnasDeplegadas = ['Letra', 'acciones'];
  constructor (private api: ApiService){}

  ngOnInit(): void {
   this.cargarLetra();
 }
 
 cargarLetra(){
  this.api.consultaDatos('operaciones/letraVelocidad').subscribe((letras: Array<formasPago>) => {
    console.log(letras)
    this.dataSource = new MatTableDataSource<formasPago>(letras);
    
  })
}
agregarLetra(){
  this.dataSource.data.push({ 
    letraVelocidadId: 0,
    letra: "",
    nuevo: 1,
  })
  this.dataSource.filter = ""
}

guardarLetra(){
  console.log(this.dataSource.data);
  swal({title: 'Guaradar Letras de Velocidad ', text: '¿Seguro que desea guardar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
    if(valor){
      this.api.insertarDatos('operaciones/letraVelocidad', this.dataSource.data.filter(ele => ele.nuevo != 0)).subscribe((response: any) => {
        swal("Datos Insertados", "Se insertaron los datos correctamente", "success");
        this.cargarLetra();
      })
    }
  })
}
esLetraMayuscula(letra: string): boolean {
  return /^[A-Z]$/.test(letra); 
}
validateInput(element: any, event: KeyboardEvent) {
  const regex = /^[A-Z]*$/;
  // esto lo que hace es que verifica si la tecla presionada es una letra mayúscula o Backspace
  const key = event.key;
  if (!regex.test(key) && key !== 'Backspace') {
      event.preventDefault();
  }
  element.letra = element.letra.toUpperCase();
}

editarLetra(letraVelocidadId: number){
  const indice = this.dataSource.data.findIndex(ele => ele.letraVelocidadId == letraVelocidadId);
  console.log(indice);
  swal({title: 'Editar Letra de velocidad', text: '¿Seguro que desea Actualizar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
    if(valor){
        this.dataSource.data[indice].nuevo = 2;
        console.log(this.dataSource.data[indice].nuevo)
      }
    })
  }

eliminarLetra(letraVelocidadId: number){
  const indice = this.dataSource.data.findIndex(ele => ele.letraVelocidadId == letraVelocidadId);
  swal({title: 'Eliminar Letra de velocidad', text: '¿Seguro que desea Eliminar los datos?', buttons:['No', 'Si'], icon: "warning"}).then((valor: any) => {
    if(valor){
        this.dataSource.data[indice].nuevo = 3;
        swal("Letra eliminado", "Para eliminar la letra, guarde los datos", "success");
      }
    })
  }
}


