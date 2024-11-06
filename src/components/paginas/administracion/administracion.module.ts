import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from '../inicio/inicio.component';
import { ComprasComponent } from './compras/compras.component';
import { VistaComprasComponent } from './vistacompras/vistacompras.component';
import { EditarOCComponent } from './modales/editar-oc/editar-oc.component';
import { TurnosComponent } from './turnos/turnos.component';
const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'compras', component: ComprasComponent },
  { path: 'compras/vista/:oc', component: VistaComprasComponent },
  { path: 'turnos', component: TurnosComponent },
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
