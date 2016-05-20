import {Component, OnInit} from '@angular/core';
import {Email} from '../email.model';
import {EmailService} from "../email.service";

@Component({
  selector: 'email-detail',
  templateUrl: './detail/detail.component.html',
  styleUrls: ['./detail/detail.component.css']
})

export class DetailComponent implements OnInit{

  public email:Email;

  constructor(private emailService:EmailService) {}

  ngOnInit() {
    this.emailService
      .GetSingle('573de64b091dfd1e87c37d05')
      .subscribe((data:any) => {
          this.email = data;
          console.log(this.email);
        },
        error => console.log(error),
        () => console.log('Get single Item complete'));
  }

}
