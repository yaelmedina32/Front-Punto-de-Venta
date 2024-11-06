import { AfterViewInit,ViewChildren, Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { FormControl, FormGroup } from '@angular/forms';
import { formatNumber } from '@angular/common';
import { map, Observable, startWith } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../services/api.service';
import { ListaProductosResumido } from '../../operaciones/productos/listaproductos/listaproductos.interface';
import { ListaProveedores } from '../../operaciones/proveedores/listaproveedores/listaproveedores.interface';
import swal from 'sweetalert';
import { MatDialog } from '@angular/material/dialog';
import { AuthGuard } from '../../../services/auth-guard';
import { ModOrdenesCompraComponent } from './mod-ordenes-compra/mod-ordenes-compra.component';
import { SessionService } from '../../../services/session.service';
import { Renderer2 } from '@angular/core';
import { QueryList } from '@angular/core';
import { ElementRef } from '@angular/core';
export class UnidadesMedida{
  unidadid: number;
  descripcion: string;
}

export class InventarioPosterior{
  cantidad: number;
  costo: number;
}


@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent implements OnInit, AfterViewInit{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  menu: any[] = [];
  menuId = 1;
  formGroup: FormGroup;
  nombreProdSeleccionado = "";
  proveedoresFiltrados: Observable<any>;
  productosFiltrados: Observable<any>;
  cantidad = new FormControl();
  precioUnitario = new FormControl();
  solicitante = new FormControl({value: '', disabled: false});
  proveedor = new FormControl({value: '', disabled: this.solicitante.value == ''});
  producto = new FormControl({value: '', disabled: this.proveedor.value == ''});
  importe :string = '0';
  dataSourceOC = new MatTableDataSource<any>();
  productos: Array<ListaProductosResumido> = [];
  descripcionOC = new FormControl();
  aplicaInventario: boolean = false;
  almacenId = 0;   
  unidades: Array<UnidadesMedida> = [];
  urlNavegacion = "";
  usuarioId = 0;
  sinInventario = false;
  contenedor = new FormControl();
  contenedoresFiltrados: Observable<any>;
  contenedores: Array<any> = []
  dataSourceInventarios = new MatTableDataSource<InventarioPosterior>();
  cantidadSI = new FormControl();
  costoSI = new FormControl();

  proveedores: Array<ListaProveedores> = []


  columnasDesplegadasOC = ['inventario', 'producto', 'cantidad', 'unidad', 'precio', 'cantidadinventario', 'importe', 'acciones'];
  columnasDesplegadasInventario = ['cantidad', 'costo'];

  constructor(private api: ApiService, private dialog: MatDialog, private guard: AuthGuard,private session: SessionService, private renderer: Renderer2){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');

      this.almacenId = parseInt(localStorage.getItem('almacenId') || '0');
      this.solicitante.setValue(sessionStorage.getItem('nombreusuario') || '');
      const auxiliar = localStorage.getItem('navegacion');
      !auxiliar?.includes('/Compras') ? localStorage.setItem('navegacion', auxiliar + '/Compras') : null;
      this.urlNavegacion = 'Inicio/Compras';
      localStorage.setItem('actual', '1');
      
    }
  }
  ngAfterViewInit(): void {
    this.arregloElementos = this.elementosBotones.toArray();
    console.log('arrreglo elementos botones',this.arregloElementos)
    this.obtenerPermisoBotones();
  //this.api.consultaDatos('')

  }

  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
    if(this.almacenId == 0){
      swal("Almacén no seleccionado.", "Seleccion un almacén para continuar.", "warning");
      return;
    }
    this.importe = '0';
    this.obtenerCatalogos();
    this.dataSourceInventarios.data = [
      {
        cantidad: 0,
        costo: 0,
      }
    ]
    this.dataSourceOC.data = [
      {
        inventario: true,
        cantidad: 0,
        producto: '',
        productoid: 0,
        unidadid: 0,
        precio: 0,
        importe: 0,
        cantidadinventario: 0,
      }
    ]
  }

  obtenerCatalogos(){
    this.api.consultaDatos('operaciones/productos/resumido/' + this.almacenId).subscribe((productos: Array<ListaProductosResumido>) => {
      this.productos = productos;
      this.productosFiltrados = this.producto.valueChanges.pipe(
        startWith(''),
        map(valor => this.filtrarProducto(valor!))
      );
      this.api.consultaDatos('operaciones/proveedores').subscribe((proveedores: Array<ListaProveedores>) => {
        this.proveedores = proveedores;
        this.proveedoresFiltrados = this.proveedor.valueChanges.pipe(
          startWith(''),
          map(valor => this.filtrarProveedor(valor!))
        );  
        this.api.consultaDatos('administracion/unidades').subscribe((unidades: Array<UnidadesMedida>) => {
          this.unidades = unidades;
          this.api.consultaDatos('administracion/contenedores/' + this.almacenId).subscribe((contenedores: Array<any>) => {
            this.contenedores = contenedores;
            console.log(this.contenedores)  ;
            this.contenedoresFiltrados = this.contenedor.valueChanges.pipe(
              startWith(''),
              map(valor => this.filtrarContenedores(valor)),
            )
          })
        }) 
      })
      
    })
  }

  filtrarContenedores(valor: number){
    return this.contenedores.filter(ele => ele.contenedor.toString().includes(valor));
  }

  abrirConsulta(){
    this.dialog.open(ModOrdenesCompraComponent,
      {
        maxWidth: '90vW',
        width: '100%',
      }
    )
  }

  accionesOC(aceptado: number, ordencompraid: number){
    swal({
      title: `${aceptado == 1 ? 'Aceptación ' : aceptado == 2 ? 'Rechazo ' : 'Cancelación' }de OC con folio ${ordencompraid}`,
      text: `¿Seguro que desea ${aceptado == 1 ? 'aceptar' : aceptado == 2 ? 'rechazar' : 'cancelar'} la OC?`,
      buttons: ['No', 'Si'],
      icon: 'warning'
    }).then((response: any) => {
      if(response){
        const datosAEnviar = {
          aceptado: aceptado,
          ordencompraid: ordencompraid
        }
        this.api.modificarDatos('administracion/estatus/ordencompra', datosAEnviar).subscribe((response: any) => {
          if(response.mensaje){
            swal("Orden de compra modificada.", "Se modificó el estatus de la orden de compra correctamente", "success");
            this.obtenerCatalogos();
          }
        })
      }
    })
  }

  seleccionarProducto(indice: number, valor: string){
    const productoid = this.productos.find(ele => ele.nombre == valor)?.productoid;
    this.dataSourceOC.data[indice]['productoid'] = productoid
    this.api.consultaDatos(`administracion/cantidad/inventario/${productoid}/${this.almacenId}`).subscribe((conteo: Array<any>) => {
      this.dataSourceOC.data[indice]['cantidadinventario'] = conteo[0]['inventareado'];
    })
  }
  
  agregarProducto(){
    this.dataSourceOC.data.push({
      inventario: true,
      cantidad: 0,
      producto: '',
      unidadid: 0,
      precio: 0,
      importe: 0,
    })
    this.dataSourceOC.filter = "";
  }

  eliminarProducto(indice: number){
    swal({text: `¿Desea eliminar el producto ${this.dataSourceOC.data[indice]['producto']}?`, buttons: ['No', 'Si']}).then((response: any) => {
      if(response){
        this.dataSourceOC.data.splice(indice, 1);
        this.dataSourceOC.filter = "";
      }
    })
  }

  filtrarProveedor(valor: string){
    return this.proveedores.filter(ele => ele.nombre.toLowerCase().includes(valor.toLowerCase()))
  }

  filtrarProducto(valor: string){
    console.log(valor);
    return this.productos.filter(ele => ele.nombre.toLowerCase().includes(valor.toLowerCase()));
  }

  calcularImporte(indice: number){
    if(this.dataSourceOC.data[indice]['cantidad'] != 0 && this.dataSourceOC.data[indice]['precio'] != 0){
      this.dataSourceOC.data[indice]['importe'] = (parseFloat(this.dataSourceOC.data[indice]['cantidad']) * parseFloat(this.dataSourceOC.data[indice]['precio']));
    }
  }

  activarInput(valor: string, input: string){
    input == 'proveedor' ? valor != '' ? this.proveedor.enable() : this.proveedor.disable() : valor != '' ? this.producto.enable() : this.producto.disable();
  }
  obtenerPermisoBotones() {
    this.api.consultaDatos('configuraciones/permisoBoton/' + this.usuarioId).subscribe({
      next: (permisos: any[]) => {
      const menu = permisos.map(permisos=> permisos.menuId);
      this.menu = menu;
      console.log(this.menu)
        console.log('Datos extraidos', permisos);
        this.permisosBotones = permisos;
        
        this.compararPermisosConBotones();
      },
      error: (error) => {
        console.error('Error al obtener permisos de botones:', error);
      }
    });
  }
  compararPermisosConBotones() {
    this.arregloElementos.forEach((elemento) => {
      
      const botonId = elemento.nativeElement.id; 
      const permisoEncontrado = this.permisosBotones.find(permiso => permiso.nombre === botonId);
      console.log(permisoEncontrado);
      if (permisoEncontrado) {
        console.log(`Permiso encontrado para el botón con id: ${botonId}`);
        this.renderer.setProperty(elemento.nativeElement, 'disabled', false); 
      } else {
        console.log(`No hay permiso para el botón con id: ${botonId}`);
        this.renderer.setStyle(elemento.nativeElement, 'display', 'none'); 
      }
    });
  }
  guardarOC(){
    const proveedorid: any = this.proveedores.findIndex(ele => ele.nombre == this.proveedor.value);
    
    if(this.solicitante.value == ''){
      swal("Error con el solicitante.", "El nombre del solicitante no puede ir en blanco.", "error");
      return;
    }

    if(proveedorid == -1){
      swal("El proveedor no fue encontrado.", "Revise el nombre o que el campo no esté en blanco.", "error");
      return;
    }
    this.api.consultaDatos('administracion/maxOC').subscribe((maxOC: Array<any>) => {
    const oc: any = (maxOC[0]['ordencompraid'] + 1);
    if(!this.sinInventario){
      for(let i = 0; i < this.dataSourceOC.data.length; i++){
        if(this.dataSourceOC.data[i]['cantidad'] <= 0 || this.dataSourceOC.data[i]['precio'] <= 0 ){  
          swal("Error con la cantidad y/o precio.", "No puede tener una cantidad o precio igual o menor a 0.", "error");
          return;
        }
        if(this.dataSourceOC.data[i]['unidadid'] == 0 ){  
          swal("Unidad de medidad no seleccionada", "Seleccione una unidad de medidad para guardar la orden de compra", "error");
          return;
        }
        if(this.dataSourceOC.data[i]['producto'] == ''){
          swal("Error con el producto.", "El producto no puede estar vacío.", "error");
          return;
        }
      }
      let importeTotal = formatNumber(this.dataSourceOC.data.reduce((acum, actual) => acum += actual.importe, 0), 'en-us', '3.1-1');
        swal({title: `¿Seguro que desea generar la Orden de Compra: "${oc}"?`, 
          text: `Se generará una OC por un total de ${importeTotal}.`, 
          icon: "warning", 
          buttons:['No', 'Si']})
          .then((response: any) => {
            if(response){
              this.dataSourceOC.data.forEach(currentItem => {
                currentItem['oc'] = oc;
                currentItem['usuarioid'] = this.usuarioId
                currentItem['proveedorid'] = this.proveedores.find(ele => ele.nombre == this.proveedor.value)?.proveedorid;
                currentItem['nombreproducto'] = currentItem['producto'];
                currentItem['producto'] = this.productos.findIndex(ele => ele.nombre == currentItem['producto'])  == -1   
                || !currentItem['inventario'] 
                  ? 0 
                : currentItem['productoid'];
                currentItem['descripcion'] = this.descripcionOC.value;
                currentItem['solicitante'] = this.solicitante.value;
                currentItem['almacenId'] = this.almacenId;
              });
              this.api.insertarDatos('administracion/ordencompra', this.dataSourceOC.data).subscribe((response: any) => {
                this.dataSourceOC.data = [];
                this.proveedor.setValue('');
                this.solicitante.setValue('');
                this.descripcionOC.setValue('');
                swal("Se generó la Orden de Compra.", "Se generó la OC correctamente", "success");
                this.obtenerCatalogos();
              })
            }
        })
    }else{
      if(this.cantidadSI.value <= 0){
        swal("Error con la cantidad", "La cantidad no puede ser menor o igual que cero", "error");
        this.cantidadSI.setValue('1');
        return;
      }
      if(this.costoSI.value <= 0){
        swal("Error con el costo", "El costo no puede ser menor o igual que cero", "error");
        this.costoSI.setValue('1');
        return;
      }
      swal({title: 'Guardar OC SIN productos', text: '¿Desea guardar la OC sin productos?\nTendrá que vincular el inventario posteriormente con esta OC'
        , icon: "warning",
      buttons: ['No', 'Si']}).then((response) => {
        if(response){
          const datos = {
            sininventario: true,
            costo: this.costoSI.value,
            cantidad: this.cantidadSI.value,
            almacenId: this.almacenId,
            oc: oc,
            proveedorid: this.proveedores.find(ele => ele.nombre == this.proveedor.value)?.proveedorid,
            solicitante: this.solicitante.value,
            descripcion: this.descripcionOC.value,
            usuarioid : this.usuarioId,
          }
          this.api.insertarDatos('administracion/ordencompra', datos).subscribe((response) =>{
            swal("Datos insertados", "Se dio de alta la orden de compra correctamente", "success");
            this.costoSI.setValue('');
            this.cantidadSI.setValue('');
            this.obtenerCatalogos();
          })
        }
      })
    }
  })
  }

}
