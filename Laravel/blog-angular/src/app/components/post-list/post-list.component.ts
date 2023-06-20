import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  @Input() posts: any;
  @Input() identity: any;
  @Input() url: any;

  @Output() delete = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    console.log('PostListComponent Cargado!');
  }

  deletePost(id:any){
    this.delete.emit(id);
  }

}
