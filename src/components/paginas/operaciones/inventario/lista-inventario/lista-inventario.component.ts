  import { Component, OnInit, ViewChild } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CurrencyPipe } from '@angular/common';
import moment from 'moment';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { ModPreciosComponent } from './mod-precios/mod-precios.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ModExcelComponent } from './mod-excel/mod-excel.component';
import {Sort, MatSortModule} from '@angular/material/sort';
import { MatSort } from '@angular/material/sort';
import { compare } from 'bcryptjs';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SessionService } from '../../../../services/session.service';
import { QueryList } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { Renderer2 } from '@angular/core';
type AOA = any[][];

export enum ExcelInventario{
  contenedor = 0,
  marca = 1,
  modelo = 2,
  ancho = 3,
  alto = 4,
  rin = 5,
  indicecarga = 6,
  roc = 7,
  dot = 8,
  letra = 9,
  tipollanta = 10,
  costo = 11,
  precio = 12,
  pasillo = 13,
  anaquel = 14,
  nivel = 15,
  dañada = 16,
  ordencompra = 17,
}

export interface Inventario{
  inventarioid : number;
  clave: string;
  nombreproducto: string;
  prouductoid: number;
  fechaalta: string;
  dot: number;
  ubicacion: string;
  ubicacionid: number;
  preciocompra: number;
  precioventa: number;
  ordencompraid: number;
  
} 

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [CompartidosModule, CurrencyPipe, MatSortModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './lista-inventario.component.html',
  styleUrl: './lista-inventario.component.css'
})
export class ListaInventarioComponent implements OnInit{
  @ViewChildren('mostrarAlta') elementosBotones: QueryList<ElementRef>;
  arregloElementos: ElementRef[] = [];
  permisosBotones: any[] = [];
  menu: any[] = [];
  menuId = 4;
  usuarioId = 0;
  dataSource = new MatTableDataSource<any>();
  dataSourceAuxiliar: Array<any> = [];
  @ViewChild(MatPaginator)  set paginator(value: MatPaginator) { this.dataSource.paginator = value; }
  columnasDesplegadas = ['clave','fecha', 'dot', 'ubicacion', 'costo', 'venta', 'slideToggle','ordencompra'];
  resumen = new MatTableDataSource();
  resumenDesplegadas = ['nombre', 'cantidad', 'costopromedio', 'ventapromedio'];
  productoSeleccionado: any = {};
  permitirVariosDOTS = false;
  permitirPrecioVenta = false;
  precioVenta = new FormControl('');
  marcarMermas = false;
  filtroNombre = new FormControl();
  allDotsSeleccionados = false;
  dot = new FormControl();
  idsSeleccionados: number[] = [];
  @ViewChild(MatSort) sort: MatSort;
  isChecked = true;
  direcciones = ['asc', 'desc', ''];
  clicksDirecciones = 0;
  constructor(private router: Router, private api: ApiService, private dialog: MatDialog, private session: SessionService, private renderer: Renderer2){
    if (typeof window !== 'undefined') {
      this.usuarioId = parseInt(sessionStorage.getItem('usuarioid') || '0');}
  }
  ngAfterViewInit(): void {
    this.arregloElementos = this.elementosBotones.toArray();
    console.log('arrreglo elementos botones',this.arregloElementos)
    this.obtenerPermisoBotones();}
  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
    this.obtenerInventario();
    this.dataSource.paginator = this.paginator;
    this.filtroNombre.setValue('');
  }


  leerExcel(event: any){
    const archivo = event.target.files[0];
    const reader = new FileReader();
    console.log(archivo);
    reader.onload = (e: any) => {
      console.log(e);
      const datos: string = e.target.result;
      const libro = XLSX.read(datos, {type: 'binary'});
      const hojaExcel = libro.Sheets[libro.SheetNames[0]];
      const datosExcel = <AOA>(XLSX.utils.sheet_to_json(hojaExcel, {header: 1}));
      console.log(datosExcel);
      const encabezado = ['# Contenedor', 'Marca', 'Modelo', 'Ancho', 'Alto', 'Rin', 'Indice Carga', 'R o C', 'DOT', 'Letra Velocidad', 'Tipo de Llanta'
        , 'Costo', 'Precio Venta', 'Pasillo', 'Anaquel', 'Nivel', 'Dañada', 'Orden Compra'];
      let archivoIncorrecto = false;
      let motivoIncorrecto = "";
      datosExcel[0].forEach((columna: string, index) => {
        if(encabezado[index] != columna){
          archivoIncorrecto = true;
        }
      })
      if(archivoIncorrecto){
        swal("Error en la estructura del archivo", "Compruebe que la estructura del archivo sea la plantilla para subir archivos", "error");
        return;
      }
      let arregloMarcas: Array<String> = [];
      let arregloLetras: Array<String> = [];
      let arregloMedidas: Array<any> = [];
      let arregloInventario: Array<any> = [];
      let ordenesCompraSinRepetir: Array<any> = [];
      datosExcel.reduce((acumulador, elemento) => {
        if(!acumulador.some(e => JSON.stringify(e) === JSON.stringify(elemento[ExcelInventario.ordencompra]))){
            acumulador.push(elemento[ExcelInventario.ordencompra]);
        }
        return acumulador;
      }, []).forEach((element) => { ordenesCompraSinRepetir.push(element);  });
      ordenesCompraSinRepetir.shift();
      for(let i = 0; i < datosExcel.length; i++){
        //LO HAGO ASI PORQUE TENGO QUE SALTARME LE ENCABEZADO, Y NO ME DEJA DEFINIR UN ARREGLO VACÍO EN CASO DE QUE SEA INDEFINIDO
        //CHTM ANGULAR :(
          if(i > 0){
            const row = datosExcel[i];            
            if(!row[ExcelInventario.ordencompra]){
              archivoIncorrecto = true;
              motivoIncorrecto = "La orden de compra no puede estar vacía";
              break;
            }
            if(!row[ExcelInventario.roc]) {
              archivoIncorrecto = true
              motivoIncorrecto = "R o C vacíos"
              break;
            };
            if(row[ExcelInventario.roc].toUpperCase() != 'R' && row[ExcelInventario.roc].toUpperCase() != 'C' ){
              console.log(row[ExcelInventario.roc]);
              archivoIncorrecto = true;
              motivoIncorrecto = "R o C contiene letras incorrectas";
              break;
            }
            arregloMarcas.push(row[ExcelInventario.marca]);
            arregloLetras.push(row[ExcelInventario.letra] ? row[ExcelInventario.letra].toUpperCase() : '');
            arregloMedidas.push(
              {
                modelo: !row[ExcelInventario.modelo] ? '' : row[ExcelInventario.modelo],
                ancho: row[ExcelInventario.ancho],
                alto: !row[ExcelInventario.alto] ? '' : row[ExcelInventario.alto],
                rin: row[ExcelInventario.rin],
                roc: row[ExcelInventario.roc].toUpperCase(),
                indicecarga: !row[ExcelInventario.indicecarga] ? '' : row[ExcelInventario.indicecarga],
                letra: row[ExcelInventario.letra] ? row[ExcelInventario.letra].toUpperCase() : '',
                marca: row[ExcelInventario.marca],
              }
            );
            arregloInventario.push(
              {
                modelo: row[ExcelInventario.modelo],
                ancho: row[ExcelInventario.ancho],
                alto: !row[ExcelInventario.alto] ? '' : row[ExcelInventario.alto],
                rin: row[ExcelInventario.rin],
                roc: row[ExcelInventario.roc].toUpperCase(),
                letra: row[ExcelInventario.letra] ? row[ExcelInventario.letra].toUpperCase() : '',
                marca: row[ExcelInventario.marca],
                dot: row[ExcelInventario.dot],
                pasillo: row[ExcelInventario.pasillo],
                anaquel: row[ExcelInventario.anaquel],
                nivel: row[ExcelInventario.nivel],
                merma: row[ExcelInventario.dañada],
                indicecarga: !row[ExcelInventario.indicecarga] ? '' : row[ExcelInventario.indicecarga],
                costo: !row[ExcelInventario.costo] ? '0' : row[ExcelInventario.costo],
                venta: row[ExcelInventario.precio],
                ordencompraid: row[ExcelInventario.ordencompra],
              }
            );
          }
      }
      
      if(archivoIncorrecto){
        swal("Error en los datos", motivoIncorrecto, "error");
        return;
      }
      this.api.consultaDatosPost('administracion/ordenescompra', ordenesCompraSinRepetir).subscribe((ordenesInsertadas) => {
        console.log(ordenesInsertadas);
        let ordenesCompraNoInsertadas = [...ordenesCompraSinRepetir];
        let error = false;
        //USO UN AUXILIAR PORQUE VA A SER EL ARREGLO QUE VOY A USAR PARA MOSTRARLE AL USUARIO CUALES SON LAS ORDENES DE COMPRA QUE FALTAN 
        //EN BASE A, PRIMERO SACAR LAS ORDENES DE COMPRA EN EL EXCEL, LUEGO VER CUÁLES DE ESAS SÍ EXISTEN, Y FINALMENTE VOY A IR QUITANDO
        //LAS ORDENES DE COMPRA QUE SÍ EXISTEN EN LA BD

        //LAS QUE SE QUEDEN EN EL ARREGLO, SON LAS QUE SE VOY A MOSTRAR EN EL ERROR
        ordenesCompraSinRepetir.forEach((element) => {
          //CON EL "ordenesInsertadas.some" VALIDO QUE EXISTAN, SI SÍ, LAS ELIMINO DEL ARREGLO
          ordenesInsertadas.some((ele: any) => ele.ordencompraid == element) ? ordenesCompraNoInsertadas.splice(ordenesCompraNoInsertadas.findIndex(ele => ele == element), 1) : null;
        })

        if(ordenesCompraNoInsertadas.length > 0){
          let textoOC = ordenesCompraNoInsertadas.reduce((acum, actual) => acum += actual + ', ', "");
          textoOC = textoOC.substring(0, textoOC.length - 2);
          swal("Error en el excel", "Los siguientes folios no existen: " + textoOC, "error");
          return;
        }
        
        //VOY A VALIDAR QUE LAS ORDENES DE COMPRA 
        for(let j = 0; j < ordenesCompraSinRepetir.length; j++){
          const cantidadMaxima = ordenesInsertadas.find((ele: any) => ele.ordencompraid == ordenesCompraSinRepetir[j]).cantidadproductos;
          const cantidadInsertada = ordenesInsertadas.find((ele: any) => ele.ordencompraid == ordenesCompraSinRepetir[j]).cantidad;

          const cantidad = cantidadMaxima - (cantidadInsertada + datosExcel.filter(ele => ele[ExcelInventario.ordencompra] == ordenesCompraSinRepetir[j]).length);
          if(cantidad < 0){
            swal("Cantidad Excedida en la OC", "No se pueden asignar más productos de los indicados en la OC " + ordenesCompraSinRepetir[j], "error");
            error = true;
            break;
          }
          console.log(datosExcel.filter(ele => ele[ExcelInventario.ordencompra] == 3));
          const costoTotalOC = datosExcel.filter(ele => ele[ExcelInventario.ordencompra] == ordenesCompraSinRepetir[j])
            .reduce((acum, actual) => acum += actual[ExcelInventario.costo], 0);
          const costoRealOC = ordenesInsertadas.find((ele: any) => ele.ordencompraid == ordenesCompraSinRepetir[j]).importetotal;
          const costoValido = ( costoRealOC - costoTotalOC) >= 0;
          
          if(!costoValido){
            const currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
            swal("Error en el costo", `Se superó el costo de la OC ${ordenesCompraSinRepetir[j]} por ${currency.format(costoRealOC)}`, "error");
            return;
          }
        }

        if(error) return;
        const datosEnviar = {
          letras: arregloLetras,
          marcas: arregloMarcas,
          productos: arregloMedidas,
          inventario: arregloInventario,
        }
        this.api.insertarDatos('operaciones/inventario/excel', datosEnviar).subscribe((response) => {
          let letrasArreglo: Array<any> = [];
          let marcasArreglo: Array<any> = [];
          if(response.marcas.length > 0 || response.letras.length > 0 || response.productos.length > 0){
            //CON ESTA PARTE UBICO LAS LETRAS Y MARCAS DENTRO DEL EXCEL EN CASO DE QUE EXISTAN DENTRO DEL RESPONSE, YA QUE SI 
            //EXISTEN DENTRO DEL RESPONSE, QUIERE DECIR QUE NO SE HAN INSERTADO DENTRO DE LA BD
            arregloLetras.forEach((element, index) => {
              response.letras.some((ele: any) => ele.letra == element) && element != '' ? letrasArreglo.push( { letra: element, celda: 'J' + (index + 2) }) : null;
            });
            arregloMarcas.forEach((element, index) => {
              response.marcas.some((ele: any) => ele.marca == element) && element != '' ? marcasArreglo.push( { marca: element, celda: 'B' + (index + 2) }) : null;
            });

            response.inventario = arregloInventario;
            response.celdasLetras = letrasArreglo;
            response.celdasMarcas = marcasArreglo;
            const dialogRef = this.dialog.open(ModExcelComponent,
              {
                maxWidth: '100vW',
                width: '70%',
                data: response
              }
            )
            dialogRef.afterClosed().subscribe((response) => {
              this.obtenerInventario();
            })
          }else{
            swal({title: 'Insertar Inventario', text: '¿Desea insertar el inventario?', buttons: ['No', 'Si'], icon: "warning"})
              .then((response) => {
                if(response){
                  const datosInventario = {
                    inventario: arregloInventario,
                  }
                  this.api.insertarDatos('operaciones/inventario/excel/faltantes', datosInventario).subscribe((response) => {
                    swal("Datos insertados", "Se insertaron los datos correctamente", "success");
                    this.obtenerInventario();
                  })
                }
              })
          }
        });
      })
    }
    reader.readAsArrayBuffer(archivo);
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
  aplicarConfiguracionDOTS(){
    swal({title: 'Aplicar DOTS a inventario', text: 'Para que se apliquen los cambios debe guardar. ¿Desea continuar?', buttons:['No','Si'],icon: "warning"}).then((response) => {
      if(response){
        this.dataSource.data.forEach((element: any) => {
          element.dot = element.seleccionado == 1 ? this.dot.value : "";
        });
        this.dataSource.data.map((element: any) => element.seleccionado = 0);
      }
    })
  }

  guardarCambios(){
    if(this.permitirPrecioVenta && this.precioVenta.value == ''){
      swal("Error en precio de venta", "Coloque el precio de venta para continuar", "error");
      return;
    }
    swal({title: 'Guardar Cambios', text: '¿Desea Guardar los cambios del inventario?', buttons: ['No', 'Si'], icon: "warning"}).then((response) => {
      if(response){  
        this.permitirPrecioVenta ? this.dataSource.data.filter(ele => ele.seleccionado).map(ele => ele.precioventa = this.precioVenta.value) : null;
        const elementosFiltrados = this.dataSource.data.filter((ele: any) => ele.dot != '' || ele.merma || ele.precioventa > 0);
        console.log(elementosFiltrados);
        this.api.modificarDatos('operaciones/inventario', elementosFiltrados ).subscribe((response) => { 
          swal("Datos Insertados", "Se actualizó el inventario correctamente", "success");
          this.obtenerInventario();
        });
      }
    })
  }

  limitarArreglo(numeroRegistros: number){
    if(!numeroRegistros || numeroRegistros <= 0){
      this.dataSource.data.forEach((element: any) => {
        const indice = this.dataSourceAuxiliar.findIndex((ele: any) => ele.inventarioid == element.inventarioid);
        this.dataSourceAuxiliar[indice].seleccionado = element.seleccionado;
      });
      this.dataSource.data = this.dataSourceAuxiliar;
      const indice = this.dataSourceAuxiliar.findIndex (ele => ele.seleccionado == false);
      this.seleccionarDOTS(indice == -1);
      return;
    }
    this.dataSource.data = this.dataSource.data.slice(0, numeroRegistros);
    this.dataSource.filter = "";
  }

  seleccionarDOTS(seleccionarTodos: boolean){
    if(this.permitirVariosDOTS){
      this.dataSource.data.filter((ele: any) => ele.dot == '').map((ele: any) => ele.seleccionado = seleccionarTodos);
    }else{
      this.dataSource.data.map((ele: any) => ele.seleccionado = seleccionarTodos);
    }
    this.allDotsSeleccionados = this.dataSource.data.findIndex((ele: any) => ele.seleccionado != -1) == -1;
  }

  modificarLimites(){
    this.dialog.open(ModPreciosComponent);
  }

  toggleSeleccion() {
    if (this.permitirVariosDOTS || this.permitirPrecioVenta) {
        if (!this.columnasDesplegadas.includes('seleccionarDOTS')) {
            this.columnasDesplegadas.unshift('seleccionarDOTS');
        }
    } else {
        this.columnasDesplegadas = this.columnasDesplegadas.filter(col => col !== 'seleccionarDOTS');
    }
}


  toggleSeleccionado(numero: number, checked: boolean) {
    const indice = this.dataSource.data.findIndex((element: Inventario) => element.inventarioid == numero);
    if (indice !== -1) {
      this.dataSource.data[indice].merma = checked;
      if (checked) {
        if (!this.idsSeleccionados.includes(numero)) {
          this.idsSeleccionados.push(numero);
        
        }
      } else {
        this.idsSeleccionados = this.idsSeleccionados.filter(inventarioid => inventarioid !== numero);
      }
      const merma = this.idsSeleccionados;
    }
  }


  editarDOT(){
    this.dataSource.data.map((ele: any) => ele.nuevo = ele.nuevo == 1 ? 0 : 1);
  }

  validarInput(inventarioId: number){
    const indice = this.dataSource.data.findIndex((ele: any) => ele.inventarioid == inventarioId); 
    const dot = this.dataSource.data[indice].dot;
    //PRIMERO VALIDO QUE EL DOT NO SUPERE LOS 5 CARACTERES, YA QUE EL DOT ES SSAA (2 PARA LA SEMANA Y 2 PARA EL AÑO)
    if(this.dataSource.data[indice].dot.toString().length > 4){
      swal("Error en el DOT", "El DOT no puede tener más de 4 caracteres", "error");
      this.dataSource.data[indice].dot = '';
      return;
    }
    //EN CASO DE QUE SEAN LOS 4 CARACTERES, LUEGO VALIDO EL AÑO Y LAS SEMANAS, NO PUEDEN SER MAS DE 53 SEMANAS NI PUEDE SER MAYOR AL AÑO ACTUAL
    if(dot.toString().length == 4){
      const semanas = dot.toString().substring(0, 2);
      const anio = dot.toString().substring(2, 4);
      if(semanas > 53){
        swal("Error en el DOT", "El DOT no puede tener más de 53 semanas", "error");
        this.dataSource.data[indice].dot = "";
        return; 
      }
      if(anio > new Date().getFullYear().toString().substring(2,4)){
        swal("Error en el DOT", "El año marcado en el DOT no puede ser mayor al actual", "error");
        this.dataSource.data[indice].dot = "";
      }
    }
  }

  obtenerInventario(){
    this.api.consultaDatos('operaciones/inventario/0').subscribe((inventario: any) => {
      console.log(inventario);
      this.dataSource = new MatTableDataSource(inventario);
      this.dataSource.data.map((ele: any) => {
        ele.seleccionado = false;
        ele.merma = false;
      });
      this.dataSourceAuxiliar = inventario;
      this.dataSource.sort = this.sort;
      
    })
  }

  //Ordenamiento por dot Vacio
  SortData() {
    const sortData = {
      active: 'dot',
      direction: this.direcciones[this.clicksDirecciones]
    };
    this.clicksDirecciones++
    this.clicksDirecciones = this.clicksDirecciones > 2 ? 0 : this.clicksDirecciones;

    const data: Array<any> = this.dataSource.data.slice();
    if (!sortData.active || sortData.direction === '') {
      this.dataSource.data = data;
      return;
    }
  else{
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sortData.direction === 'asc';
      switch (sortData.active) {
        case 'dot':
          return this.compare(a.dot, b.dot, isAsc);
        default:
          return 0; 
      }
    });
  }}
  compare(a: number | string, b: number | string, isAsc: boolean) {
    if (a === null || a === undefined) return isAsc ? -1 : 1;
    if (b === null || b === undefined) return isAsc ? 1 : -1;

    const comparison = a < b ? -1 : a > b ? 1 : 0;
    return comparison * (isAsc ? 1 : -1);
  }
  
  agregarInventario(){
    this.router.navigate([`/operaciones/inventario/alta`]);
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
          //EL CONTADOR LO USO PARA VERIFICAR EL TOTAL DE CAMBIOS HECHOS, Y HACER QUE SI SE ELIMINA EL PRIMER FILTRO
          //TE SIGA RESPETANDO LOS SIGUIENTES
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
