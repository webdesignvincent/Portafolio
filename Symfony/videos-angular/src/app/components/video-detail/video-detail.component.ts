import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { VideoService } from 'src/app/services/video.service';
import { Video } from 'src/app/models/video';
import { global } from 'src/app/services/global';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.css'],
  providers: [UserService, VideoService]
})
export class VideoDetailComponent implements OnInit{
  public identity: any;
  public token: any;
  public video: any;
  public status: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _videoService: VideoService,
    private _sanitizer: DomSanitizer
  ){
    this.status = '';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit(): void {
    console.log('VideoDetailComponent Cargado!');
    this.getVideo();
  }

  getVideo(){
      this._route.params.subscribe(params=>{
        var id = +params['id'];
        this._videoService.getVideo(this.token, id).subscribe(
            response =>{
              if(response.video){
                  this.video = response.video;
              }else{
                this._router.navigate(['/inicio']);
              }
            },
            error =>{
              this.status = 'error';
              console.log(<any>error);
            }
        );
      });
  }

  getVideoIframe(url:any) {
    var video, results;
 
    if (url === null) {
        return '';
    }
    results = url.match('[\\?&]v=([^&#]*)');
    video   = (results === null) ? url : results[1];
 
    return this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + video);   
  }

}
