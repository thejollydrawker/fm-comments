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
    this.initReducers();
  }

  saveToSession({ comments }: CommentsState): void {
    sessionStorage.setItem('comments', JSON.stringify(comments));
  }

  getFromSession(): Comment[] {
    return JSON.parse(sessionStorage.getItem('comments') || '[]');
  }

  initReducers(): void {
    //reducers
    this.commentsSrc$.pipe(takeUntilDestroyed(), tap(value => this.saveToSession({...this.state(), comments: value}))).subscribe(commentsList => {
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
      this.state.update(state => this.handleAddEvent(state, newComment, this.saveToSession))
    });

    this.reply$.pipe(takeUntilDestroyed()).subscribe(reply => {
      this.state.update(state => this.handleReplyEvent(state, reply, this.saveToSession))
    });

    this.edit$.pipe(takeUntilDestroyed()).subscribe(editComment => {
      this.state.update(state => this.editEventHandler(state, editComment, this.saveToSession))
    });

    this.remove$.pipe(takeUntilDestroyed()).subscribe(removeComment => {
      this.state.update(state => this.deleteEventHandler(state, removeComment, this.saveToSession))
    });

    this.score$.pipe(takeUntilDestroyed()).subscribe(score => {
      this.state.update(state => this.scoreEventHandler(state, score, this.saveToSession))
    });
  }

  getComments(): Observable<Comment[]> {
      if (this.getFromSession().length === 0) {
        return this.http.get<CommentResponse>('/assets/data/data.json')
                .pipe(map(response => response.comments ),tap( value => { this.saveToSession({...this.state(), comments: value}) }));
      } else return of<Comment[]>(this.getFromSession());
    }

  getUser(): Observable<User> {
    return this.http.get<CommentResponse>('/assets/data/data.json').pipe(map(response => response.currentUser));
  }

  newComment(content: string): Comment {
      return {
        id: Date.now(),
        content: content,
        createdAt: this.getToday(),
        score: 0,
        user: this.user()!,
        replies: []
      };
  }

  handleAddEvent(state: CommentsState, comment: string, callback: (state: CommentsState) => void): CommentsState {
    const newComment = this.newComment(comment);
    const newState = {
      ...state,
      comments: [...state.comments, newComment]
    };
    callback(newState);

    return newState;
  }

  deleteEventHandler(state: CommentsState, action: RemoveCommentAction, callback: (state: CommentsState) => void): CommentsState {
    let commentsList = [...this.comments()];

    if ( action.repliesTo?.id === action.comment.id ) {
      const indx = commentsList.findIndex(comm => comm.id == action.comment.id);

      if (indx !== -1)
        commentsList.splice(indx, 1)
    } else {
      const mainComment = commentsList.find(comm => comm.id === action.repliesTo?.id);

      if (mainComment) {
        const indx = mainComment.replies.findIndex(reply => reply.id === action.comment.id);

        if (indx !== -1)
          mainComment.replies.splice(indx, 1);
      }
    }

    const newState = {
      ...state,
      comments: commentsList
    };

    callback(newState);

    return newState;
  }

  handleReplyEvent(state: CommentsState, action: ReplyCommentAction, callback: ( state:CommentsState ) => void): CommentsState {
    const newComment: Comment = this.newComment(action.content);
    newComment.replyingTo = action.repliesTo.user.username;
    const indx = state.comments.findIndex(comm => comm.id === action.repliesTo.id);

    if (indx === -1) return { ...state };

    const commentsList = [...state.comments];
    commentsList[indx].replies.push(newComment);

    const newState = {
      ...state,
      comments: commentsList
    };

    callback(newState);

    return newState;
  }

  editEventHandler(state: CommentsState, action: EditCommentAction, callback: ( state:CommentsState ) => void): CommentsState {
    let commentsList = [...this.comments()];
    
    if (action.repliesTo.id === action.comment.id) {
      const indx = commentsList.findIndex(comm => comm.id == action.comment.id)

      if (indx !== -1) 
        commentsList[indx].content = action.text;  
    } else { 
      const mainComment = commentsList.find(comm => comm.id === action.repliesTo.id)

      if (mainComment) {
        const indx = mainComment.replies.findIndex(reply => reply.id === action.comment.id)

        if (indx !== -1) 
          mainComment.replies[indx].content = action.text;
      }
    }

    const newState = {
      ...state,
      comments: commentsList
    };

    callback(newState);

    return newState;
  }

  scoreEventHandler(state:CommentsState, action: ScoreCommentAction, callback: (state: CommentsState) => void): CommentsState {
    const commentsList = [...this.comments()].map(comm => {
      if(comm.id === action.comment.id) {
         comm = this.score(comm, action);
      } else if (comm.replies.find(reply => reply.id === action.comment.id)) {
        comm.replies.map(reply => {
          if (reply.id === action.comment.id) {
            reply = this.score(reply, action);
          }
          return reply;
        })
      }
      return comm;
    });

    const newState = {
      ...state,
      comments: commentsList
    };

    callback(newState);

    return newState;
  }

  score(comm: Comment, action: ScoreCommentAction): Comment {
    if(!comm.scoredBy?.find(user => user.username === this.user()?.username) && comm.user.username !== this.user()?.username) {
      if (action.upvote) {
        comm.score += 1;
      } else if(comm.score > 0) {
        comm.score -= 1;
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
