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

  constructor(private emailService:EmailService, private router: Router) { }

  ngOnInit() {
    this.emailService
      .GetAll()
      .subscribe((data:any) => this.emails = data,
        error => console.log(error),
        () => console.log('Get all Items complete'));
  }
​
​
  gotoDetail(email: Email) {
    this.router.navigate(['Detail', { id: email.id }]);
  }

}
