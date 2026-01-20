import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../components/paginas/full-layout/full-layout.component').then(c => c.FullLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadComponent: () => import('../components/paginas/inicio/inicio.component').then(c => c.InicioComponent)
      },
      {
        path: 'operaciones',
        loadChildren: () => import('../components/paginas/operaciones/operaciones.routes').then(m => m.OPERACIONES_ROUTES)
      },
      {
        path: 'administracion',
        loadChildren: () => import('../components/paginas/administracion/administracion.routes').then(m => m.ADMINISTRACION_ROUTES)
      },
      {
        path: 'catalogos',
        loadChildren: () => import('../components/paginas/catalogos/catalogos.routes').then(m => m.CATALOGOS_ROUTES)
      },
      {
        path: 'configuraciones',
        loadChildren: () => import('../components/paginas/configuraciones/configuraciones.routes').then(m => m.CONFIGURACIONES_ROUTES)
      },
    ]
  },
  {
    path: 'login/iniciosesion',
    loadComponent: () => import('../components/paginas/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: '/login/iniciosesion'
  }
];
