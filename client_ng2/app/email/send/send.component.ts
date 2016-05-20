import {Component} from '@angular/core';
import {Email} from '../email.model';
import {EmailService} from "../email.service";

@Component({
  selector: 'email-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css']
})

export class SendComponent {

  public email:Email;

  emailText:string;
  toEmail:string;

  constructor(private emailService:EmailService) {}


  private sendEmail():void {
    console.log("Sending Mail to: " + this.toEmail + " with Content: " + this.emailText);
  }
}
