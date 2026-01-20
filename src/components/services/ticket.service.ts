import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import jsPDF from 'jspdf';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class TicketService {
  private tickets: Ticket[] = [];

  constructor(private api: ApiService) {}
  
    async loadImageAsDataUrl(path: string): Promise<string | null> {
        try {
            const res = await fetch(path);
            const blob = await res.blob();
            return await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch {
            return null;
        }
    }

  async imprimirTicket(ventaId: number){
    this.api.consultaDatos('operaciones/imprimirTicket/' + ventaId).subscribe(async (response) => {
        console.log(response);
          // Ajusta estos accesos según tu estructura real del response
            const tipoPago = response.tipoPago;
            const datosVenta = response.datosVenta;
            const items = Array.isArray(datosVenta?.[0]) ? datosVenta[0] : datosVenta;
            const subTotal = datosVenta.reduce((acum: number, actual: any) => acum += parseFloat(actual?.importe || '0'), 0);
            const nombreCliente = datosVenta.length > 0 ? datosVenta[0].nombreCliente : 'N/A';
            const pagoVenta = response.pagoVenta || [];
            const iva = parseFloat(items?.[0]?.iva || '0');
            console.log(parseFloat(response?.descuento));
            const total = (iva > 0 ? subTotal + iva : subTotal);
    
            const doc = new jsPDF({ unit: 'mm', format: [80, 200] });
            const pageWidth = 80;
            let y = 6;
    
            // Logo
            
            const logoData = await this.loadImageAsDataUrl('/logo.jpg');
            if (logoData) {
                const imgWidth = 30, imgHeight = 30;
                doc.addImage(logoData, 'PNG', (pageWidth - imgWidth) / 2, y, imgWidth, imgHeight);
                y += imgHeight + 3;
            }
            // Encabezado
            doc.setFontSize(7);
    
            doc.text('',  pageWidth / 2, y, { align: 'center' }); y += 4;
            doc.text('',  pageWidth / 2, y, { align: 'center' }); y += 4;
    
            doc.text('RFC: PAVC-821239-8SA', pageWidth / 2, y, { align: 'center' }); y += 4;
            doc.text('Av. Mahatma Gandhi', pageWidth / 2, y, { align: 'center' }); y += 4;
    
            doc.setFont('Helvetica', 'bold');
            doc.text('Atrás de Chedraui', pageWidth / 2, y, { align: 'center' }); y += 4;
            doc.setFont('Helvetica', 'normal');
            doc.text('Col. Prados del Sur, C.P. 20280', pageWidth / 2, y, { align: 'center' }); y += 4;
    
            doc.text('LLANTAS - BALANCEO - NITRÓGENO - VULCANIZADORA', pageWidth / 2, y, { align: 'center' }); y += 4;
            doc.text('Whatsapp: 449 195 9216 - Tel: 449 971 6443', pageWidth / 2, y, { align: 'center' }); y += 4;
    
            doc.text(`Fecha de impresión: ${moment(new Date()).format('DD/MM/YYYY HH:mm:ss')}`, pageWidth / 2, y, { align: 'center' }); y += 4;
            doc.text(`Folio de Venta: ${ventaId}`, pageWidth / 2, y, { align: 'center' }); y += 4;
            doc.text(`Pago: ${tipoPago}`, pageWidth / 2, y, { align: 'center' }); y += 4;
            doc.text(`Cliente: ${nombreCliente || 'N/A'}`, pageWidth / 2, y, { align: 'center' }); y += 6;

    
            // Separador
            doc.setFontSize(5.5);
            doc.text('='.repeat(60), 5, y); y += 4;
    
            // Cabecera de tabla
            doc.setFontSize(8);
            doc.text('Cantidad   Descripción               P/U        Importe', 5, y); y += 4;
    
            // Items
            doc.setFontSize(5.5);
            items.forEach((dato: any) => {
                const cantidad = `${dato?.cantidad ?? ''}`.padEnd(8, ' ');
                const nombre = `${dato?.nombre ?? ''}`;
                const precio = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(dato?.precioVenta ?? 0));
                const importe = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(dato?.importe ?? 0));
    
                // Línea 1: cantidad + nombre
                doc.text(`  ${cantidad} \t\t ${nombre}      \n \t\t\t\t\t\t\t\t\t\t\t  ${precio}       ${importe}`, 5, y, { maxWidth: pageWidth - 10 }); y += 4;
            });
    
            y += 2;
            doc.text('='.repeat(60), 5, y); y += 5;
    
            doc.setFontSize(9);
            doc.text(`Subtotal: ${Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subTotal)}`, pageWidth - 5, y, { align: 'right' }); y += 5;
            doc.text(`IVA: ${Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(iva)}`, pageWidth - 5, y, { align: 'right' }); y += 5;
            doc.text(`Importe: ${Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}`, pageWidth - 5, y, { align: 'right' }); y += 6;

            // Pago Venta
            doc.setFontSize(9);
            doc.text('Pago Venta:', 5, y); y += 6;
            
            doc.setFontSize(5.5);
            doc.text('='.repeat(60), 5, y); y += 4;
            
            doc.setFontSize(6);
            doc.text('Forma de Pago       Monto                Fecha de Pago', 5, y); y += 4;

            doc.setFontSize(5.5);
            if(pagoVenta.length > 0){
            pagoVenta.forEach((pago: any) => {
                const formaPago = `${pago?.tipoPago ?? ''}`.padEnd(12, ' ');
                const importePago = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(pago?.monto ?? 0));
                const fechaPago = pago?.fechaPago ? pago?.fechaPago : 'N/A';
                doc.text(`  ${formaPago} \t\t ${importePago} \t\t ${fechaPago}`, 5, y, { maxWidth: pageWidth - 10 }); y += 4;
            });
            }else{
                doc.text('Sin Abonos a la Venta', 5, y, { maxWidth: pageWidth - 10 }); y += 4;
            }
            doc.text('='.repeat(60), 5, y); y += 4;
    
            // Si quieres abrir con diálogo de impresión
            // doc.autoPrint();
            // window.open(doc.output('bloburl'), '_blank');
    
            // Guardar directamente
            const documentoB64 = doc.output('datauristring');
            const base64Data = documentoB64.split(',')[1];
            const mimeType = 'application/pdf';
            const nombreArchivo = `ticket_${ventaId || 'abono'}.pdf`;
            let telefono = response.datosVenta[0]?.telefono || '';
            if(telefono && telefono.length > 0){
              telefono = `521${telefono}@c.us`;
                this.api.consultaDatosPost('operaciones/enviarDocumento', {
                    buffer: base64Data,
                    mimeType,
                    nombreArchivo,
                    chatId: telefono
                }).subscribe({
                    next: (res) => {
                        console.log('Archivo guardado', res);
                    },
                    error: (err) => {
                        console.error('Error al guardar archivo', err);
                    }
                });
            }
            doc.save(nombreArchivo);
        })
  }
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}
