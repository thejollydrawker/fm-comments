import { Component, EventEmitter, Output, Signal, computed } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  isOpen: Signal<boolean> = computed(() => this.modalSrv.isOpen === true);

  constructor(private modalSrv: ModalService) {
  }

  cancel(): void {
    this.modalSrv.open = false;
  }

  apply(): void {
    this.modalSrv.doAction();
    this.modalSrv.open = false;
  }
}
