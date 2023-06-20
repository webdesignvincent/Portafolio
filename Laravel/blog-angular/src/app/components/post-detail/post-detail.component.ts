import { Component, OnInit } from '@angular/core';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Global } from '../../services/global';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
  providers: [PostService]
})
export class PostDetailComponent implements OnInit {

  public post: any;
  public status: string;
  public url: string;

  constructor(
    private _postService: PostService,
    private _route: ActivatedRoute,
    private _router: Router
  ){
    this.post = '';
    this.status = '';
    this.url = Global.url;
  }

  ngOnInit(): void {
    console.log('PostDetailComponent Cargado!');
    this.getPost();
  }

  getPost(){
    // Sacar el ide del post de la url
    this._route.params.subscribe(params=>{
      
         let id = +params['id'];

        // Peticion ajax para sacar los datos del post
        this._postService.getPost(id).subscribe(
            response =>{
              if(response.status == 'success'){
                this.post = response.posts;
              }
            },
            error =>{
              this.status = 'error';
              console.log(<any>error);
              this._router.navigate(['/inicio']);
            }
          );

    });
  }

}
