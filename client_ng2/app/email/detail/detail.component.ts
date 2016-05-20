import {Component} from '@angular/core';
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
import {Email} from '../email.model';
import {EmailService} from "../email.service";

@Component({
  selector: 'my-app',
  templateUrl: 'app/email.component.html',
  styleUrls: ['app/email.component.css'],
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
export class DetailComponent {

  public email:Email;

  constructor(private _emailService:EmailService) {
    this.getSingleItem();
  }

  menu = [{title: 'Menu1'}, {title: 'Menu2'}];

  private getSingleItem():void {
    this._emailService
      .GetSingle('573de64b091dfd1e87c37d05')
      .subscribe((data:any) => {
          this.email = data;
          console.log(this.email);
        },
        error => console.log(error),
        () => console.log('Get single Item complete'));
  }
}
