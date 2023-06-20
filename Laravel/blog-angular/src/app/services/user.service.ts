import { Injectable } from '@angular/core';/*Injectable Permite definir servicios para luego injectarlos en otras clases*/
import { HttpClient, HttpHeaders } from '@angular/common/http';/*HttpClient para hacer las peticiones ajax, HttpHeaders para poder enviar cabeceras en cada una de las peticiones ajax*/
import { Observable } from 'rxjs';/*Permite recoger las respuestas que nos devuelve el API*/
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

	register(user:User): Observable<any>{
		let json = JSON.stringify(user);
		let params = 'json='+json;

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.post(this.url+'register', params, {headers:headers});
	}

	signup(user:any, getToken:any = null): Observable<any>{
		if(getToken != null){
			user.getToken = 'true';
		}

		let json = JSON.stringify(user);
		let params = 'json='+json;

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.post(this.url+'login', params, {headers:headers});
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

	update(token:any, user:User): Observable<any>{
		// Limpiar campo content (editor texto enriquecido) htmlEntities > utf-8
		user.description = Global.htmlEntities(user.description);
		
		let json = JSON.stringify(user);
		let params = 'json='+json;

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', this.getToken());

		return this._http.put(this.url+'user/update', params, {headers:headers});

	}

	getPosts(id: any): Observable<any>{

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.get(this.url+'post/user/'+id, {headers:headers});

	}

	getUser(id: any): Observable<any>{

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.get(this.url+'user/detail/'+id, {headers:headers});

	}

}
