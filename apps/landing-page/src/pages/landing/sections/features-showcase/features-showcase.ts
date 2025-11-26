import { Component } from '@angular/core';
import { MutedButton } from '@org/buttons';
import { ShowcaseItem } from './showcase.model';
import { SHOWCASE_ITEMS } from './showcase.data';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
 const THUMBUP_ICON = `
  <svg width="24px" height="24px">
     path("M 15.025 7.4995 C 15.025 3.35684 11.6686 0 7.5265 0 C 3.3844 0 0.027 3.35684 0.027 7.4995 C 0.027 11.6422 3.3844 15 7.5265 15 C 9.74562 15 15.027 14.9476 15.027 14.9476 C 15.027 14.9476 15.025 9.42374 15.025 7.4995 L 15.025 7.4995 Z M 7.472 13.029 C 4.431 13.029 1.967 10.563 1.967 7.522 C 1.967 4.482 4.431 2.017 7.472 2.017 C 10.512 2.017 12.978 4.482 12.978 7.522 C 12.978 10.563 10.512 13.029 7.472 13.029 L 7.472 13.029 Z M 13.959 13.958 L 12.959 13.958 L 12.959 12.958 L 13.959 12.958 L 13.959 13.958 L 13.959 13.958 Z")
  </svg>
`;
@Component({
  selector: 'app-features-showcase',
  imports: [MutedButton, MatSlideToggleModule, MatIconModule],
  templateUrl: './features-showcase.html',
  styleUrl: './features-showcase.css',
})

export class FeaturesShowcase {
 
  showcaseItems: ShowcaseItem[] = SHOWCASE_ITEMS;
}
