import { Component, Inject, OnInit } from '@angular/core';
import { CompartidosModule } from '../../../../modulos/compartidos.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../../../services/api.service';
import moment from 'moment';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-mod-pagos',
    imports: [CompartidosModule],
    templateUrl: './mod-pagos.component.html',
    styleUrl: './mod-pagos.component.css'
})
export class ModPagosComponent implements OnInit{
  columnasDesplegadas = ['foliopago', 'fechapago', 'monto', 'ordencompraid'];
  dataSource = new MatTableDataSource<any>();
  total = 0.0;
  pendiente = 0.0;
  isloading:boolean=false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api:ApiService,  private dialog: MatDialogRef<any>){}

  ngOnInit(): void { 
    this.cargarPagos()
    this.cargarOC()
  }

  validarInput(pagoid: number, cantidad: number){
    const indice = this.dataSource.data.findIndex(ele => ele.pagoid == pagoid);
    if(cantidad < 0){
      swal("Error con la cantidad del pago", "El pago no puede ser menor que 0", "error");
      this.dataSource.data[indice].monto = 0;
      return;
    }
  }

  guardarAbonos(){
    const cuentaSaldada = this.dataSource.data.reduce((acum, actual) => acum += parseFloat(actual.monto), 0) >= this.pendiente;
    console.log(cuentaSaldada, this.dataSource.data.reduce((acum, actual) => acum += parseFloat(actual.monto), 0), this.pendiente)
    swal({title: `${this.dataSource.data.reduce((acum, actual) => acum += parseFloat(actual.monto), 0) >= this.total ? 'Saldar Cuenta' : 'Guardar Abonos'}`,
     text: '¿Seguro que desea guardar los abonos? \nSe actualizará el pendiente de la orden de compra', buttons: ['No', 'Si'], icon: "warning"})
      .then((response )=> {
        this.isloading = true;
        if(response){
          this.dataSource.data.map((element) => {
            element.saldada = cuentaSaldada
          });
          this.api.insertarDatos('administracion/abonos', this.dataSource.data).subscribe((response) => {
            this.isloading = false;
            this.cargarPagos();
            this.cargarOC();
            this.dialog.close();
          })
        }
    })
  }

  cargarOC(){
    this.api.consultaDatos('administracion/ordencompra/' + this.data.ordencompraid).subscribe((ordencompra) => {    
      this.total = ordencompra[0].importetotal;
      this.pendiente = parseFloat(ordencompra[0].pendiente || 0.00);
    })
  }

  agregarAbono(){
    this.api.consultaDatos('administracion/foliomax/' + this.data.ordencompraid).subscribe((maxfolio) => {
      this.dataSource.data.push(
        {
          pagoid: 0,
          fechapago: moment(new Date()).format('DD/MM/yyyy'),
          monto: 0,
          ordencompraid: this.data.ordencompraid,
          nuevo: 1
        }
      )
      this.dataSource.filter = "";
    })
  }

  cargarPagos(){
    this.api.consultaDatos('administracion/pagos/' + this.data.ordencompraid).subscribe((pagos: Array<any>) => {
      this.dataSource = new MatTableDataSource<any>(pagos);
    })
  }
}
