import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post';
import { Global } from '../../services/global';

@Component({
  selector: 'app-post-new',
  templateUrl: './post-new.component.html',
  styleUrls: ['./post-new.component.css'],
  providers: [UserService, CategoryService, PostService]
})
export class PostNewComponent implements OnInit {

  public page_title: string;
  public status: string;
  public identity: any;
  public token: any;
  public post: any;
  public categories: any[] = [];
  public resetVar: boolean;
  public url: any;
  public is_edit: boolean;

  public froala_options: Object = {
        charCounterCount: true,
        language: 'es',
        toolbarButtons: ['bold', 'italic', 'underline', 'paragraphFormat'],
        toolbarButtonsXS: ['bold', 'italic', 'underline', 'paragraphFormat'],
        toolbarButtonsSM: ['bold', 'italic', 'underline', 'paragraphFormat'],
        toolbarButtonsMD: ['bold', 'italic', 'underline', 'paragraphFormat'],
  };

  public afuConfig = {
            uploadAPI: {
                  url:Global.url+'post/upload',
                  headers: {
                    "Authorization" : this._userService.getToken()
                  }
            },
            theme: "attachPin",
            hideProgressBar: false,
            hideResetBtn: true,
            hideSelectBtn: false,
            replaceTexts: {
                  selectFileBtn: 'Select Files',
                  resetBtn: 'Reset',
                  uploadBtn: 'Upload',
                  dragNDropBox: 'Drag N Drop',
                  attachPinBtn: 'Sube tu imagen',
                  afterUploadMsg_success: 'Successfully Uploaded !',
                  afterUploadMsg_error: 'Upload Failed !',
                  sizeLimit: 'Size Limit'
            }
  };

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _CategoryService: CategoryService,
    private _postService: PostService
  ) { 
      this.page_title = "Crear una entrada";
      this.identity = this._userService.getIdentity();
      this.token = this._userService.getToken();
      this.status = '';
      this.resetVar = true;
      this.url = Global.url;
      this.is_edit = false;
  }

  ngOnInit(): void {
    console.log('PostNewComponent Cargado!');
    this.post = new Post(1, this.identity.sub, 1, '', '', '', '');
    this.getCategories();
  }

  onSubmit(form:any){
        this._postService.create(this.token, this.post).subscribe(
            response =>{
              if(response.status == 'success'){
                  this.post = response.post;
                  this.status = 'success';
                  this._router.navigate(['/inicio']);
              }else{
                  this.status = 'error';
              }
            },
            error =>{
                this.status = 'error';
                console.log(<any>error);
            }
    );
  }

  getCategories(){
    this._CategoryService.getCategories().subscribe(
          response =>{
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

  imageUpload(datos:any){
    this.post.image = <Array<File>>datos.body.image;
  }

}
