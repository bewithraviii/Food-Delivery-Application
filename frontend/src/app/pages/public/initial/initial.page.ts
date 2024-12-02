import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-initial',
  templateUrl: './initial.page.html',
  styleUrls: ['./initial.page.scss'],
})
export class InitialPage implements OnInit {
  ellips: string = 'assets/svg/ellipse.svg';
  vector: string = 'assets/svg/vector.svg';
  ellipsOrange: string = 'assets/svg/ellipse-orange-light.svg';

  constructor() { }

  ngOnInit() {
  }

}
