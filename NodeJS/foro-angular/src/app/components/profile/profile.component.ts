import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { TopicService } from '../../services/topic.service';
import { Topic } from '../../models/topic';
import { Global } from '../../services/global';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [UserService, TopicService]
})
export class ProfileComponent implements OnInit {

  public user: any;
  public page_title: string;
  public status: string;
  public url: string;
  public topics: Topic[];


  constructor(
      private _userService: UserService,
      private _topicService: TopicService,
      private _router: Router,
      private _route: ActivatedRoute
  ){
      this.user = '';
      this.topics = [];
      this.page_title = 'Perfil';
      this.status = '';
      this.url = Global.url;
  }

  ngOnInit(): void {
    console.log('ProfileComponent Cargado');

    this._route.params.subscribe(params =>{
        let userId = params['id'];

        this.getUser(userId);
        this.getTopics(userId);
    });
  }

  getUser(userId:any){

      this._userService.getUser(userId).subscribe(
          response =>{
              if(response.user && response.status == 'success'){
                  this.user = response.user;
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

  getTopics(userId:any){

      this._topicService.getTopicsByUser(userId).subscribe(
          response =>{
              if(response && response.status == 'success'){
                this.topics = response.topics;
                console.log(this.topics);
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
