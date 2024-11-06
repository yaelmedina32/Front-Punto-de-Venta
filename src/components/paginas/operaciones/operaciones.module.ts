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
import { UbicacionproductoComponent } from './productos/ubicacionproducto/ubicacionproducto.component';
import { ListaInventarioComponent } from './inventario/lista-inventario/lista-inventario.component';
import { CuentasXPagarComponent } from './cuentas-x-pagar/cuentas-x-pagar.component';
import { CuentasXCobrarComponent } from './cuentas-x-cobrar/cuentas-x-cobrar.component';

const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'inventario/alta', component: AltainventarioComponent },
  { path: 'inventario/lista', component: ListaInventarioComponent },
  { path: 'productos/lista', component: ListaproductosComponent },
  { path: 'productos/alta/:idproducto/:estatus', component: AltaProductosComponent },
  { path: 'productos/ubicacion/:idproducto', component: UbicacionproductoComponent },
  { path: 'ubicaciones/lista', component: ListaubicacionesComponent },
  { path: 'ventas', component: VentasComponent },
  { path: 'proveedores/lista', component: ListaproveedoresComponent },
  { path: 'proveedores/alta/:id/:tipo', component: AltaProveedoresComponent },
  { path: 'cuentasxpagar', component: CuentasXPagarComponent },
  { path: 'cuentasxcobrar', component: CuentasXCobrarComponent },
  { path: '**', component: InicioComponent },
]

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
