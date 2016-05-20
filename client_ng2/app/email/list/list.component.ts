import {Component} from '@angular/core';
import {Email} from '../email.model';
import {EmailService} from "../email.service";

@Component({
  selector: 'email-list',
  templateUrl: '/app/email/list/list.component.html',
  styleUrls: ['/app/email/list/list.component.css']
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
