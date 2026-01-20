import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../components/paginas/full-layout/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, BreadcrumbComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
}
