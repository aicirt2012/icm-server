import {Component, OnInit} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {MdIcon} from '@angular2-material/icon';
import {Email} from '../email.model';
import {EmailService} from "../email.service";

@Component({
    selector: 'email-detail',
    templateUrl: 'app/email/detail/detail.component.html',
    styleUrls: ['app/email/detail/detail.component.css'],
    directives: [MdIcon]
})

export class DetailComponent implements OnInit {

    public email:Email;

    constructor(private emailService:EmailService, private routeParams:RouteParams) {
    }

    ngOnInit() {
        var id = this.routeParams.params['id'];

        this.emailService
            .GetSingle(id)
            .subscribe((data:any) => {
                    this.email = data;
                    console.log(data);
                },
                error => console.log(error),
                () => console.log('Get single Item complete'));
    }

    goBack() {
        window.history.back();
    }

}
