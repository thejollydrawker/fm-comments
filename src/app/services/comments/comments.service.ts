import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Comment, CommentResponse } from '../../models/comment.model';
import { BehaviorSubject, Observable, ReplaySubject, Subject, from, map, of, tap } from 'rxjs';
import { User } from '../../models/user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommentsState, EditCommentAction, RemoveCommentAction, ReplyCommentAction } from '../../models/state.model';


@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  // private comments = new BehaviorSubject<Comment[]>([]);
  // public readonly comments$ = this.comments.asObservable();

  // private currentUser = new BehaviorSubject<User>({image: {png:'',webp:''}, username: ''});
  // public readonly currentUser$ = this.currentUser.asObservable();

  private commentsSrc$: Observable<Comment[]> = this.getComments();
  private userSrc$: Observable<User> = this.getUser();
  add$ = new Subject<string>();
  reply$ = new Subject<ReplyCommentAction>();
  edit$ = new Subject<EditCommentAction>();
  remove$ = new Subject<RemoveCommentAction>();

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

  }

  saveToSession(comments: Comment[]): void {
    sessionStorage.setItem('comments', JSON.stringify(comments));
  }

  getFromSession(): Comment[] {
    return JSON.parse(sessionStorage.getItem('comments') || '[]');
  }

  // getComments(): Observable<Comment[]> {
  //   if (this.getFromSession().length === 0) {
  //     this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.comments),tap(value => {this.saveToSession(value),this.comments.next(value)})).subscribe();
  //   } else this.comments.next(this.getFromSession());
  //   return this.comments$;
  // }

  getComments(): Observable<Comment[]> {
      if (this.getFromSession().length === 0) {
        return this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.comments),tap(value => {this.saveToSession(value)}));
      } else return of<Comment[]>(this.getFromSession());
    }

  // getUser(): Observable<User> {
  //   if (!this.currentUser.value.username) {
  //     this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.currentUser), tap(value => this.currentUser.next(value))).subscribe();
  //   }
  //   return this.currentUser$;
  // }

  getUser(): Observable<User> {
    return this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.currentUser));
  }

  // postComment(content: string, user: User) {
  //   let newComment: Comment = {
  //     id: Date.now(),
  //     content: content,
  //     createdAt: 'Now',
  //     score: 0,
  //     user,
  //     replies: []
  //   };
  //   let commentsList = this.comments.value;
  //   commentsList.push(newComment);
  //   this.comments.next(commentsList);
  //   this.saveToSession(commentsList);
  // }

  add(content: string): Comment {
      return {
        id: Date.now(),
        content: content,
        createdAt: 'Now',
        score: 0,
        user: this.user()!,
        replies: []
      };
    }

  // deleteComment(comment: Comment, repliesTo?: Comment) {
  //   let commentsList = this.comments.value;

  //   if (!repliesTo) {
  //     commentsList = commentsList.filter(comm => comm.id !== comment.id);
  //   } else {
  //     commentsList.find(comm => comm.id === repliesTo.id)!.replies =commentsList.find(comm => comm.id === repliesTo.id)!.replies.filter(reply => reply.id !== comment.id)
  //   }
  //   this.comments.next(commentsList);
  //   this.saveToSession(commentsList);
  // }

  deleteComment(comment: Comment, repliesTo?: Comment): Comment[] {
    let commentsList = this.comments();

    repliesTo?.id === comment.id 
    ? commentsList = commentsList.filter(comm => comm.id !== comment.id)
    : commentsList.find(comm => comm.id === repliesTo?.id)!.replies =commentsList.find(comm => comm.id === repliesTo?.id)!.replies.filter(reply => reply.id !== comment.id)
    
    return [...commentsList];
  }

  // reply(content: string, repliesTo: Comment): void {
  //   let newComment: Comment = {
  //     id: Date.now(),
  //     content: content,
  //     createdAt: 'Now',
  //     score: 0,
  //     replyingTo: repliesTo.user.username,
  //     user: this.currentUser.value,
  //     replies: []
  //   };
  //   let commentsList = this.comments.value;
  //   commentsList.find(comm => comm.id === repliesTo.id)?.replies.push(newComment);
  //   this.comments.next(commentsList);
  //   this.saveToSession(commentsList);
  // }

  reply(content: string, repliesTo: Comment): Comment[] {
    let newComment: Comment = {
      id: Date.now(),
      content: content,
      createdAt: 'Now',
      score: 0,
      replyingTo: repliesTo.user.username,
      user: this.user()!,
      replies: []
    };
    let commentsList = this.comments();
    commentsList.find(comm => comm.id === repliesTo.id)?.replies.push(newComment);
    return [...commentsList];
  }

  // update(comment: Comment, text: string, repliesTo: Comment): void {
  //   // let commentsList = this.comments.value;
    
  //   // if (!repliesTo) {
  //   //   commentsList = commentsList.map(comm => {
  //   //     if (comm.id === comment.id) {
  //   //       comm.content = text;
  //   //     }
  //   //     return comm;
  //   //   });
  //   // } else {
  //   //   commentsList.find(comm => comm.id === repliesTo.id)!.replies = commentsList.find(comm => comm.id === repliesTo.id)!.replies.map(reply => {
  //   //     if (reply.id === comment.id) {
  //   //       reply.content = text;
  //   //     } 
  //   //     return reply; 
  //   //   });
  //   // }
  //   // this.comments.next(commentsList);
  //   // this.saveToSession(commentsList);
  // }

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


}
