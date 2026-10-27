import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private _opened = signal(false);

  opened = this._opened.asReadonly();

  toggle() {
    this._opened.update(v => !v);
  }

  open() {
    this._opened.set(true);
  }

  close() {
    this._opened.set(false);
  }
}