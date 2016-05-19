import { Injectable } from '@angular/core';
import {Http, HTTP_PROVIDERS} from '@angular/http';
import { Email } from './emails/email';
import 'rxjs/add/operator/map';
 
@Injectable()
export class EmailService {

	constructor(private http: Http) {}

	getEmails() {
		let url = 'http://localhost/api/email/list';
   		return this.http.get(url, {}).map((res:any) => res.json());
	}
}