import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Global } from '../../services/global';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UserService]
})
export class UsersComponent implements OnInit {

  public users: Array<User>;
  public page_title: string;
  public status: string;
  public url: string;

  constructor(
      private _userService: UserService
  ){
      this.users = [];
      this.page_title = 'Compañeros';
      this.status = '';
      this.url = Global.url;
  }

  ngOnInit(): void {
    console.log('UsersComponent Cargado');
    this.getUsers();
  }

  getUsers(){
      this._userService.getUsers().subscribe(
          response =>{
              if(response.users){
                this.users = response.users;
              }
          },
          error =>{
              this.status ='error';
              console.log(<any>error);
          }
      );
  }

}
