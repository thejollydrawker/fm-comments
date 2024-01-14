import { Injectable, computed, signal } from '@angular/core';
import { ModalContent } from '../../models/modal.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private initialModal = {
    title: '',
    body: '',
    showButtons: true,
    cancelAction: () => undefined,
    applyAction: () => undefined,
    cancelBtnText: '',
    applyBtnText: '',
  }

  private _isOpen = signal(false);
  isOpen = computed(() => this._isOpen());

  private _modalContent = signal<ModalContent>(this.initialModal);
  modal = computed(() => this._modalContent());

  constructor() { }

  open(modal: ModalContent) {
    this._isOpen.set(true);
    this._modalContent.set(modal);
  }

  close() {
    this._isOpen.set(false);
    this._modalContent.set(this.initialModal);
  }
}
