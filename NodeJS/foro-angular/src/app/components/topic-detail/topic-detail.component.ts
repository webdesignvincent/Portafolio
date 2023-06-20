import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Global } from '../../services/global';
import { Topic } from '../../models/topic';
import { TopicService } from '../../services/topic.service';
import { UserService } from '../../services/user.service';
import { Comment } from '../../models/comments';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-topic-detail',
  templateUrl: './topic-detail.component.html',
  styleUrls: ['./topic-detail.component.css'],
  providers: [TopicService, UserService, CommentService]
})
export class TopicDetailComponent implements OnInit {

  public topic: any;
  public comment: any;
  public identity: any;
  public token: any;
  public status: string;
  public url: string;
  public delete: boolean;

  constructor(
      private _route: ActivatedRoute,
      private _router: Router,
      private _topicService: TopicService,
      private _userService: UserService,
      private _commentService: CommentService
  ){ 
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();

        if(this.identity !=null){
            this.comment = new Comment('','','',this.identity._id);
        }

        this.status = '';
        this.url = Global.url;
        this.delete = false;
  }

  ngOnInit(): void {
    console.log('TopicDetailComponent Cargado');
    this.getTopic();
  }

  getTopic(){
      this._route.params.subscribe(params =>{

          let id = params['id'];

          this._topicService.getTopic(id).subscribe(
              response =>{
                  if(response.topic){
                    this.topic = response.topic;
                  }else{
                    this._router.navigate(['/inicio']);
                  }
              },
              error =>{
                  console.log(<any>error);
              }
          );
      });
  }

  onSubmit(form:any){
      this._commentService.add(this.token, this.comment, this.topic._id).subscribe(
          response =>{
              if(!response){
                this.status = 'error';
              }else{
                this.status = 'success';
                this.topic = response.topic;
                form.reset();
              }
          },
          error =>{
              this.status = 'error';
              console.log(<any>error);
          }
      );
  }

  deleteComment(commentId:any){
     this._commentService.delete(this.token, this.topic._id, commentId).subscribe(
          response =>{
              if(!response.topic){
                this.status = 'error';
                this.delete = false;
              }else{
                this.status = 'success';
                this.topic = response.topic;
                this.delete = true;
              }
          },
          error =>{
              this.status = 'error';
              console.log(<any>error);
          }
      );
  }


}
