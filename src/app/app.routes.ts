import { Routes } from '@angular/router';
import { InicioComponent } from '../components/paginas/inicio/inicio.component';
import { FullLayoutComponent } from '../components/paginas/full-layout/full-layout.component';
import { AuthGuard } from '../components/services/auth-guard';
import { LoginComponent } from '../components/paginas/login/login.component';
export const routes: Routes = [
    {path: '', redirectTo: 'login/iniciosesion', pathMatch: 'full'},
    {
        path: '', component: FullLayoutComponent, data: { title: 'fulllayout '},
        canActivate: [AuthGuard],
        children: [
            {
                path: 'inicio', component: InicioComponent
            },
            {
                path: 'operaciones', loadChildren: () => import('../components/paginas/operaciones/operaciones.module').then(ele => ele.OperacionesModule)
            },
            {
                path: 'administracion', loadChildren: () => import('../components/paginas/administracion/administracion.module').then(ele => ele.AdministracionModule)
            },
            {
                path: 'catalogos', loadChildren: () => import('../components/paginas/catalogos/catalogos.module').then(ele => ele.CatalogosModule),
            },
            {
                path: 'configuraciones', loadChildren: () => import('../components/paginas/configuraciones/configuraciones.module').then(ele => ele.ConfiguracionesModule)
            },
            {
                path: 'pruebas', loadChildren: () => import('../components/paginas/prueba/prueba.module').then(ele => ele.PruebaModule)
            }
            // {
            //     //path: 'llantas', loadChildren: () => import('../components/paginas/inventario/operaciones.module').then(ele => ele.InventarioModule)
            // },
        ]
    },
    {
        path: 'login/iniciosesion',  component: LoginComponent, data: { title: "hola" }
    },
    {path: '**', component: LoginComponent}
];
