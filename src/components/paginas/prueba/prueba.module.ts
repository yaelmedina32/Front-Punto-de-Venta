import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from '../inicio/inicio.component';
import { PruebaComponent } from './prueba/prueba.component';
import { SaludarComponent } from './saludar/saludar.component';

const rutas: Routes = [
  {
    path: '', component: InicioComponent
  },
  {
    path: 'compprueba', component: PruebaComponent
  },
  {
    path: 'saludar', component: SaludarComponent
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(rutas)
  ],
  exports: [RouterModule]
})
export class PruebaModule { }
