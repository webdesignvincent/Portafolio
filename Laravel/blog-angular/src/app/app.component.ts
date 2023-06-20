import { Component, OnInit, DoCheck } from '@angular/core';
import { UserService } from './services/user.service';
import { CategoryService } from './services/category.service';
import { Global } from './services/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService,CategoryService]
})
export class AppComponent implements OnInit, DoCheck{

  public title = 'blog-angular';
  public token: any;
  public identity: any;
  public url: any;
  public categories: any;
  public status: string;

  constructor(
        private _userService: UserService,
        private _categoryService: CategoryService
    ){
        this.url = Global.url;
        this.categories = '';
        this.status = '';
  }

  ngOnInit(){
    console.log('AppComponent Cargado!');
    this.loadUser();
    this.getCategories();
  }

  ngDoCheck(){
    this.loadUser();
  }

  loadUser(){
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  getCategories(){
    this._categoryService.getCategories().subscribe(
        response=>{
            if(response.status == 'success'){
              this.categories = response.categories;
            }
        },
        error =>{
          this.status = 'error';
          console.log(<any>error);
        }
    );
  }

}
