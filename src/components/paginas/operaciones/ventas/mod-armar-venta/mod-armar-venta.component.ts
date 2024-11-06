import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../services/api.service';
import { Cliente } from '../../../administracion/mod-listado/mod-listado.component';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ModClientesComponent } from '../../../administracion/clientes/clientes.component';

@Component({
  selector: 'app-mod-armar-venta',
  standalone: true,
  imports: [CompartidosModule],
  templateUrl: './mod-armar-venta.component.html',
  styleUrl: './mod-armar-venta.component.css'
})
export class ModArmarVentaComponent implements OnInit{
  totalVenta = 0;
  clientesFiltrados: Observable<any>;
  clientes: Array<Cliente> = [];
  cliente = new FormControl();
  dataSource = new MatTableDataSource<any>();
  dataSourceAuxiliar: Array<any> = [];
  servicios: Array<any> = [];
  columnasDesplegadas = ['nombre', 'marca', 'modelo', 'dot', 'precioventa', 'cantidad', "descuento", "acciones"];
  clienteId = 0;
  usuarioId = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService, private dialogRef : MatDialogRef<any>, private dialog: MatDialog){
    this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');
  }
  
  ngOnInit(): void {
    console.log(this.data);
    this.cargarServicios();
    this.data.map((ele: any) => ele.productoid = 0);
    this.totalVenta = this.data.reduce((acum: number, actual: any) => acum += (parseFloat(actual.precioventa) * parseFloat(actual.cantidad)), 0);
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSourceAuxiliar = this.dataSource.data;
    this.cargarClientes();
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

  seleccionarCliente(){
    this.clienteId = this.clientes.find(ele => ele.nombre == this.cliente.value)?.clienteId || 0;
  }

  validarInput(indice: number, valor: number){
    const productoid = this.dataSource.data[indice].productoid;
    if(valor <= 0){
      swal("Error en la cantidad", "La cantidad no puede ser menor que 0", "error");
      this.dataSource.data[indice].cantidad = 1;
      this.dataSource.data[indice].precioventa = this.servicios.find(ele => ele.productoid == productoid).precio;
      return;
    }
    this.totalVenta = this.dataSource.data.reduce((acum, actual) => acum += (parseFloat(actual.precioventa) * parseFloat(actual.cantidad)), 0);
  }

  seleccionarServicio(indice: number){
    this.dataSource.data[indice].productoid = this.servicios.find(ele => ele.nombre == this.dataSource.data[indice].nombreproducto).productoid;
    this.dataSource.data[indice].precioventa = this.servicios.find(ele => ele.nombre == this.dataSource.data[indice].nombreproducto).precio;
    this.totalVenta = this.dataSource.data.reduce((acum, actual) => acum += (parseFloat(actual.precioventa) * parseFloat(actual.cantidad)), 0);
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
        precioventa: 0,
        ubicacion: '',
        ubicacionid: 0,
      }
    )
    this.dataSource.filter = "";
  }

  guardarVenta(){
    const currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
    swal({text: '¿Seguro que desea guardar la venta por ' + currency.format(this.totalVenta) + '?', title: 'Guardar Venta', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){
        const datos = {
          clienteid: this.clienteId,
          usuarioid: this.usuarioId,
          monto: this.totalVenta,
          ventas: this.dataSource.data.filter(ele => ele.productoid || ele.inventarioid),
          folioventa: this.data[0].folioventa
        }
        this.api.insertarDatos('operaciones/vender', datos).subscribe((response) => {
          swal("Venta Realizada Correctamente", "Se concretó la venta correctamente", "success");
          this.dialogRef.close();
        })
      }
    })
  }

  cargarClientes(){
    this.api.consultaDatos('administracion/clientes').subscribe((clientes: Array<Cliente>) => {
      this.clientes = clientes;
      this.clientesFiltrados = this.cliente.valueChanges.pipe(
        startWith(''),
        map(valor => this.filtrarClientes(valor))
      )
    })
  }

  cargarServicios(){
    this.api.consultaDatos('operaciones/productos/servicios').subscribe((servicios: Array<any>) => {
      this.servicios = servicios;
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
    return this.clientes.filter(ele => ele.nombre.toLowerCase().includes(valor.toLowerCase()))
  }
}
