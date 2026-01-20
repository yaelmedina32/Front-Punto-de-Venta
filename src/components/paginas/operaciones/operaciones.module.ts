import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

//MODULOS PARA ROUTING
import { AltainventarioComponent } from './inventario/altainventario/altainventario.component';
import { AltaProductosComponent } from './productos/altaproductos/altaproductos.component';
import { VentasComponent } from './ventas/ventas.component';
import { AltaProveedoresComponent } from './proveedores/altaproveedores/altaproveedores.component';
import { InicioComponent } from '../inicio/inicio.component';
import { ListaproductosComponent } from './productos/listaproductos/listaproductos.component';
import { ListaubicacionesComponent } from './ubicaciones/listaubicaciones/listaubicaciones.component';
import { ListaproveedoresComponent } from './proveedores/listaproveedores/listaproveedores.component';
import { ListaInventarioComponent } from './inventario/lista-inventario/lista-inventario.component';
import { CuentasXPagarComponent } from './cuentas-x-pagar/cuentas-x-pagar.component';
import { CuentasXCobrarComponent } from './cuentas-x-cobrar/cuentas-x-cobrar.component';
import { RechazosComponent } from './rechazos/rechazos.component';
import { ModVentasComponent } from './ventas/modales/mod-ventas/mod-ventas.component';
const routes: Routes = [
  { path: '', component: InicioComponent, data: { breadcrumb: 'Inicio' } },
  { path: 'historial', component: ModVentasComponent, data: { breadcrumb: 'Historial Ventas' } },
  { path: 'inventario/alta', component: AltainventarioComponent, data: { breadcrumb: 'Alta Inventario' } },
  { path: 'inventario/lista', component: ListaInventarioComponent, data: { breadcrumb: 'Lista Inventario' } },
  { path: 'productos/lista', component: ListaproductosComponent, data: { breadcrumb: 'Lista Productos' } },
  { path: 'productos/alta/:idproducto/:estatus', component: AltaProductosComponent, data: { breadcrumb: 'Alta Productos' } },
  { path: 'ubicaciones/lista', component: ListaubicacionesComponent, data: { breadcrumb: 'Lista Ubicaciones' } },
  { path: 'ventas', component: VentasComponent, data: { breadcrumb: 'Ventas' } },
  { path: 'proveedores/lista', component: ListaproveedoresComponent, data: { breadcrumb: 'Lista Proveedores' } },
  { path: 'proveedores/alta/:id/:tipo', component: AltaProveedoresComponent, data: { breadcrumb: 'Alta Proveedores' } },
  { path: 'cuentasxpagar', component: CuentasXPagarComponent, data: { breadcrumb: 'Cuentas por Pagar' } },
  { path: 'cuentasxcobrar', component: CuentasXCobrarComponent, data: { breadcrumb: 'Cuentas por Cobrar' } },
  { path: 'rechazos', component: RechazosComponent, data: { breadcrumb: 'Rechazos' } },
  { path: '**', component: InicioComponent, data: { breadcrumb: 'Inicio' } },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule
  ],
  exports: [RouterModule]
})
export class OperacionesModule { }
