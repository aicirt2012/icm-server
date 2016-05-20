import {Component} from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import {MdCheckbox} from '@angular2-material/checkbox';
import {MD_SIDENAV_DIRECTIVES} from '@angular2-material/sidenav';
import {MdToolbar} from '@angular2-material/toolbar';
import {MdButton} from '@angular2-material/button';
import {MdSpinner} from '@angular2-material/progress-circle';
import {MdProgressBar} from '@angular2-material/progress-bar';
import {MD_CARD_DIRECTIVES} from '@angular2-material/card';
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list';
import {MdIcon, MdIconRegistry} from '@angular2-material/icon';
import {MdRadioButton} from '@angular2-material/radio';
import {MdRadioDispatcher} from '@angular2-material/radio/radio_dispatcher';
import {Email} from './emails/email';
import {EmailService} from "./emails/email.service";

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/app.component.css'],
  directives: [MdCheckbox,
    MD_SIDENAV_DIRECTIVES,
    MdToolbar,
    MdButton,
    MdSpinner,
    MdProgressBar,
    MD_CARD_DIRECTIVES,
    MD_INPUT_DIRECTIVES,
    MD_LIST_DIRECTIVES,
    MdIcon,
    MdRadioButton],
  providers: [MdIconRegistry, MdRadioDispatcher, EmailService],
})


@RouteConfig([
  {path: '/emails',         name: 'Emails',     component: Email}
])
//https://angular.io/docs/ts/latest/guide/router-deprecated.html#!#base-href

export class AppComponent {

  public emails:Email [];

  constructor(private _emailService:EmailService) {

    this.getAllItems();
    this.getSingleItem();
  }

  menu = [{title: 'Menu1'}, {title: 'Menu2'}];

  private getAllItems():void {
    this._emailService
      .GetAll()
      .subscribe((data:any) => this.emails = data,
        error => console.log(error),
        () => console.log('Get all Items complete'));
  }

  private getSingleItem():void {
    this._emailService
      .GetSingle('573de64b091dfd1e87c37d05')
      .subscribe((data:any) => console.log(data),
        error => console.log(error),
        () => console.log('Get single Item complete'));
  }
}
