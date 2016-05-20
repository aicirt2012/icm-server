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
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css'],
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
export class SendComponent {

  public email:Email;

  emailText:string;
  toEmail:string;

  constructor(private _emailService:EmailService) {
  }

  menu = [{title: 'Menu1'}, {title: 'Menu2'}];

  private sendEmail():void {
    console.log("Sending Mail to: " + this.toEmail + " with Content: " + this.emailText);
  }
}
