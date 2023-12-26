import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../models/user.model';
import { AsyncPipe, NgIf } from '@angular/common';
import { CommentsService } from '../../services/comments.service';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [ AsyncPipe, FormsModule, NgIf ],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.scss'
})
export class AddCommentComponent implements OnInit {
  @Input() comment?: Comment;
  @Input() isReply: boolean = false;
  @Output() replyEvent = new EventEmitter();
  user$ = this.commentSrv.getUser();
  currentUser?: User;
  content: string = '';

  constructor(private commentSrv: CommentsService){}

  ngOnInit(): void {
    this.user$.subscribe(user => this.currentUser = user)
  }

  postComment(): void {
    if (this.content.length > 0 && this.currentUser) {
      this.commentSrv.postComment(this.content, this.currentUser);
      this.content = '';
    }
  }

  reply(): void {
    if (this.content.length > 0 && this.comment) {
      this.commentSrv.reply(this.content, this.comment);
      this.content = '';
      this.replyEvent.emit();
    }
  }
}
