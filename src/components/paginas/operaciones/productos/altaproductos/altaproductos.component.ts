import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { Catergorias, ListaProductos, Marcas } from '../listaproductos/listaproductos.interface';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './altaproductos.component.html',
  styleUrl: './altaproductos.component.css'
})
export class AltaProductosComponent implements OnInit{
  private ruta: any;
  productos = ['Salsa', 'Platano'];
  opcionesIVA = [{descripcion: "Si", clave: 1}, {descripcion: 'No', clave: 0}]; 
  opcionesRadiales = ['R', 'C'];
  tiposProductos = ['Nueva', 'Semi Nueva']
  modelo = new FormControl();
  letraVelocidad: Array<any> = [];
  letraVelocidadId = 1;
  categorias: Array<Catergorias> = [] //TIENE QUE VENIR DE LA BD
  marcas: Array<Marcas> = []; //VIENE DE LA BD
  productoSeleccionado = "Platano";
  idProducto = 0;
  estatus = "";
  iva = 0;
  marcaId = 0;
  //CONTROL DE FORMALURIOS

  categoria = 0;
  marca = "";
  roc = ""
  clave = new FormControl('', Validators.maxLength(10));
  nombre = new FormControl('', Validators.maxLength(100));
  tipo = "";
  ancho = new FormControl();
  alto = new FormControl();
  rin = new FormControl();
  indiceCarga = new FormControl();
  aplicacion = new FormControl('', Validators.maxLength(30));
  tipoVehiculo = new FormControl('', Validators.maxLength(30));
  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private dialog: MatDialog
  ){    if (typeof window !== 'undefined') {
    localStorage.setItem('navegacion', 'Inicio');
  }}

  ngOnInit(): void {
    this. cargarLetrasVelocidad();
    this.ruta = this.route.params.subscribe(parametros => {
      this.idProducto = parametros['idproducto'];
      this.estatus = parametros['estatus'];
      this.estatus == 'edicion' || this.estatus == 'vista' ? this.clave.disable() : null;
      if(this.estatus == 'vista'){
        this.nombre.disable()
        this.modelo.disable()
        this.ancho.disable()
        this.alto.disable()
        this.rin.disable()
        this.indiceCarga.disable()
        this.aplicacion.disable()
        this.tipoVehiculo.disable()
      }
      this.alto.setValue('');
      this.cargarCatalogos();
    })
  }
  cargarLetrasVelocidad(){
    this.api.consultaDatos('operaciones/letraVelocidad').subscribe((letraVelocidad) => {
      this.letraVelocidad = letraVelocidad;
    })
  }
  cargarProducto(){
    this.api.consultaDatos('operaciones/producto/' + this.idProducto).subscribe((producto: Array<ListaProductos>) => {
      const resultado = producto[0];
      this.marca = resultado.marca;
      this.clave.setValue(resultado.clave);
      this.nombre.setValue(resultado.nombre);
      this.iva = resultado.iva;
      this.categoria = resultado.categoriaid;
      this.modelo.setValue(resultado.modelo);
      this.categoria == 3 ? this.nombre.disable() : this.nombre.enable();
      this.tipo = resultado.tipo
      this.ancho.setValue(resultado.ancho.toString())
      this.alto.setValue(resultado.alto.toString())
      this.roc = resultado.roc
      this.rin.setValue(resultado.tamanorin.toString())
      this.indiceCarga.setValue(resultado.indicecarga)
      this.aplicacion.setValue(resultado.aplicacion)
      this.tipoVehiculo.setValue(resultado.tipovehiculo)
      this.nombre.setValue(`${this.alto.value}/${this.ancho.value}${this.roc}${this.rin.value} ${this.indiceCarga.value}`);
    })
  }
  
  cargarCatalogos(){
    this.api.consultaDatos('operaciones/categorias').subscribe((categorias: Array<Catergorias>) => {
      this.categorias = categorias
      this.api.consultaDatos('marcas/marcas').subscribe((marcas: Array<Marcas>) => {
        this.marcas = marcas
        this.cargarProducto();
      }) 
    }) 
  }

  guardarProducto(){
    console.log(this.estatus);
    swal({title: 'Guardar Datos.', text: '¿Desea guardar este producto?', buttons: ['No', 'Si'], icon: "warning"}).then((value: any) => {
      if(value){
        const datosEnviar = {
          clave: this.clave.value,
          nombre: this.nombre.value,
          iva: this.iva,
          categoria: this.categoria, 
          ancho: this.ancho.value,
          alto: this.alto.value, 
          roc: this.roc,
          letraVelocidadId: this.letraVelocidadId,
          tamanorin: this.rin.value,
          indiceCarga: this.indiceCarga.value,
          aplicacion: this.aplicacion.value,
          tipoVehiculo: this.tipoVehiculo.value,
          modelo: this.modelo.value,
          edicion: this.estatus,
          marcaid: this.marcas.find(ele => ele.nombre == this.marca)?.marcaId || 0,
          productoid: this.idProducto,
        }
        this.api.insertarDatos('operaciones/producto', datosEnviar).subscribe(response => {
          swal("Datos Insertados.", "Se insertó el producto correctamente.", "success");
          this.cargarProducto();
        })
      }
    })
  }
  seleccionarCategoria(){
    if(this.categoria == 3){
      this.nombre.disable();
    }else{
      this.nombre.enable();
    }
  }

  cargarNombre(){
    this.nombre.setValue(`${this.ancho.value}/${this.alto.value}${this.roc}${this.rin.value} ${this.indiceCarga.value}`);
  }


}
