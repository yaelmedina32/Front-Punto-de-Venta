import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenerarOcComponent } from './generar-oc/generar-oc';
import { VistaCompras } from "./vista-compras/vista-compras";
import { OrdenesCompra } from './compras.interface';
import { ComprasService } from './compras.service';
import { Subscription } from 'rxjs';

interface OrdenesCompraConProductos extends OrdenesCompra{
  productos: Array<any>;
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, GenerarOcComponent, VistaCompras],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent implements OnInit, OnDestroy{
  generarOCOpened = signal<boolean>(false);
  ordenCompraSeleccionada = signal<OrdenesCompraConProductos>({} as OrdenesCompraConProductos);
  comprasService = inject(ComprasService);
  subscription: Subscription = new Subscription();
  constructor() {}

  ngOnInit(): void {
    this.subscription.add(
      this.comprasService.ocActualizada$.subscribe(
        (actualizada) => { if(actualizada) this.generarOCOpened.set(false); }
      )
    )  
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setOrdenCompraSeleccionada(ordenCompra: OrdenesCompraConProductos){
    this.ordenCompraSeleccionada.set(ordenCompra);
    this.generarOCOpened.set(true);
  }

}
