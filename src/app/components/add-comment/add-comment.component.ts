import { Component, Input } from '@angular/core';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [ AsyncPipe ],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.scss'
})
export class AddCommentComponent {
  user$ = this.commentSrv.getUser();

  constructor(private commentSrv: CommentsService){}
}
