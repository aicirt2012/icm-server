import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {Email} from '../email.model';
import {EmailService} from "../email.service";

@Component({
  selector: 'email-list',
  templateUrl: '/app/email/list/list.component.html',
  styleUrls: ['/app/email/list/list.component.css']
})


export class ListComponent implements OnInit{

  public emails:Email[];
  public selectedEmail: Email;

  constructor(private _emailService:EmailService, private router: Router) {
    this.getAllItems();
  }

  private getAllItems():void {
    this._emailService
      .GetAll()
      .subscribe((data:any) => this.emails = data,
        error => console.log(error),
        () => console.log('Get all Items complete'));
  }


  ngOnInit() {
    this.getAllItems();
  }
​
​
  gotoDetail(email: Email) {
    this.router.navigate(['Detail', { id: email.id }]);
  }

}
