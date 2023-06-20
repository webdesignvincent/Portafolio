import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service'; 
import { VideoService } from 'src/app/services/video.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [UserService, VideoService]
})
export class HomeComponent implements OnInit{

  public page_title: string;
  public identity: any;
  public token: any;
  public videos: any[];
  public status: any;
  public page: any;
  public next_page: any;
  public prev_page: any;
  public number_pages: any;

  constructor(
    private _userService: UserService,
    private _videoService: VideoService,
    private _router: Router,
    private _route: ActivatedRoute
  ){
    this.page_title = "Mis videos";
    this.status = '';
    this.videos = [];
    this.page = '';
    this.next_page = '';
    this.prev_page = '';
    this.number_pages = '';
  }

  ngOnInit(): void{
    console.log('HomeComponent Cargado!');
    this.loadUser();
    this.pageVideos();
  }

  ngDoCheck(): void {
    this.loadUser();
  }

  loadUser(){
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  pageVideos(){

    this._route.params.subscribe(params=>{
        var page = +params['page'];

        if(!page){
            page = 1;
            this.prev_page = 1;
            this.next_page = 2;
        }

        this.getVideos(page);
      
    });

  }

  getVideos(page:any=null){
      this._videoService.getVideos(this.token, page).subscribe(
        response =>{
            this.videos = response.pagination;   

            let number_pages = [];
            for(let i=1; i<=response.total_pages; i++){
                number_pages.push(i);
            }
            this.number_pages = number_pages;

            if(page >= 2){
              this.prev_page = page-1;
            }else{
              this.prev_page = 1;
            }

            if(page < response.total_pages){
              this.next_page = page + 1;
            }else{
              this.next_page = response.total_pages;
            }

        },
        error =>{
            this.status = 'error';
            console.log(error);
        }
      );
  }

  getThumb(url:any, size:any) {
    var video, results, thumburl;
    
     if (url === null) {
         return '';
     }
     
     results = url.match('[\\?&]v=([^&#]*)');
     video   = (results === null) ? url : results[1];
    
     if(size != null) {
         thumburl = 'http://img.youtube.com/vi/' + video + '/'+ size +'.jpg';
     }else{
         thumburl = 'http://img.youtube.com/vi/' + video + '/mqdefault.jpg';
     }
    
      return thumburl;
        
  }

  deleteVideo(id:any){
      this._videoService.delete(this.token, id).subscribe(
          response =>{
            this.pageVideos();
          },
          error =>{
              this.status = 'error';
              console.log(error);
          }
      );    
  }

}
