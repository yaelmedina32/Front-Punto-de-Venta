import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-oc',
  templateUrl: './editar-oc.component.html',
  styleUrl: './editar-oc.component.css'
})
export class EditarOCComponent implements OnInit{
  constructor(@Inject(MAT_DIALOG_DATA) public data: any){}

  ngOnInit(): void {
    console.log(this.data);
  }

}
