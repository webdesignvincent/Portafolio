import { Component, OnInit, DoCheck } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Global } from '../../services/global';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [UserService]
})
export class UserEditComponent implements OnInit, DoCheck{

  public page_title: string;
  public user: any;
  public url: any;
  public status: string;
  public identity: any;
  public token: any;
  public resetVar: boolean;

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
                  url:     Global.url+'user/upload',
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
                  attachPinBtn: 'Sube tu avatar de usuario',
                  afterUploadMsg_success: 'Successfully Uploaded !',
                  afterUploadMsg_error: 'Upload Failed !',
                  sizeLimit: 'Size Limit'
            }
  };
     
  constructor(
      private _userService: UserService
    ) { 
    this.page_title = 'Ajustes de usuario';
    this.status = '';
    this.resetVar = true;
    this.url = Global.url;
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    // RELLENAR OBJETO USUARIO
    this.user = new User(this.identity.sub, 
                         this.identity.name,
                         this.identity.surname, 
                         this.identity.role,
                         this.identity.email,
                         '',
                         this.identity.description,
                         this.identity.image
                );
  }

  ngOnInit(): void {
    console.log('UserEditComponent Cargado!');
  }

  ngDoCheck(){
    this.identity = this._userService.getIdentity();
  }

  onSubmit(form:any){

    this._userService.update(this.token, this.user).subscribe(

            response=>{
                        if(response && response.status == "success"){

                            this.status = response.status;
                            this.user.sub = response.user.sub;

                            // ACTUALIZAR USUARIO EN SESION
                            if(response.changes.name){
                                this.user.name = response.changes.name;
                            }

                            if(response.changes.surname){
                                this.user.surname = response.changes.surname;
                            }

                            if(response.changes.email){
                                this.user.email = response.changes.email;
                            }

                            if(response.changes.description){
                                this.user.description = response.changes.description;
                            }

                            if(response.changes.image){
                                this.user.image = response.changes.image;
                            }

                            this.identity = this.user;
                            // PERSISTIR DATOS DEL USUARIO
                            localStorage.setItem('identity', JSON.stringify(this.identity));

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

  avatarUpload(datos:any){
    this.user.image = <Array<File>>datos.body.image;
  }

}
