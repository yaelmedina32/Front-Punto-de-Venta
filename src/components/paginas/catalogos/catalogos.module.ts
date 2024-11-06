import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MarcasComponent } from './marcas/marcas.component';
import { InicioComponent } from '../inicio/inicio.component';

const rutas : Routes = [
  { path: '', component: InicioComponent },
  { path: 'marcas', component: MarcasComponent },
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(rutas),
  ]
})
export class CatalogosModule { }
