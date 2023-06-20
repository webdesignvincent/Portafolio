import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video } from '../models/video';
import { global } from './global';

@Injectable()
export class VideoService{

    public url: string;

    constructor(
        private _http: HttpClient
    ){
        this.url = global.url;
    }

	create(token:any = null, video:Video): Observable<any>{
        // Convertir el objeto del usuario a un json string
		let json = JSON.stringify(video);
		let params = 'json='+json;
        // Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', token);
        // Hacer peticiones ajax
		return this._http.post(this.url+'video/new', params, {headers:headers});
	}
   
	getVideos(token:any = null, page: any = null): Observable<any>{
		if(!page){
			page = 1;
		}
        // Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', token);
        // Hacer peticiones ajax
		return this._http.get(this.url+'video/list?page='+page, {headers:headers});
		console.log(this.url+'video/list?page=');
	}

    getVideo(token:any = null,id: any): Observable<any>{
        // Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', token);
        // Hacer peticiones ajax
		return this._http.get(this.url+'video/detail/'+id, {headers:headers});
	}

    update(token:any = null, video:Video,id:any): Observable<any>{
        // Convertir el objeto del usuario a un json string
		let json = JSON.stringify(video);
		let params = 'json='+json;
        // Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', token);
        // Hacer peticiones ajax
		return this._http.put(this.url+'video/edit/'+id, params, {headers:headers});
	}

    delete(token:any = null,id: any): Observable<any>{
        // Definir las cabeceras
		let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
									   .set('Authorization', token);
        // Hacer peticiones ajax
		return this._http.delete(this.url+'video/remove/'+id, {headers:headers});
	}

}