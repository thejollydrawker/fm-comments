import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CommentsService } from '../../services/comments.service';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [ AsyncPipe, FormsModule ],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.scss'
})
export class AddCommentComponent implements OnInit {
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
}
