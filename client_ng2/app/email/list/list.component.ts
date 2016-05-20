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
  selector: 'email-list',
  templateUrl: '/app/email/list/list.component.html',
  styleUrls: ['/app/email/list/list.component.css'],
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
export class ListComponent {

  public emails:Email[];

  constructor(private _emailService:EmailService) {
    this.getAllItems();
    console.log('init list comp');

  }

  menu = [{title: 'Menu1'}, {title: 'Menu2'}];

  private getAllItems():void {
    this._emailService
      .GetAll()
      .subscribe((data:any) => this.emails = data,
        error => console.log(error),
        () => console.log('Get all Items complete'));
  }
}
