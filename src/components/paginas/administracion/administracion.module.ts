import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from '../inicio/inicio.component';
import { ComprasComponent } from './compras/compras.component';
import { VistaComprasComponent } from './vistacompras/vistacompras.component';
import { VistaOC } from './compras/vista-oc/vista-oc';
import { EditarOCComponent } from './modales/editar-oc/editar-oc.component';
import { TurnosComponent } from './turnos/turnos.component';
const routes: Routes = [
  { path: '', component: InicioComponent, data: { breadcrumb: 'Inicio' } },
  { path: 'compras', component: ComprasComponent, data: { breadcrumb: 'Compras' } },
  { path: 'compras/vista/:oc', component: VistaComprasComponent, data: { breadcrumb: 'Vista Compras' } },
  { path: 'compras/vista-oc/:id', component: VistaOC, data: { breadcrumb: 'Vista OC' } },
  { path: 'turnos', component: TurnosComponent, data: { breadcrumb: 'Turnos' } },
]

@NgModule({
  declarations: [
    EditarOCComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AdministracionModule { }
