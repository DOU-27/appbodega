import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrlDispositivo = 'https://suni.funsepa.org/i/api/dispositivoapp/?id=';
  private apiUrlTarima = 'https://suni.funsepa.org/i/api/dispositivo/?tarima=';
  // private apiUrlDispositivo = 'https://436f-181-189-154-68.ngrok-free.app/i/api/dispositivoapp/?id=';
  // private apiUrlTarima = 'https://436f-181-189-154-68.ngrok-free.app/i/api/dispositivo/?tarima=';
  private apiUrledit = 'https://8b7f-181-189-154-68.ngrok-free.app/i/api/dispositivos/app/actualizar_dispositivos_app/';

  constructor(private http: HttpClient) {}

  getDispositivoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlDispositivo}${id}`).pipe(
      catchError((error) => {
        console.error('Error en la solicitud de la API:', error);
        return throwError(() => error);
      })
    );
  }

  getTarimaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlTarima}${id}`).pipe(
      catchError((error) => {
        console.error('Error en la solicitud de la API:', error);
        return throwError(() => error);
      })
    );
  }

  postDispositivos(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log("Enviando datos a la API:", data);
  

    // 🔍 Imprimir datos antes de enviarlos
    console.log("Desde service:");
    console.log("📤 Datos que se enviarán a la API:", JSON.stringify(data, null, 2));


    // Ahora se usa POST en lugar de PUT
    return this.http.post<any>(this.apiUrledit, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error actualizando el dispositivo:', error);
        let errorMessage = 'Error al actualizar el dispositivo.';
        
        // Captura detalles del error
        if (error.error instanceof ErrorEvent) {
          // Error del cliente (red, etc.)
          errorMessage = `Error en la solicitud: ${error.error.message}`;
        } else {
          // Error de la respuesta HTTP (código de estado, etc.)
          errorMessage = `Error al actualizar el dispositivo, código: ${error.status}`;
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  


  


}