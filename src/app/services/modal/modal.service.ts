import { Injectable, computed, signal } from '@angular/core';

export interface ModalContent {
  title: string;
  body: string;
  showButtons: boolean;
  cancelAction: () => void;
  applyAction: () => void;
  cancelBtnText: string;
  applyBtnText: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private initialModal = {
    title: '',
    body: '',
    showButtons: true,
    cancelAction: () => { return; },
    applyAction: () => { return; },
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
