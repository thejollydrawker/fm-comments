import { Component, Input, signal } from '@angular/core';
import { Comment } from '../../models/comment.model';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [NgTemplateOutlet, AsyncPipe],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  @Input({ required: true }) comment!: Comment;

  openReply: number = 0;

  currentUser$ = this.commentSrv.getUser();

  constructor(private commentSrv: CommentsService){}

  score(comment:Comment): void {
    comment.score += 1;
  }

  unscore(comment: Comment) {
    if (comment.score > 0) {
      comment.score -= 1;
    }
  }
}
