import { Component } from '@angular/core';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { CommonModule, AsyncPipe } from '@angular/common'; // ✅ Importa CommonModule para *ngIf y *ngFor
import { RouterModule } from '@angular/router'; // ✅ Importa RouterModule para routerLink

@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav>
      <ol class="breadcrumb">
        <li *ngFor="let breadcrumb of breadcrumbs$ | async; let last = last" class="breadcrumb-item">
          <a *ngIf="!last; else lastBreadcrumb" [routerLink]="breadcrumb.url">{{ breadcrumb.label }}</a>
          <ng-template #lastBreadcrumb>{{ breadcrumb.label }}</ng-template>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      padding: 10px;
      background: #f8f9fa;
    }
    .breadcrumb-item a {
      text-decoration: none;
      color: #007bff;
    }
  `],
  imports: [RouterModule, CommonModule],  
})
export class BreadcrumbComponent {
  breadcrumbs$;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.getBreadcrumbs();
  }
}
