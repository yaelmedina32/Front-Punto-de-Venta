import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../../services/api.service';
import { FormControl } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { Observable} from 'rxjs';
import { map, startWith } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog';
import swal from 'sweetalert';
import { ModPreciosVentaComponent } from './mod-precios-venta/mod-precios-venta.component';

export interface DatosOrdenCompra{
  ordencompraid: number;
  almacenid: number;
  descripcion: string;
  proveedorid: number;
  productoid: number;
  cantidad: number;
  preciounitario: number;
  descripcionproducto: string;
  unidadid: number;
  nombreproducto: string;
  modelo: string;
  unidad: string;
  cantidadinventario: number;
}

export interface DatosInventario{
  productoid: number;
  nombreproducto: string;
  cantidad: number;
  cantidadrestante: number;
  dot: string;
  ubicaciones: Array<any>;
  ubicacionid: number;
  precioventa: number;
}

export interface Ubicaciones{
  productoid: number;
  ubicacionid: number;
  ubicacion: string;
}


@Component({
  selector: 'app-altainventario',
  standalone: true,
  imports: [CompartidosModule],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
  ],
  templateUrl: './altainventario.component.html',
  styleUrl: './altainventario.component.css'
})

export class AltainventarioComponent implements OnInit{
  columnasDesplegadas = ['producto', 'dot', 'cantidad', 'precioventa', 'ubicacion', 'restante']
  dataSource = new MatTableDataSource<DatosInventario>();
  dataSourceAuxiliar: Array<DatosInventario> = [];
  ocCapturada = new FormControl();

  ordenesCompraFiltered: Observable<any>;
  ordenCompra = new FormControl();
  ordenesCompra: Array<any> = [];

  ocSeleccionada: Array<DatosOrdenCompra> = [];
  producto = new FormControl();
  productosFiltrados: Observable<any>;
  ubicaciones: Array<Ubicaciones> = [];
  almacenId = 0;


  constructor(private api: ApiService, private dialog: MatDialog){  
    if (typeof window !== 'undefined') {
      this.almacenId = parseInt(localStorage.getItem('almacenId') || '0')
    }
  }

  ngOnInit(): void {
    this.obtenerOrdenesCompra();
    this.obtenerUbicaciones();
  }

  inventarearTodo(){
    swal({title: 'Guardar todos los productos', 
      text: '¿Seguro que desea poner todo en inventario? Posteriormente se tendrán que colocar los DOTS para mejorar la administración de estos mismos.',
      buttons: ['No', 'Si'],
      icon: 'warning'
    }).then((response) => {

      if(response){
        const dialog = this.dialog.open(ModPreciosVentaComponent, {
          data: this.ocSeleccionada,
          width: '1500px',
        });
        dialog.afterClosed().subscribe((response) => {
          this.ocSeleccionada.forEach((producto) => {
            this.dataSource.data.push({
              productoid: producto.productoid,
              nombreproducto: producto.nombreproducto,
              cantidad: (producto.cantidad - producto.cantidadinventario),
              dot: '',
              cantidadrestante: 0,
              ubicaciones: [],
              ubicacionid: response.find((ele: any) => ele.productoid == producto.productoid).ubicacionid,
              precioventa: response.find((ele: any) => ele.productoid == producto.productoid).precioventa
            });    
          });    
          this.dataSource.data.forEach((row: any) => {
            row['ordencompraid'] = this.ocSeleccionada[0]['ordencompraid'];
          })
          this.api.insertarDatos('administracion/inventario', this.dataSource.data).subscribe((response) => {
            swal("Productos Inventareados.", "Se guardaron correctamente los productos al inventario", "success");
            this.obtenerUbicaciones();
            this.dataSource.data = [];
          })
        })
        /**
         *  productoid: number;
  nombreproducto: string;
  cantidad: number;
  cantidadrestante: number;
  dot: string;
  ubicaciones: Array<any>;
  ubicacionid: number;
  precioventa: number;
         */
      }
    })
  }

