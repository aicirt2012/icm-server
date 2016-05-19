import {Component} from '@angular/core';
import {Email} from './emails/email';

@Component({
    selector: 'my-app',
    template: '<h1>My First Angular 2 App</h1><ul class="emaillist"><li *ngFor="let email of emails"><span class="email">{{email.subject}}</span></li></ul>'
})
export class AppComponent {

	emails = EMAILS;

}

var EMAILS: Email[] = [
	{"messageId": "JyiL3xzcVjPLkQ6Gwua8zQ@notifications.google.com",
	 "subject": "Anmeldeversuch verhindert",
	 "html": "<html><head></head><body>ayylmao</body></html>",
	 "text": "Hi this is a test.",
	 "date": "2016-05-23"
	},
	{"messageId": "zcVjPLkQ6Gwua8zQ@notifications.google.com",
	 "subject": "rsuch verhindert",
	 "html": "<html><head></head><body>bits&pieces</body></html>",
	 "text": "Hi this is a test#2.",
	 "date": "2016-05-24"
	}
]