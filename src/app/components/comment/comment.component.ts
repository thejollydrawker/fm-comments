import { Component, Input } from '@angular/core';
import { Comment } from '../../models/comment.model';
import { AsyncPipe, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { CommentsService } from '../../services/comments/comments.service';
import { FormsModule } from '@angular/forms';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { ModalService } from '../../services/modal/modal.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    AsyncPipe,
    NgIf,
    NgClass,
    AddCommentComponent,
    FormsModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  @Input({ required: true }) comment!: Comment;
  openReply: number = 0;
  editComment: number = 0;
  updateContent: string = '';

  //currentUser$ = this.commentSrv.getUser();
  currentUser = this.commentSrv.user;

  constructor(private commentSrv: CommentsService, private modalSrv: ModalService){}

  score(comment:Comment): void {
    this.commentSrv.score$.next({ comment, upvote: true });
  }

  unscore(comment: Comment) {
    this.commentSrv.score$.next({ comment, upvote: false });
  }

  deleteComment(remove: Comment): void {
      // if (this.commentToDelete.replyingTo) {
      //   this.commentSrv.deleteComment(this.commentToDelete, this.comment);
      // } else {
      //   this.commentSrv.deleteComment(this.commentToDelete);
      // }
      this.commentSrv.remove$.next({comment: remove, repliesTo: this.comment});
  }

  updateComment(comment: Comment): void {
    if(comment.content) {
      // this.commentSrv.update(comment, this.updateContent, this.comment);
      this.commentSrv.edit$.next({comment, text: this.updateContent, repliesTo: this.comment});
      this.editComment = 0;
      this.updateContent = '';
    }
  }

  openModal(comm: Comment): void {
    this.modalSrv.open = true;
    this.modalSrv.action = () => this.deleteComment(comm);
  }

  scoredByUser(comment: Comment): boolean {
    return comment.scoredBy?.find(user => user.username === this.currentUser()?.username) !== undefined;
  }
}
