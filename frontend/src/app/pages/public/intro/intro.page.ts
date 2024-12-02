import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {

  logo: string = 'assets/svg/logo.svg';
  ellipsLight: string = 'assets/svg/ellipse-light.svg';
  ellipsOrange: string = 'assets/svg/ellipse-orange.svg';

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/public/login']);
    }, 5000);
  }

}
