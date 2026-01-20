import { Routes } from '@angular/router';
import { InicioComponent } from '../inicio/inicio.component';
import { MarcasComponent } from './marcas/marcas.component';

export const CATALOGOS_ROUTES : Routes = [
  { path: '', component: InicioComponent },
  { path: 'marcas', component: MarcasComponent },
]