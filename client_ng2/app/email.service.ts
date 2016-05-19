import { Injectable } from '@angular/core';
import {Http, HTTP_PROVIDERS, Response, Headers} from '@angular/http';
import { Email } from './emails/email';
import 'rxjs/add/operator/map';
 
@Injectable()
export class EmailService {

	private headers:Headers;

	constructor(private http: Http) {
		this.headers = new Headers();
		this.headers.append('Content-Type', 'application/json');
		this.headers.append('Accept', 'appliation/json');

	}

	getEmails() {
		let url = 'http://localhost:8000/api/email/list';
   		return this.http.get(url, {}).subscribe((emails:Response) => console.log(emails));
	}
}