  filtrarOrdenes(valor: string){
    return this.ordenesCompra.filter(ele => ele.ordencompraid.toString().includes(valor));
  }

  obtenerOrdenesCompra(){
    this.api.consultaDatos('administracion/ordenescompra/' + this.almacenId + '/inventario').subscribe((ordenesCompra: Array<any>) => {
      this.ordenesCompra = ordenesCompra;
      console.log(this.ordenesCompra);
      this.ordenesCompraFiltered = this.ocCapturada.valueChanges.pipe(
        startWith(''),
        map((value: string) => this.filtrarOrdenes(value)),
      )
    })
  }

  guardarInventario(){
    console.log(this.dataSource.data);
    swal({title: 'Guardar Inventario', text: '¿Desea guardar los siguientes productos al inventario?', buttons: ['No', 'Si'], icon: "warning"}).then((response: any) => {
      if(response){
        this.dataSource.data.forEach((row: any) => {
          row['ordencompraid'] = this.ocSeleccionada[0]['ordencompraid'];
        })
        this.api.insertarDatos('administracion/inventario', this.dataSource.data).subscribe((response) => {
          swal("Productos Inventareados.", "Se guardaron correctamente los productos al inventario", "success");
          this.obtenerUbicaciones();
          this.dataSource.data = [];
        })
      }
    })
  }

  obtenerUbicaciones(){
    this.api.consultaDatos('operaciones/ubicaciones/producto/lista').subscribe((response: Array<Ubicaciones>) => {
      this.ubicaciones = response;
    })
  }

  validarPrecio(indice: number, valor: number){
    if(valor <= 0){
      swal("Error en el precio de venta", "No se puede tener un precio de venta menor o igual que 0");
      this.dataSource.data[indice]['precioventa'] = 1;
      return;
    }
  }

