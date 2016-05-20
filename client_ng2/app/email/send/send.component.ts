import {Component} from '@angular/core';
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input';
import {MdIcon} from '@angular2-material/icon';
import {Email} from '../email.model';
import {EmailService} from "../email.service";

@Component({
    selector: 'email-send',
    templateUrl: 'app/email/send/send.component.html',
    styleUrls: ['app/email/send/send.component.css'],
    directives: [MD_INPUT_DIRECTIVES, MdIcon]
})

export class SendComponent {

    public email:Email;

    emailText:string;
    toEmail:string;

    constructor(private emailService:EmailService) {
    }


    private sendEmail():void {
        console.log("Sending Mail to: " + this.toEmail + " with Content: " + this.emailText);
    }
}
