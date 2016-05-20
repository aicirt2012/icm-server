import {Component} from '@angular/core';
import {Router, RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {FORM_DIRECTIVES} from '@angular/common';
import {MdCheckbox} from '@angular2-material/checkbox';
import {MD_SIDENAV_DIRECTIVES} from '@angular2-material/sidenav';
import {MdToolbar} from '@angular2-material/toolbar';
import {MdButton} from '@angular2-material/button';
import {MdSpinner} from '@angular2-material/progress-circle';
import {MdProgressBar} from '@angular2-material/progress-bar';
import {MD_CARD_DIRECTIVES} from '@angular2-material/card';
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list';
import {MdIcon, MdIconRegistry} from '@angular2-material/icon';
import {MdRadioButton} from '@angular2-material/radio';
import {MdRadioDispatcher} from '@angular2-material/radio/radio_dispatcher';
import {Email} from './email/email.model';
import {EmailService} from "./email/email.service";
import {ListComponent} from "./email/list/list.component";
import {DetailComponent} from "./email/detail/detail.component";
import {SendComponent} from "./email/send/send.component";
import {MeService} from "./me/me.service";


@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    styleUrls: ['app/app.component.css'],
    directives: [MdCheckbox,
        MD_SIDENAV_DIRECTIVES,
        MdToolbar,
        MdButton,
        MdSpinner,
        MdProgressBar,
        MD_CARD_DIRECTIVES,
        MD_INPUT_DIRECTIVES,
        MD_LIST_DIRECTIVES,
        MdIcon,
        MdRadioButton,
        ROUTER_DIRECTIVES,
        ListComponent,
      FORM_DIRECTIVES
    ],
    providers: [MdIconRegistry, MdRadioDispatcher, EmailService, ROUTER_PROVIDERS, MeService],
})


@RouteConfig([
    {
        path: '/list',
        name: 'List',
        component: ListComponent,
        useAsDefault: true
    },
    {
        path: '/email/:id',
        name: 'Detail',
        component: DetailComponent
    },
    {
        path: '/send',
        name: 'Send',
        component: SendComponent
    }
])

//https://angular.io/docs/ts/latest/guide/router-deprecated.html#!#base-href

export class AppComponent {

    public emails:Email [];

    constructor(private router:Router, private meService: MeService) {
      console.log(meService.GetMe());
    }

    menu = [{title: 'Menu1'}, {title: 'Menu2'}];

    goToRoute(route:string) {
        let link = [route];
        this.router.navigate(link);
    }
}
