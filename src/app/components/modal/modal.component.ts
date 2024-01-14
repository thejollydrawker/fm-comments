import { Component, Signal } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { NgIf } from '@angular/common';
import { ModalContent } from '../../models/modal.model';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  isOpen: Signal<boolean> = this.modalSrv.isOpen;
  modal: Signal<ModalContent> = this.modalSrv.modal;

  constructor(private modalSrv: ModalService) {
  }

  cancel(): void {
    this.modalSrv.close();
  }

  apply(): void {
    this.modal().applyAction();
    this.modalSrv.close();
  }

  close(): void {
    this.modalSrv.close();
  }
}
