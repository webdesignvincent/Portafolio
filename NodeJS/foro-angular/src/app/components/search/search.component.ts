import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Topic } from '../../models/topic';
import { TopicService } from '../../services/topic.service';

@Component({
  selector: 'app-search',
  templateUrl: '../topics/topics.component.html',
  styleUrls: ['./search.component.css'],
  providers: [TopicService]
})
export class SearchComponent implements OnInit {

  public page_title: string;
  public topics: Topic[];
  public numberPages: any[];
  public nextPage: any;
  public prevPage: any;
  public totalPages: any;
  public noPaginate: boolean;
  public status: string;

  constructor(
      private _route: ActivatedRoute,
      private _router: Router,
      private _topicService: TopicService
  ) { 
        this.page_title = 'Buscar: ';
        this.topics = [];
        this.noPaginate = false;
        this.numberPages = [];
        this.status = '';
  }

  ngOnInit(): void {
    console.log('SearchComponent Cargado');
    this._route.params.subscribe(params =>{
          let search = params['search'];
          this.page_title = this.page_title + ' ' + search;
          this.getTopics(search);
    });
  }

  getTopics(search:any){
      this._topicService.search(search).subscribe(
          response =>{
              if(response.topics){
                this.topics = response.topics;
              }
          },
          error =>{
              console.log(<any>error);
          }
      );

  }


}
