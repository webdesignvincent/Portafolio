import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Topic } from '../../../models/topic';
import { UserService } from '../../../services/user.service';
import { TopicService } from '../../../services/topic.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [ UserService, TopicService ]
})
export class ListComponent implements OnInit {

  public page_title: string;
  public topics: Array<Topic>;
  public identity: any;
  public token: string;
  public status: string;

  constructor(
      private _route: ActivatedRoute,
      private _router: Router,
      private _userService: UserService,
      private _topicService: TopicService
  ) { 
      this.page_title = 'Mis temas';
      this.status = '';
      this.identity = this._userService.getIdentity();
      this.token = this._userService.getToken();
      this.topics = [];
  }

  ngOnInit(): void {
    console.log('ListComponent Cargado');
    this.getTopics();
  }

  getTopics(){
      let userId = this.identity._id;

      this._topicService.getTopicsByUser(userId).subscribe(
          response =>{
              if(response && response.status == 'success'){
                this.topics = response.topics;
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

  deleteTopic(id:any){
      this._topicService.delete(this.token, id).subscribe(
          response =>{
              this.getTopics();
          },
          error =>{
              this.status = 'error';
              console.log(<any>error);
          }

      );

  }

}
