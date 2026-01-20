import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../../modulos/compartidos.module';
import { ApiService } from '../../../../../services/api.service';

@Component({
    selector: 'app-mod-precios',
    imports: [CompartidosModule],
    templateUrl: './mod-precios.component.html',
    styleUrl: './mod-precios.component.css'
})
export class ModPreciosComponent implements OnInit{
  descuentoMax = 0;
  sumaMax = 0;
  constructor(private api: ApiService){}

  ngOnInit(): void {
    this.obtenerLimites();
  }

  guardarLimites(){
    swal({title: 'Guardar Límites', text: "¿Seguro que desea guardar los límites de precios?", icon: "warning", buttons: ['No', 'Si']}).then((response) => {
      if(response){
        const datos = {
          descuento: this.descuentoMax,
          suma: this.sumaMax
        }
        this.api.insertarDatos('configuraciones/limites/precios', datos).subscribe((respopnse) => {
          swal("Datos insertados", "Se insertaron los límites correctamente", "success");
          this.obtenerLimites();
        })
      }
    })
  }

  comprobarInput(tipo: string){
    if(tipo == 'descuento'){
      if(this.descuentoMax < 0){
        swal("Error en el descuento","No se puede tener un descuento con menos de $0", "error")
        this.descuentoMax = 0;
      }
    }else{
      if(this.sumaMax < 0){
        swal("Error en la suma","No se puede tener una suma de precios con menos de $0", "error")
        this.sumaMax = 0;
      }
    }
  }

  obtenerLimites(){
    this.api.consultaDatos('configuraciones/limites/precios').subscribe((limites: any) => {    
      this.descuentoMax = limites.descuento;
      this.sumaMax = limites.suma;
    })  
  }
}
