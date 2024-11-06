import { Component, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { SessionService } from '../../../../services/session.service';
export class Proveedor{
  proveedorid: string;
  nombre: string;
  telefono: string;
  rfc: string;
  calle: string;
  nointerior: string;
  noexterior: string;
  colonia: string;
  ciudad: string;
  municipio: string;
  estado: string;
  pais: string;
  email: string;
  cp: string;
}

@Component({
  selector: 'app-listaproveedores',
  standalone: true,
  imports: [CompartidosModule, RouterLink],
  templateUrl: './listaproveedores.component.html',
  styleUrl: './listaproveedores.component.css'
})
export class ListaproveedoresComponent implements OnInit {
  menuId=5;
  dataSource = new MatTableDataSource<Proveedor>();
  columnasDesplegadas = ['clave', 'nombre', 'estado', 'numero', 'acciones'];

  constructor(private api: ApiService, private session: SessionService){}
  
  ngOnInit(): void {
    this.session.validarSesion(this.menuId);
    this.cargarProveedores();
  }

  cargarProveedores(){
    this.api.consultaDatos('operaciones/proveedores').subscribe((proveedores: Array<Proveedor>) => {
      this.dataSource = new MatTableDataSource<Proveedor>(proveedores);
    })
  }

  eliminarProveedor(proveedorid: number, nombre: string){

  }
}
