import { Component, OnInit } from '@angular/core';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { Global } from '../../services/global';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [PostService, UserService]
})
export class HomeComponent implements OnInit {

  public page_title: string;
  public url: string;
  public status:string;
  public posts: Array<Post>;
  public identity: any;
  public token: any;

  constructor(
    private _postService: PostService,
    private _userService: UserService
  ) { 
    this.page_title = 'Inicio';
    this.url = Global.url;
    this.status = '';
    this.posts = [];
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit(): void {
    console.log('HomeComponent Cargado!');
    this.getPosts();
  }

  getPosts(){
    this._postService.getPosts().subscribe(
        response=>{
            if(response.status == 'success'){
                  this.posts = response.posts;
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
            this.getPosts();
        },
        error =>{
            this.status = 'error';
            console.log(<any>error);
        }
    );
  }

}
