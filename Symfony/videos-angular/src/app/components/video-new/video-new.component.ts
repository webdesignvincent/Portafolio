import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { VideoService } from 'src/app/services/video.service';
import { Video } from 'src/app/models/video';
import { global } from 'src/app/services/global';

@Component({
  selector: 'app-video-new',
  templateUrl: './video-new.component.html',
  styleUrls: ['./video-new.component.css'],
  providers: [UserService, VideoService]
})
export class VideoNewComponent implements OnInit{

  public page_title: string;
  public identity: any;
  public token: any;
  public video: Video;
  public status: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _videoService: VideoService
  ){
    this.page_title = 'Guardar video favorito';
    this.status = '';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.video = new Video(1, this.identity.sub, '', '', '', '', '', '');
  }

  ngOnInit(): void {
    console.log('VideoNewComponent Cargado!');
  }

  onSubmit(form:any){
      this._videoService.create(this.token, this.video).subscribe(
          response =>{
            if(response.status == 'success'){
              this.status = 'success';
              this._router.navigate(['/inicio']);
            }else{
              this.status = 'error';
            }
          },
          error=>{
              this.status = 'error';
              console.log(<any>error);
          }
      );
  }

}
