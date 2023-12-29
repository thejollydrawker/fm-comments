import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Comment, CommentResponse } from '../../models/comment.model';
import { Observable, Subject, map, of, tap } from 'rxjs';
import { User } from '../../models/user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommentsState, EditCommentAction, RemoveCommentAction, ReplyCommentAction, ScoreCommentAction } from '../../models/state.model';


@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  private commentsSrc$: Observable<Comment[]> = this.getComments();
  private userSrc$: Observable<User> = this.getUser();
  add$ = new Subject<string>();
  reply$ = new Subject<ReplyCommentAction>();
  edit$ = new Subject<EditCommentAction>();
  remove$ = new Subject<RemoveCommentAction>();
  score$ = new Subject<ScoreCommentAction>();

  private state = signal<CommentsState>({
    comments: [],
    currentUser: null
  });

  //selectors
  user = computed(() => this.state().currentUser);
  comments = computed(() => this.state().comments);

  constructor(private http: HttpClient) {

    //reducers
    this.commentsSrc$.pipe(takeUntilDestroyed(), tap(value => this.saveToSession(value))).subscribe(commentsList => {
      this.state.update((state) => {
        return {
          ...state,
        comments: commentsList
        }
      })
    });

    this.userSrc$.pipe(takeUntilDestroyed()).subscribe(user => {
      this.state.update((state) => {
        return {
          ...state,
        currentUser: user
        }
      })
    });

    this.add$.pipe(takeUntilDestroyed()).subscribe(newComment => {
      this.state.update(state => {
        let newState = {
          ...state,
          comments: [...state.comments, this.add(newComment)]
        }
        this.saveToSession(newState.comments);
        return newState;
      })
    });

    this.reply$.pipe(takeUntilDestroyed()).subscribe(reply => {
      this.state.update(state => {
        let newState = {
          ...state,
          comments: this.reply(reply.content, reply.repliesTo)
        }
        this.saveToSession(newState.comments);
        return newState;
      })
    });

    this.edit$.pipe(takeUntilDestroyed()).subscribe(editComment => {
      this.state.update(state => {
        let newState = {
          ...state,
          comments: this.update(editComment.comment, editComment.text, editComment.repliesTo)
        }
        this.saveToSession(newState.comments);
        return newState;
      })
    });

    this.remove$.pipe(takeUntilDestroyed()).subscribe(removeComment => {
      this.state.update(state => {
        let newState = {
          ...state,
          comments: this.deleteComment(removeComment.comment, removeComment.repliesTo)
        }
        this.saveToSession(newState.comments);
        return newState;
      })
    });

    this.score$.pipe(takeUntilDestroyed()).subscribe(score => {
      this.state.update(state => {
        let newState = {
          ...state,
          comments: this.addScore(score)
        }
        this.saveToSession(newState.comments);
        return newState;
      })
    });

  }

  saveToSession(comments: Comment[]): void {
    sessionStorage.setItem('comments', JSON.stringify(comments));
  }

  getFromSession(): Comment[] {
    return JSON.parse(sessionStorage.getItem('comments') || '[]');
  }

  getComments(): Observable<Comment[]> {
      if (this.getFromSession().length === 0) {
        return this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.comments),tap(value => {this.saveToSession(value)}));
      } else return of<Comment[]>(this.getFromSession());
    }

  getUser(): Observable<User> {
    return this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.currentUser));
  }

  add(content: string): Comment {
      return {
        id: Date.now(),
        content: content,
        createdAt: this.getToday(),
        score: 0,
        user: this.user()!,
        replies: []
      };
    }

  deleteComment(comment: Comment, repliesTo?: Comment): Comment[] {
    let commentsList = this.comments();

    repliesTo?.id === comment.id 
    ? commentsList = commentsList.filter(comm => comm.id !== comment.id)
    : commentsList.find(comm => comm.id === repliesTo?.id)!.replies =commentsList.find(comm => comm.id === repliesTo?.id)!.replies.filter(reply => reply.id !== comment.id)
    
    return [...commentsList];
  }

  reply(content: string, repliesTo: Comment): Comment[] {
    let newComment: Comment = {
      id: Date.now(),
      content: content,
      createdAt: '12/10/2023',
      score: 0,
      replyingTo: repliesTo.user.username,
      user: this.user()!,
      replies: []
    };
    let commentsList = this.comments();
    commentsList.find(comm => comm.id === repliesTo.id)?.replies.push(newComment);
    return [...commentsList];
  }

  update(comment: Comment, text: string, repliesTo: Comment): Comment[] {
    let commentsList = this.comments();
    
    if (repliesTo.id === comment.id) {
      [...commentsList].map(comm => {
        if (comm.id === comment.id) {
          comm.content = text;
        }
        return comm;
      });
    } else {
      [...commentsList].find(comm => comm.id === repliesTo.id)!.replies = commentsList.find(comm => comm.id === repliesTo.id)!.replies.map(reply => {
        if (reply.id === comment.id) {
          reply.content = text;
        } 
        return reply; 
      });
    }

    return commentsList;
  }

  addScore(score: ScoreCommentAction): Comment[] {
    return [...this.comments()].map(comm => {
      if(comm.id === score.comment.id) {
         comm = this.score(comm, score);
      } else if (comm.replies.find(reply => reply.id === score.comment.id)) {
        comm.replies.map(reply => {
          if (reply.id === score.comment.id) {
            reply = this.score(reply, score);
          }
          return reply;
        })
      }
      return comm;
    });
  }

  score(comm: Comment, action: ScoreCommentAction): Comment {
    if(!comm.scoredBy?.find(user => user.username === this.user()?.username) && comm.user.username !== this.user()?.username) {
      if (action.upvote) {
        comm.score += 1
      } else if(comm.score > 0) {
        comm.score -= 1
      }

      comm.scoredBy ? comm.scoredBy.push(this.user()!): comm.scoredBy = [this.user()!];
    }
    return comm;
  }

  getToday(): string {
    const today = new Date();
    return `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;
  }
}
