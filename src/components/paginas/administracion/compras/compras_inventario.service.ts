// services/compras.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { DatosOrdenCompra } from '../../operaciones/inventario/altainventario/altainventario.component';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprasInventarioService {
  constructor(private api: ApiService) { }
  ocSeleccionada: Array<DatosOrdenCompra> = [];

  async obtenerInventario(ordenCompraId: number){
    const response$ = this.api.consultaDatos('administracion/detalle/ordencompra/' + ordenCompraId);
    const resultado = await lastValueFrom(response$);
    return resultado;
  }
}