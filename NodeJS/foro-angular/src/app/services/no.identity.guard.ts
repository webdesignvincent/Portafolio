import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable()
export class NoIdentityGuard implements CanActivate{

  	public identity: any;

	constructor(
		private _userService: UserService,
		private _router: Router
	){}

	canActivate(){
		let identity = this._userService.getIdentity();

		if(identity && identity.name){
			this._router.navigate(['/']);
			return false;
		}else{
			return true;			
		}
	}

}