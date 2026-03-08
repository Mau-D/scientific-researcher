import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OpenAlexWork } from '@org/models';
import { ResearchCard } from '@org/ui-layout';

@Component({
  selector: 'app-results',
  imports: [ResearchCard, MatProgressSpinnerModule],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  worksResult = input<OpenAlexWork[]>([]);
  isLoading = input<boolean>(false);
  error = input<Error>();
  
}
