import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { Catergorias, ListaProductos, Marcas } from '../listaproductos/listaproductos.interface';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
@Component({
    selector: 'app-productos',
    imports: [CompartidosModule],
    templateUrl: './altaproductos.component.html',
    styleUrl: './altaproductos.component.css'
})
export class AltaProductosComponent implements OnInit{
  searchText: string = '';
  private ruta: any;
  productos = ['Salsa', 'Platano'];
  opcionesIVA = [{descripcion: "Si", clave: 1}, {descripcion: 'No', clave: 0}]; 
  opcionesRadiales = ['R', 'C'];
  tiposProductos = ['Nueva', 'Semi Nueva']
  modelo = new FormControl();
  letraVelocidad: Array<any> = [];
  letraVelocidadId = null;
  categorias: Array<Catergorias> = [] //TIENE QUE VENIR DE LA BD
  marcas: Array<Marcas> = []; //VIENE DE LA BD
  marcass =  new FormControl({value: '', disabled: false});
    marcasFiltradas: Observable<any>;
  productoSeleccionado = "Platano";
  idProducto = 0;
  estatus = "";
  iva = 0;
  marcaId = 0;
  //CONTROL DE FORMALURIOS

  categoria = 0;
  marca = "";
  roc = "";
  preciocompra = new FormControl('', Validators.required);
  clave = new FormControl('', Validators.maxLength(10));
  nombre = new FormControl('', Validators.maxLength(100));
  tipo = "";
  ancho = new FormControl('', Validators.required);
  alto = new FormControl('', Validators.required);
  rin = new FormControl('', Validators.required);
  indiceCarga = new FormControl('', Validators.required);
  aplicacion = new FormControl('', Validators.maxLength(30));
  tipoVehiculo = new FormControl('', Validators.maxLength(30));
  constructor(
    private router: Router,
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
        this.preciocompra.disable()
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
      if(producto[0]){
        this.clave.setValue(resultado.clave || '');
        this.preciocompra.setValue(resultado.precioCompra ? String(resultado.precioCompra) : '');
        this.nombre.setValue(resultado.nombre || '');
        this.iva = resultado.iva || 0;
        this.categoria = resultado.categoriaid || 3;
        this.modelo.setValue(resultado.modelo || '');
        this.categoria == 3 ? this.nombre.disable() : this.nombre.enable();
        this.tipo = resultado.tipo || ''
        this.ancho.setValue(resultado.ancho ? String(resultado.ancho) : '');
        this.alto.setValue(resultado.alto ? String(resultado.alto) : '');
        this.roc = resultado.roc || ''
        this.rin.setValue(resultado.tamanorin ? String(resultado.tamanorin) : '');
        this.indiceCarga.setValue(resultado.indicecarga ? String(resultado.indicecarga) : '');
        this.aplicacion.setValue(resultado.aplicacion || '')
        this.tipoVehiculo.setValue(resultado.tipovehiculo || '')
        if (resultado.marca) {
          this.marcass.setValue(resultado.marca); 
        } else {
          this.marcass.setValue(''); 
        }
      }
      this.marcasFiltradas = this.marcass.valueChanges.pipe(
        startWith(''), 
        map(value => this.filterMarcas(value || ''))
      );
      if(this.categoria == 3){
        this.nombre.setValue(`${this.ancho.value}/${this.alto.value}${this.roc}${this.rin.value} ${this.indiceCarga.value}`);
      }else{
         this.nombre.value 
      }
    })
  }
  
  filterMarcas(value: string): Marcas[] {
    const filterValue = value.toLowerCase();
    return this.marcas.filter(marca => marca.nombre.toLowerCase().includes(filterValue));
  }

  
  cargarCatalogos(){
    this.api.consultaDatos('operaciones/categorias').subscribe((categorias: Array<Catergorias>) => {
      this.categorias = categorias
      this.api.consultaDatos('marcas/marcas').subscribe((marcas: Array<Marcas>) => {
        console.log(marcas);
        this.marcas = marcas
        this.cargarProducto();
      }) 
    }) 
  }

  guardarProducto(){
    if(this.preciocompra.invalid){
      swal("Error", "El precio de compra es obligatorio.", "error");
      return;
    }
    if(this.categoria == 3){
      if (this.ancho.invalid || this.rin.invalid) {
        swal("Error", "El ancho y rin son campos obligatorios.", "error");
        return;
      }
}
    const marcaid: any = this.marcas.findIndex(ele => ele.nombre == this.marcass.value);
    const nombreFormeteado = this.nombre.value?.split('null').join('').trim();
    if(marcaid == -1){
      swal("El proveedor no fue encontrado.", "Revise el nombre o que el campo no esté en blanco.", "error");
      return;
    }

    if (!this.nombre.value || this.nombre.value.trim() === '') {
      swal("Error", "El nombre es obligatorio.", "error");
      return;
    }
    
    if (this.categoria === 0) {
      swal("Error", "Debe seleccionar una categoría.", "error");
      return;
    }
    swal({title: 'Guardar Datos.', text: '¿Desea guardar este producto?', buttons: ['No', 'Si'], icon: "warning"}).then((value: any) => {
      if(value){
        console.log( this.preciocompra.value);
        const datosEnviar = {
          clave: this.clave.value,
          nombre: nombreFormeteado,
          iva: this.iva,
          categoria: this.categoria, 
          ancho: this.ancho.value,
          alto: this.alto.value, 
          precioCompra: this.preciocompra.value,
          roc: this.roc,
          letraVelocidadId: this.letraVelocidadId,
          tamanorin: this.rin.value,
          indiceCarga: this.indiceCarga.value,
          aplicacion: this.aplicacion.value,
          tipoVehiculo: this.tipoVehiculo.value,
          modelo: this.modelo.value,
          edicion: this.estatus,
          marcaid: this.marcas.find(ele => ele.nombre == this.marcass.value)?.marcaId || 0,
          productoid: this.idProducto,
        }
        this.api.insertarDatos('operaciones/producto', datosEnviar).subscribe(response => {
          if (response){
            const producto = response.datosProcesados;
            if(producto.precioCompra == undefined){
              swal("Datos Insertados.", "Se insertó el producto correctamente.", "success");
              this.cargarProducto();
              this.router.navigate([`/operaciones/productos/lista`]);
              console.log('Producto Insertado y no se inserto cotizacion');
            }else {
          
            const datosEnviar ={
              productoid: producto.productoId,
              precioCompra:producto.precioCompra,
              fecha: new Date(),
              
            }

  
            this.api.insertarDatos ('operaciones/cotizacion', datosEnviar).subscribe((response) => {
              console.log('Cotizacion Insertada');
              swal("Datos Insertados.", "Se insertó el producto correctamente.", "success");
              this.cargarProducto();
              this.router.navigate([`/operaciones/productos/lista`]);
            
            }) 
          }
        }
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
    if(this.categoria == 3){
    this.nombre.setValue(`${this.ancho.value}/${this.alto.value}${this.roc}${this.rin.value} ${this.indiceCarga.value}`);
  }else{
     this.nombre.value 
  }
    
  }

  
  

}
