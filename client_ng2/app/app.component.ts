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
import {Email} from './emails/email';

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
  providers: [MdIconRegistry, MdRadioDispatcher],
})
export class AppComponent {

  emails = EMAILS;

  menu = [{title: 'Menu1'}, {title: 'Menu2'}];

}

var EMAILS:Email[] = [
  {
    "messageId": "JyiL3xzcVjPLkQ6Gwua8zQ@notifications.google.com",
    "subject": "Anmeldeversuch verhindert",
    "html": "<html><head></head><body>ayylmao</body></html>",
    "text": "Hi this is a test.",
    "date": "2016-05-23"
  },
  {
    "messageId": "zcVjPLkQ6Gwua8zQ@notifications.google.com",
    "subject": "rsuch verhindert",
    "html": "<html><head></head><body>bits&pieces</body></html>",
    "text": "Hi this is a test#2.",
    "date": "2016-05-24"
  }
]
