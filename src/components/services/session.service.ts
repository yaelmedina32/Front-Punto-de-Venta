import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class SessionService {
    constructor(private router: Router) { }
    validarSesion(actual: number){
        if (typeof window !== 'undefined') {
            const accesos = sessionStorage.getItem('accesos');
            !accesos?.split(',').some(ele => parseInt(ele) == actual) ? this.router.navigate(['/inicio']) :  null;
        
        }
 
    }
    obtenermenu(): number[] {
        const accesos = (sessionStorage.getItem('accesos') || '').split(',').map(id => parseInt(id));
        return accesos;
    }
}