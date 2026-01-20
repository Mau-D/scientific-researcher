import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@org/buttons';
import { OpenAlexWork } from '@org/models';

@Component({
  selector: 'lib-research-card',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    Button,
    DatePipe,
  ],
  templateUrl: './research-card.html',
  styleUrl: './research-card.scss',
})
export class ResearchCard {
  readonly clickedForDetails = output<string>();
onClickForDetails() {
  const id: string | undefined = this.dataId();
  this.clickedForDetails.emit(id || '');
}

  dataId = computed(() => {
    const fullId = this.data()?.id; // ex: "https://openalex.org/W2741809807"
    if (!fullId) return undefined;

    // Récupère tout ce qui se trouve après le dernier '/'
    return fullId.split('/').pop(); // ex.W2741809807
  });
  

  data = input.required<OpenAlexWork | undefined>();
  dataResult = computed(() => {
    console.log('Data in ResearchCard:', this.data());
    return this.data();
  });
}
