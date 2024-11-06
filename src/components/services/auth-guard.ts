import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root' // or 'any' or specific module
})
export class AuthGuard {
  constructor(private router: Router) { }

  canActivate(){
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('usuarioid')){
        return true;
      }
    }
    //this.router.navigate(['/login/iniciosesion']);
    return false;
  }
}