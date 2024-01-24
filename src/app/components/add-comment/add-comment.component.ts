import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { CommentsService } from '../../services/comments/comments.service';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [ AsyncPipe, FormsModule, NgIf ],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.scss'
})
export class AddCommentComponent {
  @Input() comment?: Comment;
  @Input() repliesTo?: string;
  @Input() isReply: boolean = false;
  @Output() replyEvent = new EventEmitter();
  user = this.commentSrv.user;
  content: string = '';

  constructor(private commentSrv: CommentsService){}

  postComment(): void {
    if (this.content.length > 0) {
      this.commentSrv.add$.next(this.content);
      this.content = '';
    }
  }

  reply(): void {
    if (this.content.length > 0 && this.comment) {
      this.commentSrv.reply$.next({content: this.content, repliesTo: this.comment, repliesToUser: this.repliesTo});
      this.content = '';
      this.replyEvent.emit();
    }
  }
}
