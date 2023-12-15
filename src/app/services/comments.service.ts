import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comment, CommentResponse } from '../models/comment.model';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) { }

  getComments(): Observable<Comment[]> {
    return this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.comments));
  }

  getUser(): Observable<User> {
    return this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.currentUser));
  }
}
