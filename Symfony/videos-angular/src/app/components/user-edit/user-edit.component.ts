import { Component, OnInit, DoCheck } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [UserService]
})
export class UserEditComponent implements OnInit, DoCheck{

  public page_title: string;
  public user: User;
  public status: string;
  public identity: any;
  public token: any;

  constructor(
      private _userService: UserService
  ){
      this.page_title = "Ajustes de usuario";
      this.status = 'Error';
      this.identity = this._userService.getIdentity();
      this.token = this._userService.getToken();
      // RELLENAR OBJETO USUARIO
      this.user = new User(this.identity.sub, 
                          this.identity.name,
                          this.identity.surname, 
                          this.identity.email,
                          '',
                          this.identity.role,
                          this.identity.createdAt
                      );
  }

  ngOnInit(): void {
    console.log('UserEditComponent Cargado!');
  }

  ngDoCheck(): void {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();      
  }

  onSubmit(form:any){
      this._userService.update(this.token, this.user).subscribe(
          response =>{
              if(response && response.status == 'success'){
                  this.status = 'success';
                  this.identity = response.user;
                  this.user = response.user;
                  console.log(response.user);
                  localStorage.setItem('identity',JSON.stringify(this.user));
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

}
