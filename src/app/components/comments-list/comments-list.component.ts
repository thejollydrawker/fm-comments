import { Component, OnInit, Signal } from '@angular/core';
import { CommentsService } from '../../services/comments/comments.service';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment.model';
import { CommonModule } from '@angular/common';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-comments-list',
  standalone: true,
  imports: [ CommonModule, CommentComponent ],
  templateUrl: './comments-list.component.html',
  styleUrl: './comments-list.component.scss'
})
export class CommentsListComponent {
  comments: Signal<Comment[]> = this.commentsSrv.comments;

  constructor(private commentsSrv: CommentsService){}
}
