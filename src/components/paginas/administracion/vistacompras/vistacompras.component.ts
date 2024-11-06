import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CompartidosModule } from '../../../modulos/compartidos.module';
import { ActivatedRoute, withDebugTracing } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { DatosProveedores } from '../../operaciones/proveedores/listaproveedores/listaproveedores.interface';
import { OrdenesCompra } from '../compras/compras.interface';
import jsPDF from 'jspdf';
import autotable from 'jspdf-autotable';
import { formatCurrency } from '@angular/common';
import { QrCodeModule } from 'ng-qrcode'
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-vistacompras',
  standalone: true,
  imports: [CompartidosModule, QrCodeModule],
  templateUrl: './vistacompras.component.html',
  styleUrl: './vistacompras.component.css'
})
export class VistaComprasComponent implements OnInit, AfterViewInit{
  private ruta: any;
  idOC: number = 0;
  proveedor: Array<DatosProveedores> = [];
  ordencompra: Array<OrdenesCompra> = [];
  datosOC: Array<any> = [];
  columnasDesplegadas = ['consecutivo', 'producto', 'cantidad', 'unidad', 'preciounitario', 'importe']
  code: string = '';
  @ViewChild('qrCode') codigoQR: ElementRef;
  constructor(private route: ActivatedRoute, private api: ApiService){}
  ngOnInit(): void {
    this.ruta = this.route.params.subscribe((parametros: any) => {
      this.idOC = parametros['oc'];
      this.obtenerOC();
      console.log(this.idOC);
    }) 
  }

  ngAfterViewInit(): void {
    if(this.codigoQR){
      console.log(this.codigoQR);
    }
  }

  imprimirPDF(){

    const proveedor = this.proveedor[0];
    
    let tablaProveedor: any[] = [
      ['Razón Social', proveedor.nombre,'  Razón Social', proveedor.nombre,],
      ['RFC', proveedor.rfc,'  RFC', proveedor.rfc],
      ['País', proveedor.pais, '  País', proveedor.pais],
      ['Estado', proveedor.estado, '  Estado', proveedor.estado],
      ['Municipio', proveedor.municipio, '  Municipio', proveedor.municipio],
      ['Ciudad', proveedor.ciudad, '  Ciudad', proveedor.ciudad],
      ['Colonia', proveedor.colonia, '  Colonia', proveedor.colonia],
      ['Calle', proveedor.calle, '  Calle', proveedor.calle],
      ['CP', proveedor.cp, '  CP', proveedor.cp],
      ['Correo', proveedor.email, '  Correo', proveedor.email],
      ['No. Exterior', proveedor.noexterior, '  No. Exterior', proveedor.noexterior],
      ['No. Interior', proveedor.nointerior, '  No. Interior', proveedor.nointerior],
      ['Teléfono', proveedor.telefono, '  Teléfono', proveedor.telefono],
    ];
    html2canvas(this.codigoQR.nativeElement).then((canvas) => {
      const doc = new jsPDF();
      doc.rect(10,8,185,16,'F');
      doc.setFontSize(26);
      doc.text('Resúmen de la Orden de Compra.', 37, 22);
      doc.setFontSize(20);
      doc.text('No. OC: ' + this.idOC, 10, 39);

      doc.setFillColor(51, 53, 54);
      doc.rect(10,46,185,15,'F');

      doc.setLineWidth(1);
      doc.setDrawColor(0,0,0);
      doc.rect(10, 46, 93, 15);

      doc.setDrawColor(0,0,0);
      doc.rect(103, 46, 92, 15);
    
      doc.setFontSize(16);
      doc.setTextColor(255,255,255);
      doc.text('Datos del Cliente', 31, 55);

      
      doc.setTextColor(255,255,255);
      doc.text('Datos del Proveedor', 124, 55);


      autotable(doc, {
        startY: 61.5,
        margin: { left: 10},
        body: tablaProveedor,
        headStyles:{
          fillColor: [168, 169, 170],
          halign: 'center',
        }
      })


      let datos: any = [];
      this.datosOC.forEach((row: any) => {
        let aux: any = [];
        Object.keys(row).forEach((key: any) => {
          aux.push(row[key]);
        })
        datos.push(aux);
      })

      doc.setLineWidth(1);
      doc.line(103, 46, 103, 160);

      
      doc.line(10, 46, 10, 160);

      
      doc.line(195, 46, 195, 160);

      
      doc.line(10, 160, 195, 160);

      autotable(doc, {
        startY: 165,
        margin:{left:10},
        head: [['Consecutivo', 'Producto', 'Cantidad', 'Unidad', 'Precio Unitario', 'Importe']],
        body: datos,
      });
      const valorY = (this.datosOC.length * 10) + 175
      console.log(valorY);
      doc.setTextColor(0,0,0);
      doc.setFontSize(12);
      doc.text('Importe: ' + formatCurrency(this.ordencompra[0].importetotal, 'en-US', '$', 'USD'), 160, valorY);
      
      doc.text('IVA: ' + formatCurrency(this.ordencompra[0].importetotal * 0.16, 'en-US', '$', 'USD'), 160, (valorY + 7));
      
      const imaData = canvas.toDataURL('image/png');
      doc.addImage(imaData, 'PNG',180,25,18,18);
      doc.save('tabla.pdf');

    })
  }
  obtenerOC(){
    this.api.consultaDatos('administracion/ordencompra/' + this.idOC).subscribe((ordencompra: Array<OrdenesCompra>) => {
      this.ordencompra = ordencompra;
      console.log('hola' , this.ordencompra);
      this.api.consultaDatos('operaciones/proveedor/' + this.ordencompra[0].proveedorid).subscribe((proveedor: Array<DatosProveedores>) => {
        this.proveedor = proveedor;
        this.api.consultaDatos('administracion/productos/ordencompra/' + this.idOC).subscribe((datosOC: Array<any>) => {
          this.datosOC = datosOC;
          console.log('holaaaaaaaaaaa' , this.datosOC);
          this.generarCodigoQR();
        })
      })
    })
  }
  generarCodigoQR() {
    // este es para transformar los datos (datosOC)osea los de la tabla en un formato para el QR
    this.code = this.datosOC.map(item => {
        return `${item.cantidad}x ${item.producto} - $${item.precioUnitario}`;
    }).join('\n');
}
}
