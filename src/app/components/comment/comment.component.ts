import { Component, Input, signal } from '@angular/core';
import { Comment } from '../../models/comment.model';
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { CommentsService } from '../../services/comments.service';
import { ModalComponent } from '../modal/modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [NgTemplateOutlet, AsyncPipe, NgIf, ModalComponent, FormsModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  @Input({ required: true }) comment!: Comment;

  openReply: number = 0;
  editComment: number = 0;
  commentToDelete?: Comment;
  openModal: boolean = false;
  replyContent:string = '';

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

  deleteComment(): void {
    if (this.commentToDelete) {
      if (this.commentToDelete.replyingTo) {
        this.commentSrv.deleteComment(this.commentToDelete, this.comment);
      } else {
        this.commentSrv.deleteComment(this.commentToDelete);
      }
  
    }
    this.openModal = false;
  }

  reply(): void {
    if (this.replyContent.length > 0) {
      this.commentSrv.reply(this.replyContent, this.comment);
      this.replyContent = '';
      this.openReply = 0;
    }
  }

  updateComment(comment: Comment): void {
    if(comment.content) {
      this.commentSrv.update(comment, comment.content, this.comment);
      this.editComment = 0;
    }
  }
}
