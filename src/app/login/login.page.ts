import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Platform} from '@ionic/angular';



@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  isSupported = false;


  constructor(
    private plataforma: Platform,
    private loginService: LoginService,
    private router: Router,
    private alertController: AlertController
  ) {}


  ionViewWillEnter() {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Ya hay un token guardado:", token);
      this.router.navigate(['/home']); // o la página a la que quieras redirigir
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.plataforma.is('capacitor')) {
      const permissionStatus = await BarcodeScanner.checkPermissions();
      if (permissionStatus.camera !== 'granted') {
        await BarcodeScanner.requestPermissions();
      }

      BarcodeScanner.isSupported().then((result) => {
        this.isSupported = result.supported;
      });
    }
  }


  async escanertoken() {
    const result = await BarcodeScanner.scan();
    const token = result.barcodes[0]?.rawValue;
    const granted = await this.requestPermissions();
    
    if (!granted) {
      this.presentAlert('Error', 'No tienes permisos para usar la cámara.');
      return;
    }

    if (!granted) {
      this.presentAlert();
      return;
    }

    if (!token) {
      this.mostrarAlerta('No se pudo escanear el token.');
      return;
    }

    const respuesta = await this.loginService.validarToken(token);
    console.log("Token desde page"); 
    console.log(respuesta); 

    if (respuesta && respuesta.mensaje === 'Token válido') {
      // Guardar datos del usuario
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', respuesta.usuario);
      localStorage.setItem('nombre', respuesta.nombre);
      localStorage.setItem('apellido', respuesta.apellido);

      console.log(respuesta.nombre)
      const alert = await this.alertController.create({
        header: 'Bienvenido ' + respuesta.nombre,
        buttons: ['OK']
      });
      await alert.present();

      // Ir a la página principal
      this.router.navigate(['/home']);
    } else {
      this.mostrarAlerta('Token inválido o no autorizado.');
    }
  }

  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Acceso denegado',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async mostrarInfoToken() {
    const alert = await this.alertController.create({
      header: '¿Dónde ver mi token?',
      message: 'Para obtener tu token, por favor comunícate con el área de IT de Funsepa.',
      buttons: ['Entendido']
    });
  
    await alert.present();
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }
  async presentAlert(header: string = 'Error', message: string = ''): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
  
}
