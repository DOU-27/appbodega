import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; 
import { BaseComponent } from './base/base.component'; 

@NgModule({
  declarations: [
    BaseComponent 
  ],
  imports: [
    CommonModule,
    IonicModule 
  ],
  exports: [
    BaseComponent
  ]
})
export class SharedModule { }
