import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card'
import { FormsModule } from '@angular/forms'
import { getEspPaginatorIntl } from './paginador';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreadcrumbComponent } from '../paginas/full-layout/breadcrumb/breadcrumb.component';
import { NotificationComponent } from './notifications/notification.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule, MatOptionModule, MatSelectModule,
    MatTableModule, MatDatepickerModule, MatTabsModule, MatExpansionModule, MatMenuModule,
    MatPaginatorModule, MatProgressSpinnerModule, FormsModule, MatSlideToggleModule, MatAutocompleteModule,
    ReactiveFormsModule, MatTooltipModule, MatCheckboxModule, MatDialogModule,
    MatGridListModule,BreadcrumbComponent, NotificationComponent
  ],
  exports:[
    CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule,
    MatOptionModule, MatSelectModule, MatTableModule, MatDatepickerModule,
    MatTabsModule, MatExpansionModule, MatMenuModule, MatPaginatorModule,
    MatProgressSpinnerModule,  MatCardModule, FormsModule, MatSlideToggleModule, MatAutocompleteModule,
    ReactiveFormsModule, MatTooltipModule, MatCheckboxModule, MatDialogModule, MatGridListModule,
    NotificationComponent
  ],
  providers:[
    { provide: MatPaginatorIntl, useValue: getEspPaginatorIntl() }
  ]
})
export class CompartidosModule { }
