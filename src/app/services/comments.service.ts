import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comment, CommentResponse } from '../models/comment.model';
import { BehaviorSubject, Observable, ReplaySubject, map, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  private comments = new BehaviorSubject<Comment[]>([]);
  public readonly comments$ = this.comments.asObservable();

  private currentUser = new BehaviorSubject<User>({image: {png:'',webp:''}, username: ''});
  public readonly currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) { }

  getComments(): Observable<Comment[]> {
    if (this.comments.value.length == 0) {
      this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.comments), tap(value => this.comments.next(value))).subscribe();
    }
    return this.comments$;
  }

  getUser(): Observable<User> {
    if (!this.currentUser.value.username) {
      this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.currentUser), tap(value => this.currentUser.next(value))).subscribe();
    }
    return this.currentUser$;
  }

  postComment(content: string, user: User) {
    let newComment: Comment = {
      id: Date.now(),
      content: content,
      createdAt: 'Now',
      score: 0,
      user,
      replies: []
    };
    let commentsList = this.comments.value;
    commentsList.push(newComment);
    this.comments.next(commentsList);
  }

  deleteComment(comment: Comment, repliesTo?: Comment) {
    let commentsList = this.comments.value;

    if (!repliesTo) {
      commentsList = commentsList.filter(comm => comm.id !== comment.id);
    } else {
      commentsList.find(comm => comm.id === repliesTo.id)!.replies =commentsList.find(comm => comm.id === repliesTo.id)!.replies.filter(reply => reply.id !== comment.id)
    }
    this.comments.next(commentsList);
  }

  reply(content: string, repliesTo: Comment): void {
    let newComment: Comment = {
      id: Date.now(),
      content: content,
      createdAt: 'Now',
      score: 0,
      replyingTo: repliesTo.user.username,
      user: this.currentUser.value,
      replies: []
    };
    let commentsList = this.comments.value;
    commentsList.find(comm => comm.id === repliesTo.id)?.replies.push(newComment);
    this.comments.next(commentsList);
  }

  update(comment: Comment, text: string, repliesTo: Comment): void {
    let commentsList = this.comments.value;
    
    if (!repliesTo) {
      commentsList = commentsList.map(comm => {
        if (comm.id === comment.id) {
          comm.content = text;
        }
        return comm;
      });
    } else {
      commentsList.find(comm => comm.id === repliesTo.id)!.replies = commentsList.find(comm => comm.id === repliesTo.id)!.replies.map(reply => { if (reply.id === comment.id) {
        reply.content = text;
      } return reply; });
    }
  }
}
