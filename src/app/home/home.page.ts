import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoadingController, Platform} from '@ionic/angular';
import { LensFacing, BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Barcode,  } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { HomeService } from './home.service';
import { App } from '@capacitor/app';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  segmento = "Dispositivo";
  isSupported = false;
  barcodes: Barcode[] = [];
  dispositivoData: any = null;

  scanTipo: string | null = null;
  scanId: string | null = null;
  scanTriage: string | null = null;
  scanTarima: string | null = null;
  scanResults: string = "";

  dispositivosAActualizar: any[] = [];  // Lista de dispositivos a actualizar
  tarimaDestino: number | null = null;  // Número de tarima a la que se moverán


  constructor(
    private plataforma: Platform,
    private modalController: ModalController,
    private alertController: AlertController,
    private dispositivoService: HomeService // Inyecta el servicio
  ) {}

  ionViewDidEnter() {
    this.plataforma.backButton.subscribeWithPriority(10, () => {
      // Si estás en Home, salir de la app
      App.exitApp();
    });
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

  


  // Método para escanear directamente desde la cámara solo códigos QR
  async escanerdispositivo(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }

    const { barcodes } = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
    if (barcodes.length > 0) {
      const scannedData = barcodes[0].displayValue;

      try {
        const parsedData = JSON.parse(scannedData);
        this.scanId = parsedData.id;

        if (this.scanId) {
          // Llama al servicio para obtener datos del dispositivo
          console.log("Ionic Empieza rastreo");
          console.log("Ionic " + parsedData);

          this.dispositivoService.getDispositivoById(this.scanId).subscribe(
            (data) => {
                this.dispositivoData = Array.isArray(data) ? data[0] : data; // Asigna el primer objeto si es un arreglo
            },        
            (error) => {
              console.error('Error al obtener los datos del dispositivo:', error);
          
              // Inspecciona el error completo
              console.log('Error completo:', JSON.stringify(error, null, 2)); 
          
              // Muestra detalles específicos
              if (error.status) {
                console.log(`Código de estado HTTP: ${error.status}`);
              }
              if (error.error) {
                console.log('Respuesta del servidor (error.error):', error.error);
              } else if (error.message) {
                console.log('Mensaje de error (error.message):', error.message);
              }
              if (error instanceof ProgressEvent) {
                console.log('Parece un problema de conexión con la API o CORS.');
              }
              this.presentErrorAlert();
            }
          );
          
        }
      } catch (error) {
        console.error('QR inválido:', error);
      }
    } else {
      this.scanId = null;
    }
  }


// Escaneo de tarima
async escanerTarima(): Promise<void> {
  const granted = await this.requestPermissions();
  if (!granted) {
    this.presentAlert();
    return;
  }

  const { barcodes } = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
  if (barcodes.length > 0) {
    const scannedData = barcodes[0].displayValue;

    try {
      const parsedData = JSON.parse(scannedData);
      this.scanTarima = parsedData.id;
      console.log("El id es: " + this.scanTarima);

      if (this.scanTarima) {
        console.log("Ionic Empieza rastreo");
        console.log("Ionic " + parsedData);

        this.dispositivoService.getTarimaById(this.scanTarima).subscribe(
          (data) => {
            // Almacenar todos los dispositivos en el array
            this.dispositivoData = Array.isArray(data) ? data : [data]; 
            console.log(this.dispositivoData);
          },
          (error) => {
            console.error('Error al obtener los datos de la tarima:', error);
            this.presentErrorAlert();
          }
        );
      }
    } catch (error) {
      console.log("Dentro del catch");
      console.error('QR inválido:', error);
    }
  } else {
    this.scanTarima = null;
  }
}


  async presentErrorAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'No se pudieron obtener los datos del dispositivo. Por favor, inténtalo de nuevo.',
      buttons: ['OK'],
    });
    await alert.present();
  }


  async postDispositivos(): Promise<void> {
    if (this.scanTarima && this.dispositivoData.length > 0) {
      // Lógica para enviar los dispositivos y tarima a la API
      this.dispositivoService.postDispositivos({ dispositivos: this.dispositivoData, tarima: this.scanTarima })
        .subscribe(
          (response) => {
            console.log('Dispositivos enviados exitosamente:', response);
            this.presentAlert('Éxito', 'Los dispositivos han sido enviados correctamente.');
          },
          (error) => {
            console.error('Error al enviar los dispositivos:', error);
            this.presentAlert('Error', 'Hubo un problema al enviar los dispositivos.');
          }
        );
    } else {
      this.presentAlert('Error', 'Por favor, escanea los dispositivos y la tarima antes de enviar.');
    }
  }

  async escanerDispositivoLista(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert('Error', 'No tienes permisos para usar la cámara.');
      return;
    }
  
    const { barcodes } = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
    if (barcodes.length > 0) {
      const scannedData = barcodes[0].displayValue;
  
      try {
        const parsedData = JSON.parse(scannedData);
        if (parsedData.triage && parsedData.tipo) {
          this.dispositivosAActualizar.push({
            triage: parsedData.triage,
            tipo: parsedData.tipo
          });
  
          console.log('Dispositivo agregado:', parsedData);
        } else {
          console.log('QR inválido: no tiene triage/tipo.');
        }
      } catch (error) {
        console.error('QR inválido:', error);
      }
    }
  }

  async ingresarTarima(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Ingresar número de tarima',
      inputs: [
        {
          name: 'tarima',
          type: 'number',
          placeholder: 'Número de tarima',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: (data) => {
            if (data.tarima) {
              this.tarimaDestino = Number(data.tarima);
              console.log('Tarima destino:', this.tarimaDestino);
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  async actualizarDispositivos(): Promise<void> {
    if (!this.tarimaDestino) {
      this.presentAlert('Error', 'Por favor, ingresa un número de tarima.');
      return;
    }
  
    if (this.dispositivosAActualizar.length === 0) {
      this.presentAlert('Error', 'No has escaneado ningún dispositivo.');
      return;
    }
  
    const payload = {
      tarima: this.tarimaDestino,
      datos_actualizar: this.dispositivosAActualizar,
    };
  
    this.dispositivoService.postDispositivos(payload).subscribe(
      (response) => {
        console.log('Dispositivos actualizados:', response);
        this.presentAlert('Éxito', 'Dispositivos actualizados correctamente.');
  
        // Limpiar lista después del envío
        this.dispositivosAActualizar = [];
        this.tarimaDestino = null;
      },
      (error) => {
        console.error('Error al actualizar dispositivos:', error);
        this.presentAlert('Error', 'No se pudieron actualizar los dispositivos.');
      }
    );
  }
  


  async presentAlert(header: string = 'Error', message: string = ''): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }


  // Método para seleccionar una imagen y leer solo códigos QR desde ella
  async reedDispositivo(): Promise<void> {
    try {
      // Selección de la imagen
      const { files } = await FilePicker.pickImages();

      // Verifica si el archivo se ha seleccionado
      const path = files[0]?.path;
      if (!path) {
        console.error("No se seleccionó ninguna imagen");
        return;
      }

      // Escaneo de código de barras desde la imagen, especificando solo códigos QR
      const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
        path,
        formats: [BarcodeFormat.QrCode], // Solo QR
      });

      // Verificar si hay resultados de escaneo
      if (barcodes.length > 0) {
        this.scanResults = barcodes[0].displayValue;
        console.log("Resultado del escaneo:", this.scanResults);
      } else {
        this.scanResults = "No se detectó ningún código QR en la imagen.";
      }
    } catch (error) {
      console.error("Error en reedDispositivo:", error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

}
