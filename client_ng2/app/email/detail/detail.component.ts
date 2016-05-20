import {Component} from '@angular/core';
import {Email} from '../email.model';
import {EmailService} from "../email.service";

@Component({
  selector: 'email-detail',
  templateUrl: './detail/detail.component.html',
  styleUrls: ['./detail/detail.component.css']
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
