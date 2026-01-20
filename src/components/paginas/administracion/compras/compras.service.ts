// services/compras.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {
  private ocActualizadaSource = new BehaviorSubject<boolean>(false);
  ocActualizada$ = this.ocActualizadaSource.asObservable();

  notificarOCActualizada() {
    console.log("Notificada actualización de OC");
    this.ocActualizadaSource.next(true);
  }

  resetNotificacion() {
    this.ocActualizadaSource.next(false);
  }
}