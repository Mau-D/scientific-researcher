import { Component, input, output, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OpenAlexWork } from '@org/models';
import { ResearchFacade } from '@org/research';
import { CardWork } from '../card-work/card-work';

@Component({
  selector: 'app-results',
  imports: [MatProgressSpinnerModule, CardWork],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  facade = inject(ResearchFacade);

  worksResult = input<OpenAlexWork[]>([]);
  isLoading = input<boolean>(false);
  error = input<Error>();
  clickedForDetails = output<string>();

  onCardClicked(id: string) {
    this.clickedForDetails.emit(id);
  }
}
