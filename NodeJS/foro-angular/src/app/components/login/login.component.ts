import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'; 
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {

  public page_title:string;
  public user: User;
  public status: string;
  public identity: any;
  public token: any;

  constructor(
     private _userService: UserService,
     private _router: Router,
     private _route: ActivatedRoute
  ){ 
      this.page_title = 'Identificate';
      this.user = new User('','','','','','','ROLE_USER');
      this.status = '';
      this.identity = '';
      this.token = '';
  }

  ngOnInit(): void {
     console.log('LoginComponent Cargado');
  }

  onSubmit(form:any){
      // Conseguir el objeto completo
      this._userService.signup(this.user).subscribe(
            response =>{
                if(response.user && response.user._id){
                
                  // Guardamos el usuario en una propiedad
                  this.identity = response.user;
                  // Local storage
                  localStorage.setItem('identity', JSON.stringify(this.identity));

                        // Conseguir el token
                        this._userService.signup(this.user,true).subscribe(

                              response =>{
                                if(response.token){
                                    this.token = response.token;
                                     // Local storage
                                     localStorage.setItem('token', this.token);
                                      // REDIRECCION A INICIO
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
