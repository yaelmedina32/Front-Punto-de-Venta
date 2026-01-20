import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, tap, Observable, throwError } from 'rxjs';
import  { Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private token: string;
  private api = "http://softdc.ddns.net:4300/api/"
  constructor(private http: HttpClient, @Inject(Router) public router: Router) { 
    if(typeof window !== 'undefined'){
      this.token = sessionStorage.getItem('token') || '';
      console.log(sessionStorage.getItem('token'));
    }
  }
  consultaDatos(endpoint: string):Observable<any>{
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('token', token);

    const resultado = this.http.get(this.api + endpoint, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 406){
          swal("Error", "La sesión ha caducado", "error");
          
          localStorage.clear();
          this.router.navigate(['/login/iniciosesion']);
        }
        let errorM = ""
        if(error.error instanceof HttpErrorResponse){
          errorM = `Error: ${error.error.message}`;
        } else {
          errorM = `Error code: ${error.status}, message: ${error.message}`;
        }
        return throwError(() => errorM);
      }),
      // tap(() => {
      //   this.http.post(this.api + 'regenerarToken', {headers}).subscribe({
      //     next: (token: any) => {
      //       sessionStorage.setItem('token', token || '');
      //     }
      //   })
      // })
    );
    return resultado
  }

  eliminarDatos(endpoint: string):Observable<any>{
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('token', token);

    const resultado = this.http.delete(this.api + endpoint, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 406){
          swal("Error", "La sesión ha caducado", "error");
          
          localStorage.clear();
          this.router.navigate(['/login/iniciosesion']);
        }
        let errorM = ""
        if(error.error instanceof HttpErrorResponse){
          errorM = `Error: ${error.error.message}`;
        } else {
          errorM = `Error code: ${error.status}, message: ${error.message}`;
        }
        return throwError(() => errorM);
      }),
      // tap(() => {
      //   this.http.post(this.api + 'regenerarToken', {headers}).subscribe({
      //     next: (token: any) => {
      //       sessionStorage.setItem('token', token || '');
      //     }
      //   })
      // })
    );
    return resultado
  }

  consultaDatosPost(endpoint: string, datos: any):Observable<any>{
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('token', token);
    const body = { datos: datos };
    const resultado = this.http.post(this.api + endpoint, body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        console.log("entre")
        if(error.status === 406){
          swal("Error", "La sesión ha caducado", "error");
          
          localStorage.clear();
          this.router.navigate(['/login/iniciosesion']);
        }
        let errorM = ""
        if(error.error instanceof HttpErrorResponse){
          errorM = `Error: ${error.error.message}`;
        } else {
          errorM = `Error code: ${error.status}, message: ${error.message}`;
        }
        return throwError(() => errorM);
      }),
      // tap(() => {
      //   this.http.post(this.api + 'regenerarToken', {}, {headers}).subscribe({
      //     next: (token: any) => {
      //       sessionStorage.setItem('token', token || '');
      //     }
      //   })
      // })
    );
    

    return resultado
  }

  insertarDatos(endpoint: string, datos: any):Observable<any>{
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('token', token);
    const body = { datos: datos };
    console.log(body);
    const resultado =  this.http.post(this.api + endpoint, body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 406){
          swal("Error", "La sesión ha caducado", "error");
          
          localStorage.clear();
          this.router.navigate(['/login/iniciosesion']);
        }
        let errorM = ""
        if(error.error instanceof HttpErrorResponse){
          errorM = `Error: ${error.error.message}`;
        } else {
          errorM = `Error code: ${error.status}, message: ${error.message}`;
        }
        return throwError(() => errorM);
      }),
      // tap(() => {
      //   this.http.post(this.api + 'regenerarToken', {}, {headers}).subscribe({
      //     next: (token: any) => {
      //       sessionStorage.setItem('token', token || '');
      //     }
      //   })
      // })
    );
    

    return resultado
  }

  modificarDatos(endpoint: string, datos: any):Observable<any>{
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('token', token);
    const body = { datos: datos };
    console.log(body);
    const resultado = this.http.put(this.api + endpoint, body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 406){
          swal("Error", "La sesión ha caducado", "error");
          
          localStorage.clear();
          this.router.navigate(['/login/iniciosesion']);
        }
        let errorM = ""
        if(error.error instanceof HttpErrorResponse){
          errorM = `Error: ${error.error.message}`;
        } else {
          errorM = `Error code: ${error.status}, message: ${error.message}`;
        }
        return throwError(() => errorM);
      }),   tap(() => {
        this.http.put(this.api + 'regenerarToken', {}, {headers}).subscribe({
          next: (token: any) => {
            sessionStorage.setItem('token', token || '');
          }
        })
      })
    );
    

    return resultado
  }
  EliminarDatosPut(endpoint: string, datos: any):Observable<any>{
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('token', token);
    const body = { datos: datos };
    console.log(body);
    const resultado =this.http.put(this.api + endpoint, body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 406){
          swal("Error", "La sesión ha caducado", "error");
          
          localStorage.clear();
          this.router.navigate(['/login/iniciosesion']);
        }
        let errorM = ""
        if(error.error instanceof HttpErrorResponse){
          errorM = `Error: ${error.error.message}`;
        } else {
          errorM = `Error code: ${error.status}, message: ${error.message}`;
        }
        return throwError(() => errorM);
      }),   tap(() => {
        this.http.put(this.api + 'regenerarToken', {}, {headers}).subscribe({
          next: (token: any) => {
            sessionStorage.setItem('token', token || '');
          }
        })
      })
    );
    

    return resultado
  }
 

  sesion(datos: any):Observable<any>{
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('token', token);
    const body = datos;
    return this.http.post(this.api + 'login', body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 406){
          swal("Error", "La sesión ha caducado", "error");
          
          localStorage.clear();
          this.router.navigate(['/login/iniciosesion']);
        }
        let errorM = ""
        if(error.error instanceof HttpErrorResponse){
          errorM = `Error: ${error.error.message}`;
        } else {
          errorM = `Error code: ${error.status}, message: ${error.message}`;
        }
        return throwError(() => errorM);
      })
    )
  }

}