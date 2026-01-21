import { DatePipe } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { OpenAlexWork } from '@org/models';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@org/buttons';

@Component({
  selector: 'app-work-details',
  imports: [DatePipe, MatCardModule, MatDividerModule, MatIconModule, Button],
  templateUrl: './work-details.html',
  styleUrl: './work-details.scss',
})
export class WorkDetails {
  readonly data = input.required<OpenAlexWork | undefined>();
  dataId = computed(() => {
    const fullId = this.data()?.id; // ex: "https://openalex.org/W2741809807"
    if (!fullId) return undefined;

    // Récupère tout ce qui se trouve après le dernier '/'
    return fullId.split('/').pop(); // ex.W2741809807
  });
  //Extrait de la publication
  readonly abstract = computed(() => {
    const work = this.data();
    const index = work?.abstract_inverted_index;
    
    if (!index) return null;

    // Logique de reconstruction
    const entries = Object.entries(index);
    const maxIndex = Math.max(...entries.flatMap(([_, pos]) => pos));
    const result = new Array(maxIndex + 1);

    for (const [word, positions] of entries) {
      for (const pos of positions) {
        result[pos] = word;
      }
    }

    return result.join(' ');
  });
}
