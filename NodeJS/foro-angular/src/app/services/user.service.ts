/*Injectable Permite definir servicios para luego injectarlos en otras clases*/
import { Injectable } from '@angular/core';
/*HttpClient para hacer las peticiones ajax, HttpHeaders para poder enviar cabeceras en cada una de las peticiones ajax*/
import { HttpClient, HttpHeaders } from '@angular/common/http';
/*Permite recoger las respuestas que nos devuelve el API*/
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Global } from '../services/global';

@Injectable()
export class UserService{

	public url: string;
  	public identity: any;
  	public token: any;

	constructor(
		private _http: HttpClient
	){
		this.url = Global.url;
	}

	register(user: User): Observable<any>{
		// Convertir el objeto del usuario a un json string
		let params = JSON.stringify(user);
		// Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type','application/json');
		// Hacer peticiones ajax
		return this._http.post(this.url+'register', params, {headers:headers});
	}

	signup(user: any, gettoken:any = null): Observable<any>{
		// Comprobar si llega el token
		if(gettoken != null){
			user.gettoken = gettoken;
		}
		// Convertir el objeto del usuario a un json string
		let params = JSON.stringify(user);
		// Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type','application/json');
		// Hacer peticiones ajax
		return this._http.post(this.url+'login', params, {headers:headers});
	}

	getIdentity(){
		// Convertir en un objeto de javaScript
		let identity:any = JSON.parse(localStorage.getItem("identity")|| '{}');
		
		if(identity && identity !=null &&  identity != undefined && identity != 'undefined'){
			this.identity = identity;
		}else{
			this.identity = null;
		}

		return this.identity;
	}

	getToken(){
		
		let token:any = localStorage.getItem('token');
		
		if(token && token !=null && token != undefined && token != 'undefined'){
			this.token = token;
		}else{
			this.token = null;
		}

		return this.token;
	}

	update(user: User): Observable<any>{

		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type','application/json')
									   .set('Authorization',this.getToken());

		return this._http.put(this.url+'user/update', params, {headers:headers});
	}

	getUsers(): Observable<any>{
		return this._http.get(this.url+'users');
	}

	getUser(userId:any= null): Observable<any>{
        return this._http.get(this.url+'user/'+userId);  
	}
}