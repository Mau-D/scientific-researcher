import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-button',
  imports: [RouterLink],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  // label = input.required<string>();
  // styleLayer = input<string>();
  label = input.required<string>();
  variant = input<'accent-button' | 'muted-button'>('accent-button');
  routerLink = input<string | null>(null);
  href = input<string | null>(null);
  classes = computed(() => {
    return ['base', this.variant()].join(' ');
  });
  isLink = computed(() => this.href() !== null);
  isRouter = computed(() => this.routerLink() !== null);
}
