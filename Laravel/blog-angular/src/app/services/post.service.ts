import { Injectable } from '@angular/core';/*Injectable Permite definir servicios para luego injectarlos en otras clases*/
import { HttpClient, HttpHeaders } from '@angular/common/http';/*HttpClient para hacer las peticiones ajax, HttpHeaders para poder enviar cabeceras en cada una de las peticiones ajax*/
import { Observable } from 'rxjs';/*Permite recoger las respuestas que nos devuelve el API*/
import { Post } from '../models/post';
import { Global } from '../services/global';

@Injectable()
export class PostService{

	public url: string;

	constructor(
			private _http: HttpClient
		){
		this.url = Global.url;
	}

	create(token:any, post:Post): Observable<any>{
		// Limpiar campo content (editor texto enriquecido) htmlEntities > utf-8
		post.content = Global.htmlEntities(post.content);

		let json = JSON.stringify(post);
		let params = 'json='+json;

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', token);

		return this._http.post(this.url+'post', params, {headers:headers});
	}

	getPosts(): Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.get(this.url + 'post', {headers:headers});
	}

	getPost(id:any): Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.get(this.url + 'post/' + id, {headers:headers});
	}

	update(token:any, post:any, id:any): Observable<any>{
		// Limpiar campo content (editor texto enriquecido) htmlEntities > utf-8
		post.content = Global.htmlEntities(post.content);
		
		let json = JSON.stringify(post);
		let params = 'json='+json;

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
								       .set('Authorization', token);

		return this._http.put(this.url + 'post/' + id, params, {headers:headers});
	}

	delete(token: any, id: any): Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
		                               .set('Authorization', token);

		return this._http.delete(this.url + 'post/' + id , {headers:headers});
	}

}
