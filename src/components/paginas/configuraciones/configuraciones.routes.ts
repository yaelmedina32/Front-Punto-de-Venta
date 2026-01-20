import { Routes } from '@angular/router';
import { InicioComponent } from '../inicio/inicio.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { FormasPagoComponent } from './formas-pago/formas-pago.component';

export const CONFIGURACIONES_ROUTES: Routes = [
  { path: '', component: InicioComponent, data: { breadcrumb: 'Inicio' } },
  { path: 'usuarios', component: UsuariosComponent, data: { breadcrumb: 'Usuarios' } },
  { path: 'formaspago', component: FormasPagoComponent, data: { breadcrumb: 'Formas de Pago' } }
];