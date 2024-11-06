import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from '../inicio/inicio.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { FormasPagoComponent } from './formas-pago/formas-pago.component';

export const routes: Routes = [
  {
    path: '', component: InicioComponent
  },
  {
    path: 'usuarios', component: UsuariosComponent
  },
  {
    path: 'formaspago', component: FormasPagoComponent
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
})
export class ConfiguracionesModule { }
