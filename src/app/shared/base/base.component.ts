import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
