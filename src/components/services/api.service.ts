import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import * as dotenv from 'dotenv';
dotenv.configure({path: 'src/.env'});

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private api = process.env.api;
  constructor(private http: HttpClient) { }
  consultaDatos(endpoint: string):Observable<any>{
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    return this.http.get(this.api + endpoint, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
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

  consultaDatosPost(endpoint: string, datos: any):Observable<any>{
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json');
    const body = { datos: datos };
    return this.http.post(this.api + endpoint, body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
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

  insertarDatos(endpoint: string, datos: any):Observable<any>{
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json');
    const body = { datos: datos };
    console.log(body);
    return this.http.post(this.api + endpoint, body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
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

  modificarDatos(endpoint: string, datos: any):Observable<any>{
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json');
    const body = { datos: datos };
    console.log(body);
    return this.http.put(this.api + endpoint, body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
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
  EliminarDatosPut(endpoint: string, datos: any):Observable<any>{
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json');
    const body = { datos: datos };
    console.log(body);
    return this.http.put(this.api + endpoint, body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
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
 

  sesion(datos: any):Observable<any>{
    const headers = new HttpHeaders()
    .set('Content-type', 'application/json');
    const body = datos;
    return this.http.post(this.api + 'login', body, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
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
