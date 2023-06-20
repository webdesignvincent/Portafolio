import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit{

  public page_title: string;
  public user: User;
  public status: string;
  public token: any;
  public identity: any;

  constructor(
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router
  ){
    this.page_title = "Identificate";
    this.user = new User(1, '', '', '', '', 'ROLE_USER', '');
    this.status = 'Error';
    this.token = '';
    this.identity= '';
  }

  ngOnInit(): void {
    console.log('LoginComponent Cargado!');
    this.logout();
  }

  onSubmit(form:any){
    // USUARIO IDENTIFICADO
    this._userService.signup(this.user).subscribe(
          response =>{
              if(!response.status || response.status != 'error'){
                this.status = 'success';
                this.identity = response;

                      // TOKEN
                      this._userService.signup(this.user, true).subscribe(
                              response =>{
                                  if(!response.status || response.status != 'error'){
                                     
                                      this.token = response;
                                      // PERSISTIR TOKEN DEL USUARIO
                                      localStorage.setItem('token', this.token);
                                      // PERSISTIR DATOS DEL USUARIO
                                      localStorage.setItem('identity', JSON.stringify(this.identity));
                                      // REDIRECCION A INICIO
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

  logout(){
    this._route.params.subscribe(params =>{
        let sure = +params['sure'];

        if(sure == 1){
            localStorage.removeItem('identity');
            localStorage.removeItem('token');

            this.identity = null;
            this.token = null;

            this._router.navigate(['/inicio']);
        }
    });
  }

}
