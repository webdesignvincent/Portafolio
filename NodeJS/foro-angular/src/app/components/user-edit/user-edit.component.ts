import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Global } from '../../services/global';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [UserService]
})
export class UserEditComponent implements OnInit, DoCheck {

  public page_title: string;
  public user: any;
  public status: string;
  public identity: any;
  public token: any;
  public afuConfig: any;
  public resetVar: boolean;
  public url: string;

  constructor(
      private _userService: UserService,
      private _router: Router,
      private _route: ActivatedRoute
  ){
      this.page_title = 'Ajustes de usuario';
      this.identity = this._userService.getIdentity();
      this.token = this._userService.getToken();
      this.user = this.identity;
      this.status = '';
      this.resetVar = true;
      this.url = Global.url;
      this.afuConfig = {
              multiple: false,
              formatsAllowed: ".jpg, .jpeg, .png, .gif",
              maxSize: "50",
              uploadAPI: {
                    url:   this.url+'upload-avatar',
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
                    attachPinBtn: 'Sube tu foto',
                    afterUploadMsg_success: 'Successfully Uploaded !',
                    afterUploadMsg_error: 'Upload Failed !',
                    sizeLimit: 'Size Limit'
              }
      };
  }

  ngOnInit(): void {
    console.log('UserEditComponent Cargado');
  }

  ngDoCheck(){
      this.identity = this._userService.getIdentity();
      this.token = this._userService.getToken();
  }

  avatarUpload(data:any){
      this.user.image = <Array<File>>data.body.image;
  }

  onSubmit(form:any){
      this._userService.update(this.user).subscribe(
            response =>{
                if(!response.user){
                    this.status = 'error';
                }else{
                    this.status = 'success';
                    this.user = response.user;
                    localStorage.setItem('identity', JSON.stringify(this.user));            
                }
            },
            error =>{
                this.status = 'error';
                console.log(<any>error);
            }
      );
  }



}
