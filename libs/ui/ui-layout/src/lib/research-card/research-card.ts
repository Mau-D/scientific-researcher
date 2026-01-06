import { Component, input } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { OpenAlexWork } from '@org/models';
@Component({
  selector: 'lib-research-card',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './research-card.html',
  styleUrl: './research-card.scss',
})
export class ResearchCard {
  data = input.required<OpenAlexWork | undefined>();
}
