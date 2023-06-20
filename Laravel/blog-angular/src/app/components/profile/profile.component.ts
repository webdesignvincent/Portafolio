import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import { Global } from '../../services/global';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [PostService, UserService]
})
export class ProfileComponent implements OnInit {

  public url: string;
  public status:string;
  public posts: Array<Post>;
  public identity: any;
  public token: any;
  public user: any;

  constructor(
    private _postService: PostService,
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.url = Global.url;
    this.status = '';
    this.posts = [];
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.user = '';
  }

  ngOnInit(): void {
    console.log('ProfileComponent Cargado!');
    this.getProfile();
  }

  getProfile(){
    // Sacar el ide del post de la url
    this._route.params.subscribe(params=>{
        let userId = +params['id']
        this.getPosts(userId);
        this.getUser(userId);
    });
  }

  getUser(userId:any){
    this._userService.getUser(userId).subscribe(
         response=>{
            if(response.status == 'success'){
                  this.user = response.user;
                  console.log(this.user);
            }
        },
        error=>{
            this.status = 'error';
            console.log(<any>error);
        }
    );
  }

  getPosts(userId:any){
    this._userService.getPosts(userId).subscribe(
        response=>{
            if(response.status == 'success'){
                  this.posts = response.posts;
                  console.log(this.posts);
            }
        },
        error=>{
            this.status = 'error';
            console.log(<any>error);
        }
    );
  }

  deletePost(id:any){
    this._postService.delete(this.token, id).subscribe(
        response =>{
            this.getProfile();
        },
        error =>{
            this.status = 'error';
            console.log(<any>error);
        }
    );
  }

}
