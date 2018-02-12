import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';

@Injectable()
export class EvolutionService {

    public url: string;

    constructor (private _http: Http) {
        this.url = GLOBAL.url;
    }

    verifyEvolution (token, id: string){
        let headers = new Headers({
            'Content-Type' : "application/json",
            'Authorization': token
        });
        let options = new RequestOptions({headers:headers});

        return this._http.get(this.url+'evolution-verify/'+id,options).map(res=>res.json());
    }

    getEvolution (token, id: string){
        let headers = new Headers({
            'Content-Type' : "application/json",
            'Authorization': token
        });
        let options = new RequestOptions({headers:headers});

        return this._http.get(this.url+'evolution/'+id,options).map(res=>res.json());
    }

    getEvolutions(token) {
        let headers = new Headers({
            'Content-Type' : 'application/json',
            'Authorization': token
        });
        let options = new RequestOptions({headers: headers});        

        return this._http.get(this.url + 'evolutions', options).map(res => res.json());
    }
}
