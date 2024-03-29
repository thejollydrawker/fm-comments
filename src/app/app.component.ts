import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsListComponent } from './components/comments-list/comments-list.component';
import { HttpClientModule } from '@angular/common/http';
import { AddCommentComponent } from './components/add-comment/add-comment.component';
import { ModalComponent } from './components/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, CommentsListComponent, AddCommentComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fm-comments';
}
