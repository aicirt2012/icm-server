import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import 'rxjs/add/operator/map'
import {Observable} from 'rxjs/Observable';
import {Email} from './email.model';

@Injectable()
export class EmailService {

    private actionUrl:string;
    private headers:Headers;

    constructor(private _http:Http) {

        this.actionUrl = 'http://localhost:8000/api/email/';

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    public GetAll = ():Observable<Response> => {
        return this._http.get(this.actionUrl + "list").map(res => res.json());
    }

    public GetSingle = (id:string):Observable<Response> => {
        return this._http.get(this.actionUrl + id).map(res => res.json());
    }

    public Add = (itemName:string):Observable<Response> => {
        var toAdd = JSON.stringify({ItemName: itemName});

        return this._http.post(this.actionUrl, toAdd, {headers: this.headers}).map(res => res.json());
    }

    public Update = (id:string, itemToUpdate:Email):Observable<Response> => {
        return this._http.put(this.actionUrl + id, JSON.stringify(itemToUpdate), {headers: this.headers}).map(res => res.json());
    }

    public Delete = (id:string):Observable<Response> => {
        return this._http.delete(this.actionUrl + id);
    }
}
