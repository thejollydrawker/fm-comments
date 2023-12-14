import { Component, Input, signal } from '@angular/core';
import { Comment } from '../../models/comment.model';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  @Input({ required: true }) comment!: Comment;

  openReply: number = 0;

  score(comment:Comment): void {
    comment.score += 1;
  }

  unscore(comment: Comment) {
    if (comment.score > 0) {
      comment.score -= 1;
    }
  }
}
