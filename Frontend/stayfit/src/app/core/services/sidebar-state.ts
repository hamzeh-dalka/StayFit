import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarState {
  private collapsedSignal = signal(false);

  collapsed = this.collapsedSignal.asReadonly();

  toggle(): void {
    this.collapsedSignal.update((value) => !value);
  }
}
