import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'; 
import { UserService } from './services/user.service';
import { Global } from './services/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})
export class AppComponent implements OnInit, DoCheck{
  public page_title: string;
  public identity: any;
  public token: any;
  public url: string;
  public search: string;

  constructor(
      private _userService: UserService,
      private _router: Router,
      private _route: ActivatedRoute
    ){
        this.page_title = 'NG-FORO'; 
        this.url = Global.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.search = '';
  }

  ngOnInit(): void {
      console.log('AppComponent Cargado');
  }

  ngDoCheck(){
      this.identity = this._userService.getIdentity();
      this.token = this._userService.getToken();
  }

  logout(){
      localStorage.removeItem('identity');
      localStorage.removeItem('token');
      localStorage.clear();
      this.identity = null;
      this.token = null;
      // REDIRECCION A INICIO
      this._router.navigate(['/inicio']);
  }

  goSearch(search:any){
      this._router.navigate(['/buscar',this.search]);
      search.reset();
  }

}
