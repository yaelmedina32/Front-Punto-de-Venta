import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../services/api.service';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableDataSource } from '@angular/material/table';
import { ModClientesComponent } from '../../../administracion/clientes/clientes.component';
import { ModAutorizacionComponent } from '../modales/mod-autorizacion/mod-autorizacion.component';

export class HistorialVenta{
  folioventa: number;
}

@Component({
    selector: 'app-mod-armar-venta',
    imports: [CompartidosModule],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './mod-armar-venta.component.html',
    styleUrl: './mod-armar-venta.component.css'
})
export class ModArmarVentaComponent implements OnInit{
  totalVenta = 0;
  clientesFiltrados: Observable<string[]>;
  numerosClientesFiltrados: Observable<string[]>;
  clientesNumero: Array<{ nombreCliente: string; numeroCliente: string }> = [];
  clientes: Array<string> = [];
  numeroClientes: Array<string> = [];
  cliente = new FormControl();
  numeroCliente = new FormControl();
  dataSource = new MatTableDataSource<any>();
  dataSourceAuxiliar: Array<any> = [];
  servicios: Array<any> = [];
  columnasDesplegadas = ['nombre', 'marca', 'modelo', 'dot', 'precioventa', 'cantidad', "descuento", "acciones"];
  clienteId = 0;
  usuarioId = 0;
  dataHistorial : Array<any> = [];
  almacenId = 0;
  sucursalId = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialogRef : MatDialogRef<any>, private dialog: MatDialog){
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
  }

  eliminarProducto(indice: number){
    this.dataSource.data.splice(indice, 1);
    this.dataSourceAuxiliar = this.dataSource.data;
    this.totalVenta = this.dataSource.data.reduce((acum, actual) => acum += (parseFloat(actual.precioventa) * parseFloat(actual.cantidad)), 0);
    this.dataSource.filter = ""
  }

  turnoId = 0;
  turnoAbierto: boolean = false;
  comprobarTurno(){
    this.api.consultaDatos(`administracion/turno/${this.usuarioId}/${this.sucursalId}`).subscribe((response: Array<any> )=> {
      console.log(response);
      this.turnoAbierto = response.length > 0;
      if(!this.turnoAbierto){
        swal("Turno sin abrir", "No hay un turno abierto", "error");
        return;
      }
      this.turnoId = response[0].turnoid
    })
  }

  habilitarDescuento(inventarioid: number){
    const response = this.dialog.open(ModAutorizacionComponent, 
      {
        data: "cancelar",
        maxWidth: '60vW',
      }
    )
    response.afterClosed().subscribe((aprobado) => {
      if(aprobado){
        const indice = this.dataSource.data.findIndex(ele => ele.inventarioid == inventarioid);
        this.dataSource.data[indice].descuentoAutorizado = true;
      }
    })
  }
  
  ngOnInit(): void {
    console.log(this.data);
    if(typeof(window) !== 'undefined'){  
      this.almacenId = parseInt(localStorage.getItem('almacenid') || '0');
      
      this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
      this.almacenId = parseInt(localStorage.getItem('almacenid') || '0');
    }
    
    this.sucursalId = parseInt(localStorage.getItem('sucursalId') || '0');
    this.data.map((ele: any) => ele.productoid = 0);
    this.cargarServicios();
    this.totalVenta = this.data.reduce((acum: number, actual: any) => acum += (parseFloat(actual.precioventa) * parseFloat(actual.cantidad))-parseFloat(actual.descuento), 0);
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSourceAuxiliar = this.dataSource.data;
    console.log(this.data);
    this.cliente.setValue(this.data.cliente);
    this.numeroCliente.setValue(this.data.numero);
    this.cargarClientes();
  }

  obtenerInventario(){
    this.api.consultaDatos('operaciones/inventario/1/' + this.almacenId).subscribe((inventario) => {
      this.dataSource = new MatTableDataSource(inventario);
      this.dataSource.data.map(ele => ele.seleccionado = false);
      this.dataSourceAuxiliar = this.dataSource.data;
    })
  }

  agregarCliente(){
    const dialog = this.dialog.open(ModClientesComponent,
      {
        maxWidth: '70vW',
        width: '100%',
      }
    )
    dialog.afterClosed().subscribe((response) => {
      this.cargarClientes();
    })
  }

  seleccionarCliente(event: MatAutocompleteSelectedEvent){
    const nombre = event.option.value as string;
    this.cliente.setValue(nombre);
    const match = this.clientesNumero.find(ele => ele.nombreCliente == nombre);
    this.numeroCliente.setValue(match?.numeroCliente || '');
  }

  seleccionarNumeroCliente(event: MatAutocompleteSelectedEvent){
    const numero = event.option.value as string;
    this.numeroCliente.setValue(numero);
    const match = this.clientesNumero.find(ele => ele.numeroCliente == numero);
    this.cliente.setValue(match?.nombreCliente || '');
  }

  validarInput(indice: number, valor: number){
    const productoid = this.dataSource.data[indice].productoid;
    if(valor <= 0){
      swal("Error en la cantidad", "La cantidad no puede ser menor que 0", "error");
      this.dataSource.data[indice].cantidad = 1;
      this.dataSource.data[indice].precioventa = this.servicios.find(ele => ele.productoid == productoid).precio;
      return;
    }
    this.totalVenta = this.dataSource.data.reduce((acum, actual) => acum += (parseFloat(actual.total) * parseFloat(actual.cantidad)), 0);
  }

  seleccionarServicio(indice: number){
    this.dataSource.data[indice].productoid = this.servicios.find(ele => ele.nombre == this.dataSource.data[indice].nombreproducto).productoid;
    this.dataSource.data[indice].precioventa = this.servicios.find(ele => ele.nombre == this.dataSource.data[indice].nombreproducto).precio;
    this.totalVenta = this.dataSource.data.reduce((acum, actual) => acum += (parseFloat(actual.total) * parseFloat(actual.cantidad)), 0);
  }

  agregarServicio(){
    this.dataSource.data.push(
      {
        inventarioid: 0,
        productoid: 0,
        cantidad: 1,
        modelo: '',
        marca: '',
        nombreproducto: '',
        dot: '',
        descuento: 0,
        precioventa: 0,
        ubicacion: '',
        ubicacionid: 0,
      }
    )
    this.dataSource.filter = "";
  }

  guardarVenta(){
    this.totalVenta = this.dataSource.data.reduce((acum, actual) => acum += ((parseFloat(actual.precioventa) - parseFloat(actual.descuento)) * parseFloat(actual.cantidad)), 0);
    if(this.totalVenta == 0){
      swal({title:"Venta sin registros", text:"Registre al menos una llana y/o servicio", timer: 3000, icon: "warning"});
      return;
    }
    const datos = {
      nombreCliente: this.cliente.value,
      numeroCliente: this.numeroCliente.value,
      usuarioid: this.usuarioId,
      monto: this.totalVenta,
      ventas: this.dataSource.data.filter(ele => ele.productoid || ele.inventarioid),
      folioventa: this.data[0].folioventa,
      turnoid: this.turnoId,
      modo: 'edicionVenta'
    }
    
    this.api.insertarDatos('operaciones/vender', datos).subscribe({ next: async(response) => {  
    try {
      const data = await this.obtenerHistorial();
      swal({title: `Folio de venta: ${this.data[0] && this.data[0].folioventa ? this.data[0].folioventa : this.dataHistorial} `, text: `Se concretó la venta correctamente`, icon: "success", timer: 3000});
      this.dialogRef.close();
  } catch(error){
    console.log(`error al obtener los folios`, error)

  }},error:(err) => {
    swal("Venta No Realizada", `No se concretó la venta `, "warning");
  }
})
  }

  async obtenerHistorial(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.api.consultaDatos('operaciones/historial/ventas').subscribe({
        next: (historial: Array<HistorialVenta>) => {
          this.dataHistorial = historial.map(historial  => historial.folioventa);
          this.dataHistorial =this.dataHistorial[0];
          resolve(String(this.dataHistorial));
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  cargarClientes(){
    this.api.consultaDatos('administracion/clientes').subscribe((clientes: Array<any>) => {
      this.clientesNumero = clientes.map((c: any) => ({ nombreCliente: (c.nombreCliente ?? c.nombre), numeroCliente: String(c.numeroCliente ?? c.telefono ?? '') }));
      this.clientes = this.clientesNumero.map(ele => ele.nombreCliente);
      this.numeroClientes = this.clientesNumero.map(ele => ele.numeroCliente);
      this.clientesFiltrados = this.cliente.valueChanges.pipe(
        startWith(''),
        map(valor => this.filtrarClientes(valor))
      );
      this.numerosClientesFiltrados = this.numeroCliente.valueChanges.pipe(
        startWith(''),
        map(valor => this.filtrarNumerosClientes(valor))
      );
    })
  }

  cargarServicios(){
    this.api.consultaDatos('operaciones/productos/servicios').subscribe((servicios: Array<any>) => {
      this.servicios = servicios;
      this.data.map((ele: any) => ele.productoid = this.servicios.some(element => element.nombre == ele.nombreproducto) 
        ? this.servicios.find(element => element.nombre == ele.nombreproducto).productoid : 0);
    })
  }

  bufferCambios: any[] = [];

  filtrarDatos(texto: string, objeto: string){
    //PRIMERO VEO SI ESE OBJETO YA ESTÁ FILTRADO, SI NO, ENTONCES LO PONGO EN EL BUFFER DE FILSTROS
    const indiceCambios = this.bufferCambios.findIndex(ele => (ele['objeto'] == objeto));
    if(indiceCambios == -1){
        this.bufferCambios.push({ valor:  texto , objeto: objeto });
    }else{
        //SI YA ESTABA, ENTONCES SOLO LE AGREGO EL NUEVO VALOR
        this.bufferCambios[indiceCambios]['valor'] = texto;
    }
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

  filtrarClientes(valor: string){
    return this.clientes.filter(ele => ele.toLowerCase().includes((valor || '').toLowerCase()))
  }

  filtrarNumerosClientes(valor: string){
    return this.numeroClientes.filter(ele => ele.toLowerCase().includes((valor || '').toLowerCase()))
  }
}
