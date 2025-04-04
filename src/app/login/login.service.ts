import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'https://suni.funsepa.org/users/api/validartoken/';

  constructor(private http: HttpClient) {}

  async validarToken(token: string): Promise<any> {
    const body = { token };
    console.log(body);

    try {
      const respuesta = await firstValueFrom(
        this.http.post(this.apiUrl, body).pipe(
          catchError((error) => {
            console.error('Error al validar token', error);
            return throwError(() => error);
          })
        )
      );
      return respuesta;
    } catch (error) {
      return null;
    }
  }
}
