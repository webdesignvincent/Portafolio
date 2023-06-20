import { Injectable } from '@angular/core';/*Injectable Permite definir servicios para luego injectarlos en otras clases*/
import { HttpClient, HttpHeaders } from '@angular/common/http';/*HttpClient para hacer las peticiones ajax, HttpHeaders para poder enviar cabeceras en cada una de las peticiones ajax*/
import { Observable } from 'rxjs';/*Permite recoger las respuestas que nos devuelve el API*/
import { User } from '../models/user';
import { global } from './global';

@Injectable()
export class UserService{

    public url: string;
    public identity: any;
    public token: any;

    constructor(
        private _http: HttpClient
    ){
        this.url = global.url;
    }

    register(user: User): Observable<any>{
		// Convertir el objeto del usuario a un json string
        let json = JSON.stringify(user);
        let params = 'json='+json;
        // Definir las cabeceras
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        // Hacer peticiones ajax
        return this._http.post(this.url+'register', params, {headers:headers});
	}

    signup(user:any, gettoken:any = null): Observable<any>{
		if(gettoken != null){
			user.gettoken = 'true';
		}
        // Convertir el objeto del usuario a un json string
		let json = JSON.stringify(user);
		let params = 'json='+json;
        // Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        // Hacer peticiones ajax
		return this._http.post(this.url+'login', params, {headers:headers});
	}

	update(token:any = null, user:User): Observable<any>{
        // Convertir el objeto del usuario a un json string
		let json = JSON.stringify(user);
		let params = 'json='+json;
        // Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', token);
        // Hacer peticiones ajax
		return this._http.put(this.url+'user/edit', params, {headers:headers});
	}

    getIdentity(){

		let identity:any = JSON.parse(localStorage.getItem("identity")|| '{}');
		
		if(identity && identity != 'undefined'){
			this.identity = identity;
		}else{
			this.identity = null;
		}

		return this.identity;
	}

	getToken(){
		
		let token:any = localStorage.getItem('token');
		
		if(token && token != 'undefined'){
			this.token = token;
		}else{
			this.token = null;
		}

		return this.token;
	}

}