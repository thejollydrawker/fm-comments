import { Comment } from "./comment.model";
import { User } from "./user.model";

export interface CommentsState {
    comments: Comment[];
    currentUser: User | null;
}

export interface EditCommentAction {
    comment: Comment;
    repliesTo: Comment;
    text: string;
}

export interface ReplyCommentAction {
    content: string;
    repliesTo: Comment;
}

export interface RemoveCommentAction {
    comment: Comment;
    repliesTo: Comment;
}

export interface ScoreCommentAction {
    comment: Comment;
    upvote: boolean;
}