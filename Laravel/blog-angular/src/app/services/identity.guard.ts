import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable()
export class IdentityGuard implements CanActivate{

	public identity: any;

	constructor(
		private _router: Router,
		private _userService: UserService
	){}

	canActivate(){

		let identity = this._userService.getIdentity();

		if(identity && identity.sub){
			return true;
		}else{
			this._router.navigate(['/error']);
  			return false;
		}
	}

}