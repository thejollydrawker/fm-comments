import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private _isOpen = signal(false);
  private _action = () => {};

  constructor() { }

  doAction(): void {
    this._action();
  }

  set action(func: () => void) {
    this._action = func;
  }

  get isOpen(): boolean {
    return this._isOpen();
  }

  set open(open: boolean) {
    this._isOpen.set(open);
  }
}
