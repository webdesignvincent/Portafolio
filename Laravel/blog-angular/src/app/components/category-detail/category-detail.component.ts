import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { Category } from '../../models/category';
import { Post } from '../../models/post';
import { Global } from '../../services/global';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css'],
  providers: [CategoryService, UserService, PostService]
})
export class CategoryDetailComponent implements OnInit {

  public url: any;
  public page_title: any;
  public category: Category;
  public posts: Array<Post>;
  public status: string;
  public identity: any;
  public token: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _categoryService: CategoryService,
    private _userService: UserService,
    private _postService: PostService
    ){ 
    this.url = Global.url;
    this.page_title = 'Detalle Categoria';
    this.category = new Category(1,'');
    this.status = '';
    this.posts = [];
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit(): void {
    console.log('CategoryDetailComponent Cargado!');
    this.getPostsByCategory();
  }

  getPostsByCategory(){
    this._route.params.subscribe(params =>{

        let id = +params['id'];

        this._categoryService.getCategory(id).subscribe(
              response =>{
                  if(response.status == 'success'){

                    this.category = response.category;

                        this._categoryService.getPosts(id).subscribe(

                            response =>{

                              if(response.status == 'success'){
                                this.posts = response.posts;
                              }else{
                                this._router.navigate(['/inicio']);
                              }

                            },
                            error =>{
                              this.status = 'error';
                              console.log(<any>error);
                            }

                        );

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

  deletePost(id:any){
    this._postService.delete(this.token, id).subscribe(
        response =>{
            this.getPostsByCategory();
        },
        error =>{
            this.status = 'error';
            console.log(<any>error);
        }
    );
  }

}