  buscarOC(){
    this.api.consultaDatos('administracion/detalle/ordencompra/' + this.ocCapturada.value).subscribe((ordencompra: Array<DatosOrdenCompra>) =>{
      this.ocSeleccionada = ordencompra;
      console.log(this.ocSeleccionada);
      this.almacenId = this.ocSeleccionada[0].almacenid;
      console.log(this.almacenId);
      this.productosFiltrados = this.producto.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrarProductos(value))
      );
    })
  }

  calcularRestantes(indice: number, productoid: number){
    if(this.dataSource.data[indice].cantidad < 0){
      this.dataSource.data[indice].cantidad = 0;
    }
    const nombreproducto = this.dataSource.data[indice].nombreproducto;
    //PRIMERO SACO LA CANTIDAD QUE YA ESTÁ INVENTAREADA 
    const cantidadReal = (this.ocSeleccionada.find(ele => ele.nombreproducto == this.dataSource.data[indice].nombreproducto)?.cantidad || 0) - 
                          (this.ocSeleccionada.find(ele => ele.nombreproducto == this.dataSource.data[indice].nombreproducto)?.cantidadinventario || 0);
    //LUEGO LA SUMATORIA DE LOS PRODUCTOS QUE LLEVAN INVENTAREANDOSE
    const cantidad = this.dataSource.data.reduce((acum, actual) => acum += actual.nombreproducto == nombreproducto ? actual.cantidad : 0, 0);
    for(let i = 0; i < this.dataSource.data.length; i++){
      //VALIDO QUE, EN BASE A LA ULTIMA CANTIDAD INDICADA, NO EXCEDA DE LA CANTIDAD INDICADA EN LA OC Y LAS INVENTAREADAS
        if((cantidadReal - cantidad) < 0){
          //SI EXCEDE, ENTONCES REGRESO ESE INPUT A 0, Y RECALCULO EN BASE A LO QUE YA ESTABA BIEN, PARA REINICIAR LA CANTIDAD RESTANTE
          this.dataSource.data[indice].cantidad = 0;
          const nuevaCantidad = this.dataSource.data.reduce((acum, actual) => acum += actual.nombreproducto == nombreproducto ? actual.cantidad : 0, 0);
          this.dataSource.data[indice].cantidadrestante = cantidadReal - nuevaCantidad;
          swal("Exceso de cantidad restante", "No se puede exceder la cantidad de productos de la OC", "warning");
          break;
        }
        this.dataSource.data[i].cantidadrestante = this.dataSource.data[i].nombreproducto == nombreproducto ? (cantidadReal - cantidad) : this.dataSource.data[i].cantidadrestante;
    }
    const idproducto = this.ocSeleccionada.find(ele => this.dataSource.data[indice].nombreproducto == ele.nombreproducto)?.productoid;
    this.dataSource.data[indice].productoid = idproducto || 0;
    this.api.consultaDatos(`operaciones/producto/ubicacion/${idproducto}/${this.almacenId}`).subscribe((ubicaciones: Array<any>) => {
      this.dataSource.data[indice].ubicaciones = ubicaciones;
    })
  }

  filtrarProductos(valor: string){
    return this.ocSeleccionada.filter(ele => ele.nombreproducto.toLowerCase().includes(valor.toLowerCase()));
  }

  agregarProducto(){
    //EL PUNTO ES QUE AGARRE PRODUCTOS DE LOS EXISTENTES DENTRO DE LA OC
    //Y QUE SOLO DEJE AGREGAR CUANDO NO EXCEDA LOS DISPONIBLES PARA INVENTARIO
    this.dataSource.data.push(
      {
        productoid: 0,
        nombreproducto: '',
        cantidad: 0,
        dot: '',
        cantidadrestante: 0,
        ubicaciones: [],
        ubicacionid: 0,
        precioventa: 0,
      }
    )
    this.dataSource.filter = "";
    this.dataSourceAuxiliar = [...this.dataSource.data];
  }
  bufferCambios: any[] = [];

  filtrarDatos(texto: string, objeto: string){
      //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
      const indiceCambios = this.bufferCambios.findIndex(ele => ele['objeto'] == objeto);
      if(indiceCambios == -1){
          this.bufferCambios.push({ valor:  texto , objeto: objeto });
      }else{
          //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
          this.bufferCambios[indiceCambios]['valor'] = texto;
      }
      console.log(this.bufferCambios);
      //EN BASE A LOS FILTROS CONCATENADOS, FILTRO EL VECTOR AUXILIAR
      this.dataSource.data = this.dataSourceAuxiliar.filter( (item: any) => {
          let contador = 0;
          //USO UN CONTADOR PARA IR CONTANDO LAS VECES QUE EL FILTRO ES CORRECTO, SE SUMA UNO POR CADA FILTRO CORRECTO DENTRO DEL VECTOR DE BUFFS
          //EL REGISTRO ES CORRECTO SI EL OBJETO DE ESE REGISTRO ACTUAL ES IGUAL AL TEXTO 
          this.bufferCambios.forEach( element=> {
              if(item[element.objeto].toString().trim().toLowerCase().includes(element.valor.toLowerCase())){
                  contador++;
              }
          })
          //EN CASO DE QUE EL CONTADOR SEA IGUAL A LOS ELEMENTOS DENTRO DEL BUFFER, ENTONCES LO DEVUELÑVE
          if (contador == this.bufferCambios.length) return item;
      });
      //Y CUANDO EL FILTRO ESTÉ VACÍO, ENTONCES LO ELIMINO DEL BUFFER
      if(texto == ''){
          this.bufferCambios.splice(indiceCambios, 1);
      }

      //MANEJO EL BUFFER PORQUE EN CASO DE QUE APLIQUEN FILTROS EN DESORDEN, EL SISTEMA NO VA A SABER CUÁL FUE EL ANTERIOR
      //YA TENIENDO EL BUFFER, COMO RECORRE LOS FILTROS APLICADOS, ENTONCES NO IMPORTA EN QUÉ ORDEN LO MANEJES
  }
}
