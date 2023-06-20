import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable()
export class UserGuard implements CanActivate{

  	public identity: any;

	constructor(
		private _userService: UserService,
		private _router: Router
	){}

	canActivate(){
		let identity = this._userService.getIdentity();

		if(identity && identity._id){
			return true;
		}else{
			this._router.navigate(['/']);
			return false;
		}
	}

}