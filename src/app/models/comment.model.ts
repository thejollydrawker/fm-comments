import { User } from "./user.model";

export interface Comment {
    id: number,
    content: string,
    createdAt: string,
    score: number,
    user: User,
    replies: Comment[],
    replyingTo?: string;
}

export interface CommentResponse {
    currentUser: User;
    comments: Comment[];
}