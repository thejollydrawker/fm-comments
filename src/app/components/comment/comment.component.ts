import { Component, Input } from '@angular/core';
import { Comment } from '../../models/comment.model';
import { AsyncPipe, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { CommentsService } from '../../services/comments/comments.service';
import { FormsModule } from '@angular/forms';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { ModalService } from '../../services/modal/modal.service';
import { FormatDatePipe } from '../../pipes/format-date.pipe';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    AsyncPipe,
    NgIf,
    NgClass,
    AddCommentComponent,
    FormsModule,
    FormatDatePipe
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  @Input({ required: true }) comment!: Comment;
  openReply: number = 0;
  editComment: number = 0;
  updateContent: string = '';
  currentUser = this.commentSrv.user;

  constructor(private commentSrv: CommentsService, private modalSrv: ModalService){}

  score(comment:Comment): void {
    this.commentSrv.score$.next({ comment, upvote: true });
  }

  unscore(comment: Comment) {
    this.commentSrv.score$.next({ comment, upvote: false });
  }

  deleteComment(remove: Comment): void {
    this.commentSrv.remove$.next({comment: remove, repliesTo: this.comment});
  }

  updateComment(comment: Comment): void {
    if(comment.content) {
      this.commentSrv.edit$.next({comment, text: this.updateContent, repliesTo: this.comment});
      this.editComment = 0;
      this.updateContent = '';
    }
  }

  openModal(comm: Comment): void {
    this.modalSrv.open({
      title: 'Delete comment',
      body: 'Are you sure yoy want to delete this comment? This will remove the comment and can\'t be undone.',
      showButtons: true,
      applyAction: () => { this.deleteComment(comm); this.modalSrv.close()},
      cancelAction: () => this.modalSrv.close(),
      cancelBtnText: 'No, cancel',
      applyBtnText: 'Yes, delete'
    });
  }

  scoredByUser(comment: Comment): boolean {
    return comment.scoredBy?.find(user => user.username === this.currentUser()?.username) !== undefined;
  }
}
