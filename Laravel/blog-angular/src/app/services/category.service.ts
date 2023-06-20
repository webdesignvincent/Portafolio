import { Injectable } from '@angular/core';/*Injectable Permite definir servicios para luego injectarlos en otras clases*/
import { HttpClient, HttpHeaders } from '@angular/common/http';/*HttpClient para hacer las peticiones ajax, HttpHeaders para poder enviar cabeceras en cada una de las peticiones ajax*/
import { Observable } from 'rxjs';/*Permite recoger las respuestas que nos devuelve el API*/
import { Category } from '../models/category';
import { Global } from '../services/global';

@Injectable()
export class CategoryService{

	public url: string;

	constructor(
			private _http: HttpClient
		){
		this.url = Global.url;
	}

	create(token:any, category:Category): Observable<any>{
		let json = JSON.stringify(category);
		let params = 'json='+json;

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', token);

		return this._http.post(this.url+'category', params, {headers:headers});
	}

	getCategories(): Observable<any>{

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.get(this.url+'category', {headers:headers});

	}

	getCategory(id: any): Observable<any>{

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.get(this.url+'category/'+id, {headers:headers});

	}

	getPosts(id: any): Observable<any>{

		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

		return this._http.get(this.url+'post/category/'+id, {headers:headers});

	}

}
