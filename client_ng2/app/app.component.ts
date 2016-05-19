import {Component, OnInit} from '@angular/core';
import {Email} from './emails/email';
import {Address} from './emails/address';
import {EmailService} from './email.service';

@Component({
    selector: 'my-app',
    template: '<h1>My First Angular 2 App</h1><ul class="emaillist"><li *ngFor="let email of emails"><span class="email">{{email.subject}}</span></li></ul>',
    providers: [EmailService]
})
export class AppComponent implements OnInit {

	emails: any;

	constructor(private emailService: EmailService) { }

	getEmails() {
		this.emails = this.emailService.getEmails();
	}

	ngOnInit() {
		this.getEmails();
	}
}