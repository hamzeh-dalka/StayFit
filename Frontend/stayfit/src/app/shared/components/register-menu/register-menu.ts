import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

export type RegisterTriggerVariant = 'filled' | 'outline' | 'text';

@Component({
  selector: 'app-register-menu',
  imports: [RouterLink, MatMenuModule, MatIconModule],
  templateUrl: './register-menu.html',
  styleUrl: './register-menu.scss',
})
export class RegisterMenu {
  @Input() variant: RegisterTriggerVariant = 'filled';
}
