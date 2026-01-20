import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { OrdenesCompra } from '../compras.interface';

@Injectable({ providedIn: 'root' })
export class VistaComprasService {
    constructor(private api: ApiService) {}

  // Carga las órdenes de compra del almacén indicado
  loadOrdenesCompra(almacenId: number): Observable<OrdenesCompra[]> {
    return this.api.consultaDatos(`administracion/ordenescompra/${almacenId}/compras`);
  }
}